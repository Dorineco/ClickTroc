import argon2 from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import authDAO from "../DAO/authDAO.js";
import transporter from "../config/mailer.js";

const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";
const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000;


function createAuthTokens(userId) {
    const accessToken = jwt.sign(
        { id: userId },
        process.env.SESSION_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES }
    );

    const refreshToken = jwt.sign(
        { id: userId },
        process.env.REFRESH_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES }
    );

    return { accessToken, refreshToken };
}

function createError(message, status) {
    const error = new Error(message);
    error.status = status;
    return error;
}

function generateResetEmail(firstname, resetLink) { 
    return `
        <p>Bonjour ${firstname},</p>

        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>

        <p>
            <a href="${resetLink}">
                Cliquez ici pour choisir un nouveau mot de passe
            </a>
        </p>

        <p>Ce lien est valable <strong>1 heure</strong>.</p>

        <p>
            Si vous n'êtes pas à l'origine de cette demande,
            ignorez simplement cet email.
        </p>
    `;
}

// --- Service ---

const authService = {
    async register({ email, password, firstname, lastname, town_id }) {
        const existingUser = await authDAO.findByEmail(email);
        if (existingUser) throw createError("Cet email est déjà utilisé.", 409);

        const hashedPassword = await argon2.hash(password);

        const userId = await authDAO.createUser({
            email,
            password: hashedPassword,
            firstname,
            lastname,
            town_id,
        });

        const { accessToken, refreshToken } = createAuthTokens(userId);
        await authDAO.saveRefreshToken(userId, refreshToken);

        return { accessToken, refreshToken };
    },

    async login({ email, password }) {
        const genericError = createError("Email ou mot de passe incorrect.", 401);

        const user = await authDAO.findByEmail(email);
        if (!user) throw genericError;

        const isValid = await argon2.verify(user.password_hash, password);
        if (!isValid) throw genericError;

        const { accessToken, refreshToken } = createAuthTokens(user.id);
        await authDAO.saveRefreshToken(user.id, refreshToken);

        return { accessToken, refreshToken };
    },

    async logout(refreshToken) {
        if (refreshToken) {
            await authDAO.revokeRefreshToken(refreshToken);
        }
    },

    /**
     * Refresh Token Rotation :
     * - Vérifie que le refresh token est en base et non révoqué
     * - Si le token est déjà révoqué → possible vol → révocation totale de l'utilisateur
     * - Révoque l'ancien token et en génère deux nouveaux
     */
    async refreshTokens(oldRefreshToken) {
        let decoded;
        try {
            decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_SECRET);
        } catch {
            throw createError("Token invalide ou expiré.", 401);
        }

        const stored = await authDAO.findRefreshToken(oldRefreshToken);

        if (!stored) {
            // Token JWT valide mais absent/révoqué en base → signe de réutilisation (vol potentiel)
            await authDAO.revokeAllRefreshTokens(decoded.id);
            throw createError("Token invalide. Veuillez vous reconnecter.", 401);
        }

        // Révoque l'ancien et génère les nouveaux
        await authDAO.revokeRefreshToken(oldRefreshToken);
        const { accessToken, refreshToken } = createAuthTokens(decoded.id);
        await authDAO.saveRefreshToken(decoded.id, refreshToken);

        return { accessToken, refreshToken };
    },

    async forgotPassword(email) {
        const successMessage =
            "Si cet email existe, un lien de réinitialisation a été envoyé.";

        const user = await authDAO.findByEmail(email);
        if (!user) return successMessage;

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS);

        await authDAO.saveResetToken(user.id, resetToken, expires);


        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"Click&Troc" <${process.env.SMTP_USER}>`,
            to: user.email,
            subject: "Réinitialisation de votre mot de passe",
            html: generateResetEmail(user.firstname, resetLink),
        });

        return successMessage;
    },

    async resetPassword(token, newPassword) {
        const user = await authDAO.findByResetToken(token);
        if (!user) throw createError("Token invalide ou expiré.", 400);

        const hashedPassword = await argon2.hash(newPassword);
        await authDAO.updatePassword(user.id, hashedPassword);
        await authDAO.clearResetToken(user.id);
    },
};

export default authService;
