import argon2 from 'argon2';
import ProfileDAO from '../DAO/ProfileDAO.js';
import authDAO from '../DAO/authDAO.js';

const profileService = {

    // Récupérer le profil complet
    async getProfile(user_id) {
        const user = await ProfileDAO.getById(user_id);
        if (!user) {
            const err = new Error('Utilisateur introuvable.');
            err.status = 404;
            throw err;
        }

        const [ads, favorites, transactions] = await Promise.all([
            ProfileDAO.getAds(user_id),
            ProfileDAO.getFavorites(user_id),
            ProfileDAO.getTransactions(user_id),
        ]);

        return { ...user, ads, favorites, transactions };
    },

    // Mettre à jour le profil
    async updateProfile(user_id, data) {

        // Si l'email est modifié, vérifier qu'il n'est pas pris
        if (data.email) {
            const existingUser = await authDAO.findByEmail(data.email);
            if (existingUser && existingUser.id !== user_id) {
                const err = new Error('Cet email est déjà utilisé.');
                err.status = 409;
                throw err;
            }
        }

       
        const updated = await ProfileDAO.update(user_id, data);
        if (!updated) {
            const err = new Error('Aucune modification effectuée.');
            err.status = 400;
            throw err;
        }

        return updated;
    },

    // Changer le mot de passe
    async changePassword(user_id, oldPassword, newPassword) {
        const user = await ProfileDAO.getById(user_id);
        if (!user) {
            const err = new Error('Utilisateur introuvable.');
            err.status = 404;
            throw err;
        }

        // Récupérer le hash via authDAO
        const userWithPassword = await authDAO.findByEmail(user.email);
        const isValid = await argon2.verify(userWithPassword.password_hash, oldPassword);
        if (!isValid) {
            const err = new Error('Ancien mot de passe incorrect.');
            err.status = 401;
            throw err;
        }

        const hashedPassword = await argon2.hash(newPassword);
        await ProfileDAO.updatePWD(user_id, hashedPassword);
    },

    // Supprimer le compte
    async deleteAccount(user_id) {
        await ProfileDAO.deleteFavorites(user_id);
        await ProfileDAO.deleteAds(user_id);
        await ProfileDAO.delete(user_id);
    },
};

export default profileService;