import UsersDAO from '../DAO/UsersDAO.js';

const usersController = {
    async getById(req, res, next) {
        try {
            const user = await UsersDAO.getById(req.params.id);
            if (!user) return res.status(404).json({ error: 'Utilisateur introuvable.' });
            res.json(user);
        } catch (err) {
            next(err);
        }
    }
};

export default usersController;