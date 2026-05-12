import { Router } from 'express';
import townsController from '../controllers/TownsController.js';

const router = Router();

router.get('/', townsController.getAll);

export default router;