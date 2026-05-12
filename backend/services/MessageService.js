import MessageDAO from '../DAO/MessagesDAO.js';

const messageService = {
    // Envoyer un message
    async sendMessage(sender_id, { receiver_id, content }) {
        // Vérifier qu'on ne s'envoie pas un message à soi-même
        if (sender_id === receiver_id) {
            const err = new Error('Vous ne pouvez pas vous envoyer un message.');
            err.status = 400;
            throw err;
        }

        return await MessageDAO.create({ sender_id, receiver_id, content });
    },

    // Lister ses conversations
    async getConversations(user_id) {
        return await MessageDAO.getConversations(user_id);
    },

    // Lire la conversation avec un utilisateur
    async getConversation(user_id, other_user_id) {
        return await MessageDAO.getConversation(user_id, Number(other_user_id));
    },

    // Supprimer un message
    async deleteMessage(message_id, user_id) {
        const message = await MessageDAO.getById(message_id);
        if (!message) {
            const err = new Error('Message introuvable.');
            err.status = 404;
            throw err;
        }

        // Seul l'expéditeur peut supprimer son message
        if (message.sender_id !== user_id) {
            const err = new Error('Vous ne pouvez pas supprimer ce message.');
            err.status = 403;
            throw err;
        }

        await MessageDAO.delete(message_id);
    },
};

export default messageService;
