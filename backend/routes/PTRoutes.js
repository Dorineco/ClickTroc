import { Router } from 'express';
import transactionController from '../controllers/PTController.js';
import verifyToken from '../middleware/auth.js';
import express from 'express';

const router = Router();

// ⚠️ Le webhook doit recevoir le raw body — avant express.json()
router.post(
'/webhook',
express.raw({ type: 'application/json' }),
transactionController.handleWebhook
);

router.post('/', verifyToken, transactionController.createTransaction);
router.get('/', verifyToken, transactionController.getMyTransactions);
router.get('/:id', verifyToken, transactionController.getTransaction);
router.patch('/:id/cancel', verifyToken, transactionController.cancelTransaction);

export default router;