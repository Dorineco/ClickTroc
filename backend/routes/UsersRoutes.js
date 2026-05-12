import { Router } from 'express';
import usersController from '../controllers/UsersController.js';

const router = Router();

router.get('/:id', usersController.getById);

export default router;