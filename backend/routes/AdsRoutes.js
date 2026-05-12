import { Router } from 'express';
import * as AdsController from '../controllers/AdsController.js';
import verifyToken from "../middleware/auth.js";
import upload from '../config/multer.js';

const router = Router();

router.get("/", AdsController.getAll);
router.get("/search", AdsController.search);
router.get("/:id", AdsController.getById);
router.put("/:id", verifyToken, AdsController.update);
router.patch("/:id", verifyToken, AdsController.update);
router.delete("/:id", verifyToken, AdsController.remove);
router.post("/", verifyToken, upload.array('images', 6), AdsController.create);
router.post("/:id/images", verifyToken, upload.array('images', 6), AdsController.addImages);
router.delete("/:id/images", verifyToken, AdsController.deleteImage);

export default router;
