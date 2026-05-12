import transactionService from '../services/TransactionService.js';

const transactionController = {
    async createTransaction(req, res, next) {
        try {
            const result = await transactionService.createTransaction(
                req.user.id,
                req.body
            );
            res.status(201).json(result);
        } catch (err) {
            next(err);
        }
    },

    async getMyTransactions(req, res, next) {
        try {
            const transactions = await transactionService.getMyTransactions(req.user.id);
            res.status(200).json(transactions);
        } catch (err) {
            next(err);
        }
    },

    async getTransaction(req, res, next) {
        try {
            const transaction = await transactionService.getTransaction(
                Number(req.params.id),
                req.user.id
            );
            res.status(200).json(transaction);
        } catch (err) {
            next(err);
        }
    },

    async cancelTransaction(req, res, next) {
        try {
            await transactionService.cancelTransaction(
                Number(req.params.id),
                req.user.id
            );
            res.status(200).json({ message: 'Transaction annulée.' });
        } catch (err) {
            next(err);
        }
    },

    // Le webhook ne passe pas par verifyToken — Stripe n'a pas de cookie !
    async handleWebhook(req, res, next) {
        try {
            const signature = req.headers['stripe-signature'];
            await transactionService.handleWebhook(req.body, signature);
            res.status(200).json({ received: true });
        } catch (err) {
            next(err);
        }
    },
};

export default transactionController;