import Message from '../models/Messages.js';

const MessageDAO = {
    // Envoyer un message
    async create({ sender_id, receiver_id, content }) {
        const message = new Message({ sender_id, receiver_id, content });
        return await message.save();
    },

    // Lister toutes les conversations de l'utilisateur
    async getConversations(user_id) {
        // Récupère tous les messages où l'utilisateur est sender ou receiver
        // Groupé par interlocuteur avec le dernier message
        const messages = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender_id: user_id }, { receiver_id: user_id }],
                },
            },
            { $sort: { created_at: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ['$sender_id', user_id] },
                            '$receiver_id',
                            '$sender_id',
                        ],
                    },
                    last_message: { $first: '$$ROOT' },
                },
            },
            { $sort: { 'last_message.created_at': -1 } },
        ]);
        return messages;
    },

    // Lire la conversation avec un utilisateur
    async getConversation(user_id, other_user_id) {
        const messages = await Message.find({
            $or: [
                { sender_id: user_id, receiver_id: other_user_id },
                { sender_id: other_user_id, receiver_id: user_id },
            ],
        }).sort({ created_at: 1 });

        // Marquer les messages reçus comme lus
        await Message.updateMany(
            { sender_id: other_user_id, receiver_id: user_id, read: false },
            { read: true }
        );

        return messages;
    },

    // Récupérer un message par id
    async getById(id) {
        return await Message.findById(id);
    },

    // Supprimer un message
    async delete(id) {
        return await Message.findByIdAndDelete(id);
    },
};

export default MessageDAO;
