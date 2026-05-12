import CategoriesDAO from "../DAO/CategoriesDAO.js"

export const list = async(req,res) => {
    try{
        const ads = await CategoriesDAO.list();
        res.json(ads);

    } catch (err) {
        res.status(500).json({error: "erreur serveur"});
    }


}

export const listById = async(req,res) => {
    try{
        const adsByID = await CategoriesDAO.listById(req.params.id);
        res.json(adsByID)

    } catch (err) {
        res.status(500).json({error: "erreur serveur"});
    }


}




