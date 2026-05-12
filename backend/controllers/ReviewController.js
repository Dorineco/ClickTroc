import reviewService from '../services/ReviewService.js';

const reviewController = {
    async addReview(req, res, next) {
        try {
            const result = await reviewService.addReview(req.user.id, req.body);
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    async getSellerReviews(req, res, next) {
        try {
            const reviews = await reviewService.getSellerReviews(Number(req.params.id));
            res.status(200).json(reviews);
        } catch (err) {
            next(err);
        }
    },

    async deleteReview(req, res, next) {
        try {
            await reviewService.deleteReview(Number(req.params.id), req.user.id);
            res.status(200).json({ message: 'Avis supprimé avec succès.' });
        } catch (err) {
            next(err);
        }
    },
};

export default reviewController;