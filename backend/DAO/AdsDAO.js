import pool from '../config/db.js';

export default class AdsDAO {
    //afficher toutes les annonces
    static async getAll() {
        const [rows] = await pool.query(`
            SELECT ads.*, 
            (SELECT image_url FROM ad_images WHERE ad_id = ads.id LIMIT 1) AS image,
            towns.name AS town_name
            FROM ads
            LEFT JOIN towns ON ads.town_id = towns.id
        `);
        return rows;
    }

    static async getById(id) {
        const [rows] = await pool.query(`
    SELECT ads.*,
    users.firstname,
    users.lastname,
    towns.name AS town_name
    FROM ads 
    JOIN users ON ads.user_id = users.id
    LEFT JOIN towns ON ads.town_id = towns.id
    WHERE ads.id = ?`, [id]);

        if (!rows[0]) return null;

        // Récupérer toutes les images
        const [images] = await pool.query(
            'SELECT image_url FROM ad_images WHERE ad_id = ?',
            [id]
        );

        return { ...rows[0], images: images.map(i => i.image_url) };
    }


    //créer une nouvelle annonce

    static async create(annonce) {
        const { title, description, price, user_id, category_id, latitude, longitude, town_id } = annonce;
        const [result] = await pool.query(
            'INSERT INTO ads (title, description, price, category_id, user_id, latitude, longitude, town_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, price, category_id, user_id, latitude || null, longitude || null, town_id || null]
        );
        return result.insertId;
    }

    //ajouter une image

    static async addImage(ad_id, image_url) {
        await pool.query(
            'INSERT INTO ad_images (ad_id, image_url) VALUES (?, ?)',
            [ad_id, image_url]
        );
    }

    //ajouter nouvelle ville dans base
    static async findOrCreateTown(townName, postalCode) {
        const [rows] = await pool.query(
            'SELECT id FROM towns WHERE name = ? AND postal_code = ?',
            [townName, postalCode]
        );
        if (rows[0]) return rows[0].id;

        // Géocodage avec ville + code postal
        let latitude = null;
        let longitude = null;
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(townName + ' ' + postalCode)}&format=json&limit=1`,
                { headers: { 'User-Agent': 'ClickTroc/1.0' } }
            );
            const data = await response.json();
            if (data[0]) {
                latitude = parseFloat(data[0].lat);
                longitude = parseFloat(data[0].lon);
            }
        } catch {
            console.log('Géocodage échoué pour:', townName);
        }

        const [result] = await pool.query(
            'INSERT INTO towns (name, postal_code, latitude, longitude) VALUES (?, ?, ?, ?)',
            [townName, postalCode, latitude, longitude]
        );
        return result.insertId;
    }
    // Supprimer une annonce
    static async delete(id) {
        // Supprimer d'abord les favoris liés
        await pool.query('DELETE FROM favorites WHERE ad_id = ?', [id]);
        // Supprimer les images liées
        await pool.query('DELETE FROM ad_images WHERE ad_id = ?', [id]);
        // Supprimer l'annonce
        const [result] = await pool.query('DELETE FROM ads WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // Mettre à jour une annonce (PUT / PATCH)
    static async update(id, data) {
        const fields = [];
        const values = [];

        if (data.title !== undefined) {
            fields.push("title = ?");
            values.push(data.title);
        }

        if (data.description !== undefined) {
            fields.push("description = ?");
            values.push(data.description);
        }

        if (data.price !== undefined) {
            fields.push("price = ?");
            values.push(data.price);
        }

        if (data.category_id !== undefined) {
            fields.push("category_id = ?");
            values.push(data.category_id);
        }

        if (fields.length === 0) return null;

        values.push(id);

        // On met à jour les champs fournis
        const [result] = await pool.query(
            `UPDATE ads SET ${fields.join(", ")} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) return null;

        // On récupère l'objet mis à jour
        return await this.getById(id);
    }


    //Suppression images et ajout image lors de la modification    
    static async deleteImage(ad_id, image_url) {
        await pool.query(
            'DELETE FROM ad_images WHERE ad_id = ? AND image_url = ?',
            [ad_id, image_url]
        );
    }

    static async getImages(ad_id) {
        const [rows] = await pool.query(
            'SELECT image_url FROM ad_images WHERE ad_id = ?',
            [ad_id]
        );
        return rows.map(r => r.image_url);
    }

    // Recherche avec filtres dynamiques

    static async search({ q, category_id, town_name, min_price, max_price, distance, searchLat, searchLng, sortBy, page = 1, limit = 12 }) {
        const conditions = [];
        const values = [];

        let distanceSelect = '';
        let havingClause = '';

        if (q) {
            conditions.push('(ads.title LIKE ? OR ads.description LIKE ?)');
            values.push(`%${q}%`, `%${q}%`);
        }

        if (category_id) {
            conditions.push('ads.category_id = ?');
            values.push(Number(category_id));
        }

        if (min_price) {
            conditions.push('ads.price >= ?');
            values.push(min_price);
        }
        if (max_price) {
            conditions.push('ads.price <= ?');
            values.push(max_price);
        }

        if (q) {
            // Découpe le mot en trigrammes
            const trigrams = [];
            for (let i = 0; i <= q.length - 3; i++) {
                trigrams.push(q.substring(i, i + 3).toLowerCase());
            }

            // Si le mot est court (moins de 3 lettres), cherche directement
            if (q.length < 3) {
                conditions.push('(ads.title LIKE ? OR ads.description LIKE ?)');
                values.push(`%${q}%`, `%${q}%`);
            } else {
                // Cherche si un trigramme correspond dans le titre ou la description
                const trigramConditions = trigrams.map(() =>
                    '(ads.title LIKE ? OR ads.description LIKE ?)'
                );
                conditions.push(`(${trigramConditions.join(' OR ')})`);
                trigrams.forEach(t => values.push(`%${t}%`, `%${t}%`));
            }
        }

        // Recherche par distance avec coordonnées GPS

        if (searchLat && searchLng && distance) {
            distanceSelect = `,
            (6371 * acos(
                LEAST(1, cos(radians(${searchLat}))
                * cos(radians(ads.latitude))
                * cos(radians(ads.longitude) - radians(${searchLng}))
                + sin(radians(${searchLat}))
                * sin(radians(ads.latitude)))
            )) AS distance`;
            havingClause = `HAVING distance <= ${Number(distance)}`;
            conditions.push('ads.latitude IS NOT NULL');
            conditions.push('ads.longitude IS NOT NULL');

        } else if (town_name) {

            // Recherche par nom de ville sans distance
            conditions.push('towns.name LIKE ?');
            values.push(`%${town_name}%`);
        }

        const where = conditions.length > 0
            ? `WHERE ${conditions.join(' AND ')}`
            : '';

        const orderClause = sortBy === 'price_asc' ? 'ORDER BY ads.price ASC' :
            sortBy === 'price_desc' ? 'ORDER BY ads.price DESC' :
                'ORDER BY ads.created_at DESC';

        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            `SELECT ads.*,
            (SELECT image_url FROM ad_images WHERE ad_id = ads.id LIMIT 1) AS image,
            towns.name AS town_name
            ${distanceSelect}
            FROM ads
            LEFT JOIN towns ON ads.town_id = towns.id
            ${where}
            ${havingClause}
            ${orderClause}
            LIMIT ${limit} OFFSET ${offset}`,
            values
        );
        // Compter le total pour calculer le nombre de pages
        const [countRows] = await pool.query(
            `SELECT COUNT(*) AS total
            FROM ads
            LEFT JOIN towns ON ads.town_id = towns.id
            ${where}`,
            values
        );

        return { ads: rows, total: countRows[0].total, page, limit };
    }
}

