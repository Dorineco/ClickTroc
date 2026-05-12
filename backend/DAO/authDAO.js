import pool from "../config/db.js";

const authDAO = {
    async findByEmail(email) {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?",
            [email,
            ]);

        return rows[0] || null;
    },

    async createUser({ email, password, firstname, lastname, town_id = null }) {
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, firstname, lastname, town_id) VALUES (?, ?, ?, ?, ?)',
            [email, password, firstname, lastname, town_id]
        );
        return result.insertId;
    },

    async saveResetToken(userId, token, expires) {
        await pool.query(
            "UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?",
            [token, expires, userId]
        );
    },

    async findByResetToken(token) {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
            [token]
        );
        return rows[0] || null;
    },

    async updatePassword(userId, hashedPassword) {
        await pool.query(
            "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
            [hashedPassword, userId]
        );
    },


};

export default authDAO;