import AdsDAO from "../DAO/AdsDAO.js";
import TownsDAO from '../DAO/TownsDAO.js';
import GeocodingService from '../services/GeocodingService.js';

// ============================================================
// Validation des paramètres géographiques
// Empêche toute injection SQL dans les expressions interpolées
// ============================================================

/**
 * Parse et valide un float dans des bornes strictes.
 * Retourne null si la valeur est absente, non numérique, ou hors bornes.
 */
function toSafeFloat(val, min, max) {
    if (val === undefined || val === null || val === '') return null;
    const n = parseFloat(val);
    if (isNaN(n) || n < min || n > max) return null;
    return n;
}

/**
 * Valide les paramètres géographiques d'une requête de recherche.
 * Retourne les valeurs assainies ou une erreur.
 */
function validateGeoParams(rawLat, rawLng, rawDistance) {
    const searchLat  = toSafeFloat(rawLat,      -90,   90);
    const searchLng  = toSafeFloat(rawLng,      -180,  180);
    const distance   = toSafeFloat(rawDistance,  1,    500);

    // Si des coords sont fournies, elles doivent être toutes valides
    if ((rawLat || rawLng) && (!searchLat || !searchLng)) {
        return { error: 'Coordonnées GPS invalides.' };
    }

    // Si une distance est fournie, elle doit être valide
    if (rawDistance && !distance) {
        return { error: 'Distance invalide (entre 1 et 500 km).' };
    }

    return { searchLat, searchLng, distance };
}

// ============================================================
// Controllers
// ============================================================

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
        let town_id  = null;
        let latitude = null;
        let longitude = null;

        if (req.body.town_name) {
            const coords = await GeocodingService.geocodeCity(
                req.body.town_name,
                req.body.postal_code
            );
            if (coords) {
                latitude  = coords.lat;
                longitude = coords.lon;
            }

            town_id = await AdsDAO.findOrCreateTown(
                req.body.town_name,
                req.body.postal_code,
                latitude,
                longitude
            );
        }

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
        if (!ad) return res.status(404).json({ error: "Introuvable" });
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

export const search = async (req, res) => {
    try {
        const {
            q, category_id, town_name, postal_code,
            min_price, max_price,
            searchLat: rawLat, searchLng: rawLng, distance: rawDistance,
            sortBy, page
        } = req.query;

        // Validation stricte des paramètres géographiques
        const geoValidation = validateGeoParams(rawLat, rawLng, rawDistance);
        if (geoValidation.error) {
            return res.status(400).json({ error: geoValidation.error });
        }

        let { searchLat, searchLng, distance } = geoValidation;

        // Géocodage à la volée si ville + distance sans coordonnées GPS
        if (town_name && distance && !searchLat) {
            const coords = await GeocodingService.geocodeSearch(town_name, postal_code);
            if (coords) {
                // On revalide les coords retournées par Nominatim par sécurité
                searchLat = toSafeFloat(coords.lat, -90,  90);
                searchLng = toSafeFloat(coords.lon, -180, 180);
            }
        }

        const searchParams = {
            q,
            category_id  : category_id ? Number(category_id) : undefined,
            town_name    : town_name    || undefined,
            min_price    : min_price    ? Number(min_price)   : undefined,
            max_price    : max_price    ? Number(max_price)   : undefined,
            distance     : distance     || undefined,
            searchLat    : searchLat    || undefined,
            searchLng    : searchLng    || undefined,
            sortBy,
            page         : page ? Number(page) : 1,
            limit        : 12,
        };

        let results = await AdsDAO.search(searchParams);

        // Fallback SOUNDEX si aucun résultat avec un mot-clé
        if (results.ads.length === 0 && q) {
            results = await AdsDAO.searchFuzzy(searchParams);
        }

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