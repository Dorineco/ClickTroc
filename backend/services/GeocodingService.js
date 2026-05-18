
// Responsabilité unique : convertir un nom de ville en coords GPS
// via l'API Nominatim (OpenStreetMap)
// ============================================================

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT    = 'ClickTroc/1.0';

/**
 * Appel à Nominatim
 * @param {string} query - texte à géocoder
 * @returns {{ lat: number, lon: number } | null}
 */
async function fetchCoords(query) {
    try {
        const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { 'User-Agent': USER_AGENT }
        });
        const data = await response.json();
        if (!data[0]) return null;
        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
        };
    } catch (err) {
        console.error('[GeocodingService] Erreur Nominatim :', err.message);
        return null;
    }
}

const GeocodingService = {

    /**
     * Géocode une ville lors de la création d'une annonce.
    
     * @param {string} townName
     * @param {string} postalCode
     * @returns {{ lat: number, lon: number } | null}
     */
    async geocodeCity(townName, postalCode) {
        const query = [townName, postalCode].filter(Boolean).join(' ');
        return fetchCoords(query);
    },

    /**
     * Géocode une ville lors d'une recherche avec filtre distance.
     * @param {string} townName
     * @param {string} [postalCode]
     * @returns {{ lat: number, lon: number } | null}
     */
    async geocodeSearch(townName, postalCode) {
        const query = [townName, postalCode].filter(Boolean).join(' ');
        return fetchCoords(query);
    },

};

export default GeocodingService;
