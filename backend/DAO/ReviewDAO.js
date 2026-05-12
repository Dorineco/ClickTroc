import pool from '../config/db.js';

export default class ReviewDAO {
    // Créer un avis
    static async create({ reviewer_id, seller_id, transaction_id, rating, comment }) {
        const [result] = await pool.query(
            `INSERT INTO reviews (reviewer_id, seller_id, transaction_id, rating, comment)
            VALUES (?, ?, ?, ?, ?)`,
            [reviewer_id, seller_id, transaction_id, rating, comment || null]
        );
        return result.insertId;
    }

    // Récupérer les avis d'un vendeur + moyenne
    static async getBySeller(seller_id) {
        const [rows] = await pool.query(
            `SELECT reviews.*,
            users.firstname AS reviewer_firstname,
            users.lastname AS reviewer_lastname,
            ROUND(AVG(reviews.rating) OVER (), 2) AS average_rating
            FROM reviews
            JOIN users ON reviews.reviewer_id = users.id
            WHERE reviews.seller_id = ?
            ORDER BY reviews.created_at DESC`, [seller_id]
            );
            return rows;
    }

    // Récupérer un avis par id
    static async getById(id) {
        const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [id]);
        return rows[0] || null;
    }

    // Vérifier si un avis existe déjà pour cette transaction
    static async findByTransaction(reviewer_id, transaction_id) {
        const [rows] = await pool.query(
            'SELECT * FROM reviews WHERE reviewer_id = ? AND transaction_id = ?',
            [reviewer_id, transaction_id]
        );
        return rows[0] || null;
    }

    // Supprimer un avis
    static async delete(id) {
        const [result] = await pool.query(
            'DELETE FROM reviews WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
}