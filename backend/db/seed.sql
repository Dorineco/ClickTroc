-- Villes avec leurs coordonnées
INSERT INTO towns (name, postal_code, latitude, longitude) VALUES
('Paris', '75000', 48.8566, 2.3522),
('Lyon', '69000', 45.7640, 4.8357),
('Bordeaux', '33000', 44.8378, -0.5792),
('Angoulême', '16000', 45.6497, 0.1560);

-- Utilisateurs (mots de passe hashés avec Argon2)
INSERT INTO users (firstname, lastname, email, password) VALUES
('Alice', 'Martin', 'alice@test.com', '$argon2...');

-- Catégories
INSERT INTO categories (name) VALUES
('Mobilier'), ('Électronique'), ('Vêtements'), ('Loisirs');

-- Annonces
INSERT INTO ads (title, description, price, user_id, category_id, town_id) VALUES
('Chaise en bois', 'Très bon état', 25.00, 1, 1, 1),
('Vélo de ville', 'Peu utilisé', 150.00, 1, 4, 2);