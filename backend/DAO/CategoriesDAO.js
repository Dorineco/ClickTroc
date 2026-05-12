import pool from '../config/db.js';

export default class CategoriesDAO {
    //afficher toutes les catégories
    static async list() {
        const [rows] = await pool.query('SELECT * FROM categories');
        return rows;
    }

    //afficher les annonces par catégories
    static async listById(id) {
        const sql = `
            SELECT 
            ads.*, 
            categories.name AS category_name 
            FROM ads 
            JOIN categories ON ads.category_id = categories.id 
            WHERE categories.id = ?
        `;
        
        // On passe l'id dans le tableau de paramètres
        const [rows] = await pool.query(sql, [id]);
        return rows;
    }
}