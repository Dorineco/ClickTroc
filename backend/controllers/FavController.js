import FavDAO from '../DAO/FavDAO.js';

//afficher tous les favoris
export const getAll = async (req,res) => {
    try {
        const fav = await FavDAO.getAll(req.user.id);
        res.json(fav);
        } catch (err) {
            res.status(500).json({ error: "Erreur serveur"});
        }
};

//ajouter un favori
export const addByadID = async(req,res) => {
    try {
    const addFav =  await FavDAO.addByadID({
    user_id: req.user.id,
    ad_id: req.params.id
});
    res.status(201).json({ id: addFav });

    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }
};

//supprimer un favori
export const remove = async (req, res) => {
    try {
        const deleted = await FavDAO.remove(req.user.id, req.params.id);
        if (!deleted) return res.status(404).json({ error: "Favori introuvable" });
        res.status(200).json({ message: "Favori supprimé." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur delete" });
    }
};

