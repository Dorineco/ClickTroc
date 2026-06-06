import pool from '../config/db.js';

export default class ProfileDAO {
    //afficher le profil utilisateur
    static async getById(user_id) {
        const [rows] = await pool.query('SELECT id, email, firstname, lastname, town_id, created_at FROM users WHERE id = ?', [user_id]);
        return rows[0] || null;
    };

    //afficher les annonces de l'utilisateur
    static async getAds(user_id) {
        const [rows] = await pool.query(`
    SELECT ads.*, 
    (SELECT image_url FROM ad_images WHERE ad_id = ads.id LIMIT 1) AS image
    FROM ads 
    WHERE ads.user_id = ?
    `, [user_id]);
        return rows;
    }

    //afficher ses favoris
    static async getFavorites(user_id) {
        const [rows] = await pool.query(`
    SELECT ads.*,
    (SELECT image_url FROM ad_images WHERE ad_id = ads.id LIMIT 1) AS image
    FROM favorites 
    JOIN ads ON favorites.ad_id = ads.id 
    WHERE favorites.user_id = ?
    `, [user_id]);
        return rows;
    }

    // modifie email, prénom, nom, ville
    static async update(user_id, data) {

        const fields = [];
        const values = [];

        if (data.email !== undefined) {
            fields.push('email = ?');
            values.push(data.email);
        }
        if (data.firstname !== undefined) {
            fields.push('firstname = ?');
            values.push(data.firstname);
        }
        if (data.lastname !== undefined) {
            fields.push('lastname = ?');
            values.push(data.lastname);
        }
        if (data.town_id !== undefined) {
            fields.push('town_id = ?');
            values.push(data.town_id);
        }

        
        if (fields.length === 0) return null;

        values.push(user_id);

        await pool.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return await this.getById(user_id);
    }

    //modifier le mot de passe
    static async updatePWD(user_id, hashedPwd) {
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?',
            [hashedPwd, user_id]
        );

    }

    // Supprimer les favoris de l'utilisateur
    static async deleteFavorites(user_id) {
        await pool.query('DELETE FROM favorites WHERE user_id = ?', [user_id]);
    }

    // Supprimer les annonces de l'utilisateur
    static async deleteAds(user_id) {
        await pool.query('DELETE FROM ads WHERE user_id = ?', [user_id]);
    }

    // Supprimer le compte
    static async delete(user_id) {
        await pool.query('DELETE FROM users WHERE id = ?', [user_id]);
    }

    //Ajout des transactions
    
    static async getTransactions(user_id) {
        const [rows] = await pool.query(`
        SELECT transactions.*, ads.title AS ad_title, ads.price AS ad_price,
        (SELECT image_url FROM ad_images WHERE ad_id = ads.id LIMIT 1) AS ad_image
        FROM transactions
        JOIN ads ON transactions.ad_id = ads.id
        WHERE transactions.buyer_id = ?
        ORDER BY transactions.created_at DESC
    `, [user_id]);
        return rows;
    }
}