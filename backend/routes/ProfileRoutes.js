import { Router } from 'express';
import ProfileController from '../controllers/ProfileController.js';
import verifyToken from "../middleware/auth.js";
import {
    validateUpdateProfile,
    validateChangePassword,
} from '../middleware/validator.js';



const router = Router();

router.get('/', verifyToken, ProfileController.getProfile);
router.put('/', verifyToken, validateUpdateProfile, ProfileController.updateProfile);
router.put('/password', verifyToken, validateChangePassword, ProfileController.changePassword);
router.delete('/', verifyToken, ProfileController.deleteAccount);

export default router;