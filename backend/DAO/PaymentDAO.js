import pool from '../config/db.js';

export default class PaymentsDAO {
    static async create({ transaction_id, provider, provider_payment_id, status }) {
        await pool.query(
            'INSERT INTO payments (transaction_id, provider, provider_payment_id, status) VALUES (?, ?, ?, ?)',
            [transaction_id, provider, provider_payment_id, status]
        );
    }
}