import authService from "../services/authServices.js";
import { accessCookieOptions, refreshCookieOptions, clearCookieOptions } from "../config/cookieOptions.js";


const authController = {
    async register(req, res, next) {
        try {
            const { email, password, firstname, lastname, town_id } = req.body;
            const { accessToken, refreshToken } = await authService.register({
                email,
                password,
                firstname,
                lastname,
                town_id,
            });

            res.cookie("accessToken", accessToken, accessCookieOptions);
            res.cookie("refreshToken", refreshToken, refreshCookieOptions);
            res.status(201).json({ message: "Compte créé avec succès." });
        } catch (err) {
            next(err);
        }
    },

    async login(req, res, next) {
        try {
            const { accessToken, refreshToken } = await authService.login(req.body);

            res.cookie("accessToken", accessToken, accessCookieOptions);
            res.cookie("refreshToken", refreshToken, refreshCookieOptions);
            res.status(200).json({ message: "Connecté." });
        } catch (err) {
            next(err);
        }
    },

    async logout(req, res, next) {
        try {
            // Révoque le refresh token en base avant d'effacer les cookies
            await authService.logout(req.cookies.refreshToken);

            res.clearCookie("accessToken", clearCookieOptions);
            res.clearCookie("refreshToken", clearCookieOptions);
            res.status(200).json({ message: "Déconnexion réussie." });
        } catch (err) {
            next(err);
        }
    },

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            const message = await authService.forgotPassword(email);
            res.status(200).json({ message });
        } catch (err) {
            next(err);
        }
    },

    async resetPassword(req, res, next) {
        try {
            const { token } = req.params;
            const { password } = req.body;

            await authService.resetPassword(token, password);
            res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
        } catch (err) {
            next(err);
        }
    },

    async refresh(req, res, next) { 
        try {
            const oldRefreshToken = req.cookies.refreshToken;
            if (!oldRefreshToken) return res.status(401).json({ error: "Non autorisé." });

            // Rotation : génère un nouvel access ET un nouveau refresh token
            const { accessToken, refreshToken } = await authService.refreshTokens(oldRefreshToken);

            res.cookie("accessToken", accessToken, accessCookieOptions);
            res.cookie("refreshToken", refreshToken, refreshCookieOptions);
            res.status(200).json({ message: "Token rafraîchi." });
        } catch (err) {
            next(err);
        }
    },
};

export default authController;