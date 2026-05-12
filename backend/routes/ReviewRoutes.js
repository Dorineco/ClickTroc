import { Router } from 'express';
import reviewController from '../controllers/ReviewController.js';
import verifyToken from '../middleware/auth.js';
import { validateReview } from '../middleware/validator.js';

const router = Router();

router.post('/', verifyToken, validateReview, reviewController.addReview);
router.get('/seller/:id', reviewController.getSellerReviews);
router.delete('/:id', verifyToken, reviewController.deleteReview);

export default router;