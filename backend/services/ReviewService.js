import ReviewDAO from '../DAO/ReviewDAO.js';
import pool from '../config/db.js';

const reviewService = {
    // Ajouter un avis
    async addReview(reviewer_id, { seller_id, transaction_id, rating, comment }) {
        // Vérifier que le reviewer ne se note pas lui-même
        if (reviewer_id === seller_id) {
            const err = new Error('Vous ne pouvez pas vous noter vous-même.');
            err.status = 400;
            throw err;
        }

        // Vérifier que la transaction existe et appartient au reviewer
        const [transactions] = await pool.query(
            'SELECT * FROM transactions WHERE id = ? AND buyer_id = ?',
            [transaction_id, reviewer_id]
        );
        if (transactions.length === 0) {
            const err = new Error('Transaction introuvable ou non autorisée.');
            err.status = 403;
            throw err;
        }

        // Vérifier qu'un avis n'existe pas déjà pour cette transaction
        const existing = await ReviewDAO.findByTransaction(reviewer_id, transaction_id);
        if (existing) {
            const err = new Error('Vous avez déjà laissé un avis pour cette transaction.');
            err.status = 409;
            throw err;
        }

        const id = await ReviewDAO.create({
            reviewer_id,
            seller_id,
            transaction_id,
            rating,
            comment,
        });

        return { id };
    },

    // Récupérer les avis d'un vendeur
    async getSellerReviews(seller_id) {
        const reviews = await ReviewDAO.getBySeller(seller_id);
        return reviews;
    },

    // Supprimer un avis
    async deleteReview(review_id, user_id) {
        const review = await ReviewDAO.getById(review_id);
        if (!review) {
            const err = new Error('Avis introuvable.');
            err.status = 404;
            throw err;
        }

        // Vérifier que c'est bien l'auteur qui supprime
        if (review.reviewer_id !== user_id) {
            const err = new Error('Vous ne pouvez pas supprimer cet avis.');
            err.status = 403;
            throw err;
        }

        await ReviewDAO.delete(review_id);
    },
};

export default reviewService;