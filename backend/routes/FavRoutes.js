import { Router } from 'express';
import * as FavController from '../controllers/FavController.js';
import verifyToken from "../middleware/auth.js"

const router = Router();

router.get("/", verifyToken, FavController.getAll);
router.post("/:id", verifyToken, FavController.addByadID);
router.delete("/:id", verifyToken, FavController.remove);

export default router;