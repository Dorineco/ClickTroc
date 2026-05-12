import pool from '../config/db.js';

export default class FavDAO {
    //afficher tous les favoris
    static async getAll(user_id) {
        const [rows] = await pool.query('SELECT * FROM favorites WHERE user_id = ?', [user_id]);
        return rows;
    }
    //ajouter by adID
    static async addByadID(favori) {
        const {user_id, ad_id} = favori;
        const [result] = await pool.query(
            'INSERT INTO favorites (user_id, ad_id) VALUES (?, ?)',
            [user_id, ad_id]
        );
        return result.insertId
        }

    //retirer des favoris
    static async remove(user_id, ad_id) {
    const [result] = await pool.query(
        'DELETE FROM favorites WHERE user_id = ? AND ad_id = ?', 
        [user_id, ad_id]
    );
    return result.affectedRows > 0;
}

}