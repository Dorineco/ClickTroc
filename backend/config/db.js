import mysql from 'mysql2';
import dotenv from 'dotenv';
dotenv.config();

//création d'un pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10, // nombre max de connexions simultanées
    queueLimit: 0
})

//test de connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Erreur connexion BDD :", err);
    } else {
        console.log("✅ Connecté à la BDD MySQL");
        connection.release(); // Important: release la connexion
    }
});

//export de la promise pour async/await
export default pool.promise();