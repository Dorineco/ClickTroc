import Stripe from 'stripe';
import TransactionDAO from '../DAO/PTDAO.js';
import AdsDAO from '../DAO/AdsDAO.js';
import PaymentsDAO from '../DAO/PaymentDAO.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const transactionService = {
    // Créer une transaction + PaymentIntent Stripe
    async createTransaction(buyer_id, { ad_id }) {
        // Récupérer l'annonce
        const ad = await AdsDAO.getById(ad_id);
        if (!ad) {
            const err = new Error('Annonce introuvable.');
            err.status = 404;
            throw err;
        }

        // Vérifier que l'acheteur n'est pas le vendeur
        if (ad.user_id === buyer_id) {
            const err = new Error('Vous ne pouvez pas acheter votre propre annonce.');
            err.status = 400;
            throw err;
        }

        // Créer la transaction en base (status: pending)
        const transaction_id = await TransactionDAO.create({
            buyer_id,
            seller_id: ad.user_id,
            ad_id,
            amount: ad.price,
        });

        // Créer le PaymentIntent chez Stripe

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(ad.price * 100),
            currency: 'eur',
            metadata: { transaction_id: String(transaction_id) },
        });

        return {
            transaction_id,
            client_secret: paymentIntent.client_secret,
        };
    },

    // Récupérer les transactions de l'acheteur connecté
    async getMyTransactions(buyer_id) {
        return await TransactionDAO.getByBuyer(buyer_id);
    },

    // Récupérer une transaction par id
    async getTransaction(id, user_id) {
        const transaction = await TransactionDAO.getById(id);
        if (!transaction) {
            const err = new Error('Transaction introuvable.');
            err.status = 404;
            throw err;
        }

        // Vérifier que l'utilisateur est bien l'acheteur ou le vendeur
        if (transaction.buyer_id !== user_id && transaction.seller_id !== user_id) {
            const err = new Error('Accès non autorisé.');
            err.status = 403;
            throw err;
        }

        return transaction;
    },

    // Annuler une transaction
    async cancelTransaction(id, user_id) {
        const transaction = await TransactionDAO.getById(id);
        if (!transaction) {
            const err = new Error('Transaction introuvable.');
            err.status = 404;
            throw err;
        }

        if (transaction.buyer_id !== user_id) {
            const err = new Error('Vous ne pouvez pas annuler cette transaction.');
            err.status = 403;
            throw err;
        }

        if (transaction.status !== 'pending') {
            const err = new Error('Seules les transactions en attente peuvent être annulées.');
            err.status = 400;
            throw err;
        }

        await TransactionDAO.updateStatus(id, 'cancelled');
    },

    // Webhook Stripe — confirme le paiement
    async handleWebhook(rawBody, signature) {
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET
            );
        } catch {
            const err = new Error('Webhook invalide.');
            err.status = 400;
            throw err;
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const transaction_id = paymentIntent.metadata.transaction_id;

            await TransactionDAO.updateStatus(Number(transaction_id), 'completed');

            await PaymentsDAO.create({
                transaction_id: Number(transaction_id),
                provider: 'stripe',
                provider_payment_id: paymentIntent.id,
                status: 'succeeded',
            });
        }
    },
};

export default transactionService;