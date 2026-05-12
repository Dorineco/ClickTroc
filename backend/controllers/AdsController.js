import AdsDAO from "../DAO/AdsDAO.js";
import TownsDAO from '../DAO/TownsDAO.js';

export const getAll = async (req, res) => {
    try {
        const ads = await AdsDAO.getAll();
        res.json(ads);
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur" });
    }

};


export const getById = async (req, res) => {
    try {
        const ads = await AdsDAO.getById(Number(req.params.id));
        if (!ads) return res.status(404).json({ error: "Introuvable" });
        res.json(ads);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

export const create = async (req, res) => {
    try {
        // Trouver ou créer la ville
        let town_id = null;
        if (req.body.town_name) {
            town_id = await AdsDAO.findOrCreateTown(req.body.town_name, req.body.postal_code);
        }

        // Récupérer les coordonnées de la ville
        let latitude = null;
        let longitude = null;
        if (town_id) {
            const town = await TownsDAO.getById(town_id);
            if (town) {
                latitude = town.latitude;
                longitude = town.longitude;
            }
        }

        console.log('latitude:', latitude, 'longitude:', longitude);

        const adId = await AdsDAO.create({
            ...req.body,
            town_id,
            latitude,
            longitude,
            user_id: req.user.id,
        });

        if (req.files && req.files.length > 0) {
            await Promise.all(
                req.files.map(file => AdsDAO.addImage(adId, `/uploads/${file.filename}`))
            );
        }

        res.status(201).json({ id: adId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur création" });
    }
};

export const update = async (req, res) => {
    try {
        const ad = await AdsDAO.update(Number(req.params.id), req.body);

        if (!ad) {
            return res.status(404).json({ error: "Introuvable" });
        }

        res.json(ad);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur update" });
    }
};

export const remove = async (req, res) => {
    try {
        const deleted = await AdsDAO.delete(Number(req.params.id));
        if (!deleted) return res.status(404).json({ error: "Introuvable" });
        res.status(200).json({ message: "Annonce supprimée." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Recherche

export const search = async (req, res) => {
    try {
        const { q, category_id, town_name, postal_code, min_price, max_price, distance, searchLat: rawLat, searchLng: rawLng, sortBy, page } = req.query;

        const searchLat = rawLat ? parseFloat(rawLat) : null;
        const searchLng = rawLng ? parseFloat(rawLng) : null;

        if (town_name && distance) {
            // Géocoder la ville recherchée
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(town_name + ' ' + (postal_code || ''))}&format=json&limit=1`,
                { headers: { 'User-Agent': 'ClickTroc/1.0' } }
            );
            const data = await response.json();
            if (data[0]) {
                searchLat = parseFloat(data[0].lat);
                searchLng = parseFloat(data[0].lon);
            }
        }

        const results = await AdsDAO.search({
            q,
            category_id: category_id ? Number(category_id) : undefined,
            town_name: town_name || undefined,
            min_price: min_price ? Number(min_price) : undefined,
            max_price: max_price ? Number(max_price) : undefined,
            distance: distance ? Number(distance) : undefined,
            searchLat: searchLat ? parseFloat(searchLat) : undefined,
            searchLng: searchLng ? parseFloat(searchLng) : undefined,
            sortBy,
            page: page ? Number(page) : 1,
            limit: 12,
        });


        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur search' });
    }
};

export const addImages = async (req, res) => {
    try {
        const adId = Number(req.params.id);
        if (req.files && req.files.length > 0) {
            await Promise.all(
                req.files.map(file => AdsDAO.addImage(adId, `/uploads/${file.filename}`))
            );
        }
        const images = await AdsDAO.getImages(adId);
        res.status(200).json({ images });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

export const deleteImage = async (req, res) => {
    try {
        const adId = Number(req.params.id);
        const { image_url } = req.body;
        await AdsDAO.deleteImage(adId, image_url);
        res.status(200).json({ message: 'Image supprimée.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

