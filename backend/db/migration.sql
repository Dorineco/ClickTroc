-- Migration : déplacement des coordonnées géographiques de ads vers towns
-- Raison : latitude/longitude est une propriété de la ville, pas de l'annonce
-- Date : juin 2026

-- Étape 1 : ajout des colonnes dans towns
ALTER TABLE towns
ADD COLUMN latitude DECIMAL(10, 7),
ADD COLUMN longitude DECIMAL(10, 7);

-- Étape 2 : migration des données existantes
UPDATE towns t
JOIN (
    SELECT town_id, AVG(latitude) AS lat, AVG(longitude) AS lng
    FROM ads
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    GROUP BY town_id
) a ON t.id = a.town_id
SET t.latitude = a.lat,
    t.longitude = a.lng;

-- Vérification avant de continuer (à exécuter manuellement)
-- SELECT id, name, latitude, longitude FROM towns WHERE latitude IS NULL;

-- Étape 3 : suppression des colonnes devenues redondantes dans ads
ALTER TABLE ads
DROP COLUMN latitude,
DROP COLUMN longitude;