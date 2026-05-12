import authService from "../services/authServices.js";
import jwt from 'jsonwebtoken';

const accessCookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

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

            res.cookie('accessToken', accessToken, accessCookieOptions);
            res.cookie('refreshToken', refreshToken, refreshCookieOptions);
            res.status(201).json({ message: "Compte créé avec succès." });
        } catch (err) {
            next(err);
        }
    },

    async login(req, res, next) {
        try {
            console.log('login appelé');
            const { accessToken, refreshToken } = await authService.login(req.body);
            res.cookie('accessToken', accessToken, accessCookieOptions);
            res.cookie('refreshToken', refreshToken, refreshCookieOptions);
            res.status(200).json({ message: 'Connecté.' });
        } catch (err) {
            console.error('erreur login:', err);
            res.status(401).json({ error: err.message });
        }
    },


    logout(req, res) {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });
        res.status(200).json({ message: "Déconnexion réussie." });
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

    async refresh(req, res) {
        try {

            const token = req.cookies.refreshToken;

            if (!token) return res.status(401).json({ error: 'Non autorisé.' });

            const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

            const accessToken = jwt.sign(
                { id: decoded.id },
                process.env.SESSION_SECRET,
                { expiresIn: '15m' }
            );

            res.cookie('accessToken', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            });

            res.status(200).json({ message: 'Token rafraîchi.' });
        } catch (err) {
            console.error('erreur refresh:', err.message);
            res.status(401).json({ error: 'Refresh token invalide.' });
        }
    }
};


export default authController;