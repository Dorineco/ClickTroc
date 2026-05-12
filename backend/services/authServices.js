import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import authDAO from "../DAO/authDAO.js";
import transporter from "../config/mailer.js";

const authService = {
    async register({ email, password, firstname, lastname, town_id }) {
        // Vérification doublon email
        const existingUser = await authDAO.findByEmail(email);
        if (existingUser) {
            const err = new Error("Cet email est déjà utilisé.");
            err.status = 409;
            throw err;
        }

        // Hash du mot de passe
        const hashedPassword = await argon2.hash(password);

        // Insertion en base
        const newUserId = await authDAO.createUser({
            email,
            password: hashedPassword,
            firstname,
            lastname,
            town_id,
        });

        // Génération du JWT
        const accessToken = jwt.sign({ id: newUserId }, process.env.SESSION_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: newUserId }, process.env.REFRESH_SECRET, { expiresIn: '7d' });

        return { accessToken, refreshToken }; // ← retourne les deux
    },

    async login({ email, password }) {
        const genericError = new Error("Email ou mot de passe incorrect.");
        genericError.status = 401;

        const user = await authDAO.findByEmail(email);
        if (!user) throw genericError;

        const isValid = await argon2.verify(user.password_hash, password);
        if (!isValid) throw genericError;

        const accessToken = jwt.sign(
            { id: user.id },
            process.env.SESSION_SECRET,
            { expiresIn: '10s' }
        );
        const refreshToken = jwt.sign(
            { id: user.id },
            process.env.REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken }; // ← retourne les tokens
    },

    async forgotPassword(email) {

        // Message générique — ne pas révéler si l'email existe ou non
        const successMessage =
            "Si cet email existe, un lien de réinitialisation a été envoyé.";

        const user = await authDAO.findByEmail(email);

        if (!user) return successMessage;

        // Génération du token et de son expiration (1h)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        await authDAO.saveResetToken(user.id, resetToken, expires);

        // Envoi de l'email
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;



        const info = await transporter.sendMail({
            from: `"Click&Troc" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Réinitialisation de votre mot de passe",
            html: `
            <p>Bonjour ${user.firstname},</p>
            <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
            <p>
            <a href="${resetLink}">Cliquez ici pour choisir un nouveau mot de passe</a>
            </p>
            <p>Ce lien est valable <strong>1 heure</strong>.</p>
            <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `,
        });

        return successMessage;
    }
    ,

    async resetPassword(token, newPassword) {
        const user = await authDAO.findByResetToken(token);
        if (!user) {
            const err = new Error("Token invalide ou expiré.");
            err.status = 400;
            throw err;
        }

        const hashedPassword = await argon2.hash(newPassword);
        await authDAO.updatePassword(user.id, hashedPassword);
    },
};

export default authService;