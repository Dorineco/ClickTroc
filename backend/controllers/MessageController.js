import messageService from '../services/MessageService.js';

const messageController = {
    async sendMessage(req, res, next) {
        try {
            const message = await messageService.sendMessage(req.user.id, req.body);
            res.status(201).json(message);
        } catch (err) {
            next(err);
        }
    },

    async getConversations(req, res, next) {
        try {
            const conversations = await messageService.getConversations(req.user.id);
            res.status(200).json(conversations);
        } catch (err) {
            next(err);
        }
    },

    async getConversation(req, res, next) {
        try {
            const messages = await messageService.getConversation(
                req.user.id,
                req.params.user_id
            );
            res.status(200).json(messages);
        } catch (err) {
            next(err);
        }
    },

    async deleteMessage(req, res, next) {
        try {
            await messageService.deleteMessage(req.params.id, req.user.id);
            res.status(200).json({ message: 'Message supprimé.' });
        } catch (err) {
            next(err);
        }
    },
};

export default messageController;

