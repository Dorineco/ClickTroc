import pool from '../config/db.js';

export default class UsersDAO {
    static async getById(id) {
        const [rows] = await pool.query(
            'SELECT id, firstname, lastname FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }
}