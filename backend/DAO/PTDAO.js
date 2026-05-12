import pool from '../config/db.js';

export default class TransactionDAO {
    // Créer une transaction
    static async create({ buyer_id, seller_id, ad_id, amount }) {
        const [result] = await pool.query(
            `INSERT INTO transactions (buyer_id, seller_id, ad_id, amount, status)
            VALUES (?, ?, ?, ?, 'pending')`,
            [buyer_id, seller_id, ad_id, amount]
        );
        return result.insertId;
    }

    // Récupérer une transaction par id
    static async getById(id) {
        const [rows] = await pool.query(
            'SELECT * FROM transactions WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    // Lister les transactions d'un acheteur
    static async getByBuyer(buyer_id) {
        const [rows] = await pool.query(
            `SELECT transactions.*, ads.title AS ad_title
            FROM transactions
            JOIN ads ON transactions.ad_id = ads.id
            WHERE transactions.buyer_id = ?
            ORDER BY transactions.created_at DESC`,
            [buyer_id]
        );
        return rows;
    }

    // Mettre à jour le statut
    static async updateStatus(id, status) {
        await pool.query(
            'UPDATE transactions SET status = ? WHERE id = ?',
            [status, id]
        );
    }
}