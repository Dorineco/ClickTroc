import pool from '../config/db.js';

// ============================================================
// Cache mémoire simple (TTL 60s)
// ============================================================
const cache = new Map();

function cacheGet(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
    return entry.value;
}

function cacheSet(key, value, ttlMs = 60_000) {
    cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}

function cacheInvalidate(pattern) {
    for (const key of cache.keys()) {
        if (key.startsWith(pattern)) cache.delete(key);
    }
}

// ============================================================
// Sous-requête réutilisable pour la première image
// Remplace les SELECT imbriqués N+1 par un seul LEFT JOIN
// ============================================================
const IMAGE_JOIN = `
    LEFT JOIN (
        SELECT ad_id, MIN(image_url) AS image_url
        FROM ad_images
        GROUP BY ad_id
    ) ai ON ai.ad_id = ads.id
`;

export default class AdsDAO {

    // --------------------------------------------------------
    // Toutes les annonces (avec cache 60s)
    // --------------------------------------------------------
    static async getAll() {
        const cached = cacheGet('all_ads');
        if (cached) return cached;

        const [rows] = await pool.query(`
            SELECT ads.*,
                ai.image_url AS image,
                towns.name AS town_name
            FROM ads
            ${IMAGE_JOIN}
            LEFT JOIN towns ON ads.town_id = towns.id
            ORDER BY ads.created_at DESC
        `);

        cacheSet('all_ads', rows);
        return rows;
    }

    // --------------------------------------------------------
    // Annonce par ID
    // --------------------------------------------------------
    static async getById(id) {
        const [rows] = await pool.query(`
            SELECT ads.*,
                users.firstname,
                users.lastname,
                towns.name AS town_name
            FROM ads
            JOIN users ON ads.user_id = users.id
            LEFT JOIN towns ON ads.town_id = towns.id
            WHERE ads.id = ?
        `, [id]);

        if (!rows[0]) return null;

        // Pour le détail d'une annonce on récupère TOUTES les images
        
        const [images] = await pool.query(
            'SELECT image_url FROM ad_images WHERE ad_id = ?', [id]
        );

        return { ...rows[0], images: images.map(i => i.image_url) };
    }

    // --------------------------------------------------------
    // Créer une annonce
    // --------------------------------------------------------
    static async create(annonce) {
        const { title, description, price, user_id, category_id, latitude, longitude, town_id } = annonce;
        const [result] = await pool.query(
            'INSERT INTO ads (title, description, price, category_id, user_id, latitude, longitude, town_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, price, category_id, user_id, latitude || null, longitude || null, town_id || null]
        );
        cacheInvalidate('all_ads');
        return result.insertId;
    }

    // --------------------------------------------------------
    // Trouver ou créer une ville — SANS géocodage
    // Les coords sont fournies par le Controller via GeocodingService
    // --------------------------------------------------------
    static async findOrCreateTown(townName, postalCode, latitude = null, longitude = null) {
        const [rows] = await pool.query(
            'SELECT id FROM towns WHERE name = ? AND postal_code = ?',
            [townName, postalCode]
        );
        if (rows[0]) return rows[0].id;

        const [result] = await pool.query(
            'INSERT INTO towns (name, postal_code, latitude, longitude) VALUES (?, ?, ?, ?)',
            [townName, postalCode, latitude, longitude]
        );
        return result.insertId;
    }

    // --------------------------------------------------------
    // Ajouter une image
    // --------------------------------------------------------
    static async addImage(ad_id, image_url) {
        await pool.query(
            'INSERT INTO ad_images (ad_id, image_url) VALUES (?, ?)',
            [ad_id, image_url]
        );
    }

    // --------------------------------------------------------
    // Supprimer une annonce
    // --------------------------------------------------------
    static async delete(id) {
        await pool.query('DELETE FROM favorites WHERE ad_id = ?', [id]);
        await pool.query('DELETE FROM ad_images WHERE ad_id = ?', [id]);
        const [result] = await pool.query('DELETE FROM ads WHERE id = ?', [id]);
        cacheInvalidate('all_ads');
        return result.affectedRows > 0;
    }

    // --------------------------------------------------------
    // Mettre à jour une annonce
    // --------------------------------------------------------
    static async update(id, data) {
        const fields = [];
        const values = [];

        if (data.title !== undefined)       { fields.push("title = ?");       values.push(data.title); }
        if (data.description !== undefined) { fields.push("description = ?"); values.push(data.description); }
        if (data.price !== undefined)       { fields.push("price = ?");       values.push(data.price); }
        if (data.category_id !== undefined) { fields.push("category_id = ?"); values.push(data.category_id); }

        if (fields.length === 0) return null;

        values.push(id);
        const [result] = await pool.query(
            `UPDATE ads SET ${fields.join(", ")} WHERE id = ?`, values
        );

        if (result.affectedRows === 0) return null;
        cacheInvalidate('all_ads');
        return await this.getById(id);
    }

    // --------------------------------------------------------
    // Images
    // --------------------------------------------------------
    static async deleteImage(ad_id, image_url) {
        await pool.query(
            'DELETE FROM ad_images WHERE ad_id = ? AND image_url = ?',
            [ad_id, image_url]
        );
    }

    static async getImages(ad_id) {
        const [rows] = await pool.query(
            'SELECT image_url FROM ad_images WHERE ad_id = ?', [ad_id]
        );
        return rows.map(r => r.image_url);
    }

    // --------------------------------------------------------
    // Recherche principale
    // --------------------------------------------------------
    static async search({
        q, category_id, town_name,
        min_price, max_price,
        distance, searchLat, searchLng,
        sortBy, page = 1, limit = 12,
        fuzzy = false
    }) {
        const conditions = [];
        const values = [];
        let distanceSelect = '';
        let havingClause = '';

        if (q) {
            if (fuzzy) {
                conditions.push(`(
                    SOUNDEX(ads.title) = SOUNDEX(?)
                    OR ads.title LIKE ?
                    OR ads.description LIKE ?
                )`);
                values.push(q, `%${q}%`, `%${q}%`);
            } else if (q.length >= 3) {
                conditions.push('MATCH(ads.title, ads.description) AGAINST(? IN BOOLEAN MODE)');
                values.push(`${q}*`);
            } else {
                conditions.push('(ads.title LIKE ? OR ads.description LIKE ?)');
                values.push(`%${q}%`, `%${q}%`);
            }
        }

        if (category_id) {
            conditions.push('ads.category_id = ?');
            values.push(Number(category_id));
        }

        if (min_price) { conditions.push('ads.price >= ?'); values.push(min_price); }
        if (max_price) { conditions.push('ads.price <= ?'); values.push(max_price); }

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
            conditions.push('towns.name LIKE ?');
            values.push(`%${town_name}%`);
        }

        const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const orderClause =
            sortBy === 'price_asc'  ? 'ORDER BY ads.price ASC' :
            sortBy === 'price_desc' ? 'ORDER BY ads.price DESC' :
                                    'ORDER BY ads.created_at DESC';
        const offset = (page - 1) * limit;

        const [rows] = await pool.query(
            `SELECT SQL_CALC_FOUND_ROWS
                ads.*,
                ai.image_url AS image,
                towns.name AS town_name
                ${distanceSelect}
            FROM ads
            ${IMAGE_JOIN}
            LEFT JOIN towns ON ads.town_id = towns.id
            ${where}
            ${havingClause}
            ${orderClause}
            LIMIT ${limit} OFFSET ${offset}`,
            values
        );

        const [[{ total }]] = await pool.query('SELECT FOUND_ROWS() AS total');
        return { ads: rows, total, page, limit };
    }

    static async searchFuzzy(params) {
        return this.search({ ...params, fuzzy: true });
    }
}