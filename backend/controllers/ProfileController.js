import profileService from '../services/profileServices.js';

const profileController = {
    async getProfile(req, res, next) {
        try {
            const profile = await profileService.getProfile(req.user.id);
            res.status(200).json(profile);
        } catch (err) {
            next(err);
        }
    },

    async updateProfile(req, res, next) {
        try {
            const updated = await profileService.updateProfile(req.user.id, req.body);
            console.log(req.body)
            res.status(200).json(updated);
        } catch (err) {
            next(err);
        }
    },

    async changePassword(req, res, next) {
        try {
            const { oldPassword, newPassword } = req.body;
            await profileService.changePassword(req.user.id, oldPassword, newPassword);
            res.status(200).json({ message: 'Mot de passe modifié avec succès.' });
        } catch (err) {
            next(err);
        }
    },

    async deleteAccount(req, res, next) {
        try {
            await profileService.deleteAccount(req.user.id);
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });
            res.status(200).json({ message: 'Compte supprimé avec succès.' });
        } catch (err) {
            next(err);
        }
    },
};

export default profileController;
