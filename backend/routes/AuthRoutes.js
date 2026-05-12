import { Router } from "express";
import  authController from "../controllers/AuthController.js";

import {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
} from "../middleware/validator.js";



const authRouter = Router();

authRouter.post("/register", validateRegister, authController.register);
authRouter.post("/login", validateLogin, authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/forgot-password", validateForgotPassword, authController.forgotPassword);
authRouter.post("/reset-password/:token", validateResetPassword, authController.resetPassword);
authRouter.post('/refresh', authController.refresh);

export default authRouter;