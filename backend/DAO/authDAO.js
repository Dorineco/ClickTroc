import pool from "../config/db.js";
import crypto from "crypto";


function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}

const authDAO = {
    async findByEmail(email) {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        return rows[0] || null;
    },

    async createUser({ email, password, firstname, lastname, town_id = null }) {
        const [result] = await pool.query(
            "INSERT INTO users (email, password_hash, firstname, lastname, town_id) VALUES (?, ?, ?, ?, ?)",
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

    async clearResetToken(userId) {
        await pool.query(
            "UPDATE users SET reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
            [userId]
        );
    },


    async saveRefreshToken(userId, token) {
        const tokenHash = hashToken(token);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await pool.query(
            "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
            [userId, tokenHash, expiresAt]
        );
    },


    async findRefreshToken(token) {
        const tokenHash = hashToken(token);
        const [rows] = await pool.query(
            "SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked = false AND expires_at > NOW()",
            [tokenHash]
        );
        return rows[0] || null;
    },


    async revokeRefreshToken(token) {
        const tokenHash = hashToken(token);
        await pool.query(
            "UPDATE refresh_tokens SET revoked = true WHERE token_hash = ?",
            [tokenHash]
        );
    },


    async revokeAllRefreshTokens(userId) {
        await pool.query(
            "UPDATE refresh_tokens SET revoked = true WHERE user_id = ?",
            [userId]
        );
    },

    async updatePassword(userId, hashedPassword) {
        await pool.query(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            [hashedPassword, userId]
        );
    },
};

export default authDAO;

