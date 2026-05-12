import { Router } from 'express';
import  * as CategoriesController from '../controllers/CategoriesController.js';

const router = Router();

router.get("/", CategoriesController.list);
router.get("/:id", CategoriesController.listById);

export default router;