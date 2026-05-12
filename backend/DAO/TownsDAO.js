import pool from '../config/db.js';

export default class TownsDAO {
    static async getById(id) {
        const [rows] = await pool.query(
            'SELECT id, name, latitude, longitude FROM towns WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }

    static async getAll() {
        const [rows] = await pool.query(
            'SELECT id, name FROM towns ORDER BY name'
        );
        return rows;
    }
}