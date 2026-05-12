import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender_id: {
            type: Number,
            required: true,
        },
        receiver_id: {
            type: Number,
            required: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
    }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
