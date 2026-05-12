import TownsDAO from '../DAO/TownsDAO.js';

const townsController = {
    async getAll(req, res, next) {
        try {
            const towns = await TownsDAO.getAll();
            res.json(towns);
        } catch (err) {
            next(err);
        }
    }
};

export default townsController;