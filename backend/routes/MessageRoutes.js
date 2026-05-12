import { Router } from 'express';
import messageController from '../controllers/MessageController.js';
import verifyToken from '../middleware/auth.js';

const router = Router();

router.post('/', verifyToken, messageController.sendMessage);
router.get('/', verifyToken, messageController.getConversations);
router.get('/:user_id', verifyToken, messageController.getConversation);
router.delete('/:id', verifyToken, messageController.deleteMessage);

export default router;