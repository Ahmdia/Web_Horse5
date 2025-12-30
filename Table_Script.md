------------------------- TABLE USERS ##############################
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chevaux VARCHAR(255) DEFAULT NULL,         -- Stockera vos IDs (ex: "1-4-7")
    nom VARCHAR(255) NOT NULL UNIQUE,          -- Votre identifiant de connexion
    mot_de_passe VARCHAR(255) NOT NULL,        -- Le hash Bcrypt
    date_naissance DATE NOT NULL,
    sexe ENUM('homme', 'femme') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

############################## TABLE ecurie ##############################
CREATE TABLE ecurie (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    chemin_image VARCHAR(255) NOT NULL, -- Ex: "Img/Pottock/Bai-b-grand.png"
    endurance INT DEFAULT 0,
    vitesse INT DEFAULT 0,
    dressage INT DEFAULT 0,
    galop INT DEFAULT 0,
    trot INT DEFAULT 0,
    saut INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Exemple d'insertion pour tester
INSERT INTO ecurie (nom, chemin_image, endurance, vitesse, dressage, galop, trot, saut)
VALUES (
    'Selle Français', 
    'Img/sellefrancais/sellefrancais1.png', 
    FLOOR(35 + RAND() * 66), -- Endurance entre 0 et 100
    FLOOR(35 + RAND() * 66), -- Vitesse entre 0 et 100
    FLOOR(35 + RAND() * 66), -- Dressage entre 0 et 100
    FLOOR(35 + RAND() * 66), -- Galop entre 0 et 100
    FLOOR(35 + RAND() * 66), -- Trot entre 0 et 100
    FLOOR(35 + RAND() * 66)  -- Saut entre 0 et 100
);
############################## TABLE Chevaux Utilisateurs ##############################
CREATE TABLE possede_chevaux (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,                  -- ID du propriétaire
    ecurie_id INT,                -- ID du modèle de cheval (race/image)
    nom_personnalise VARCHAR(255), -- Au cas où l'utilisateur veut le renommer
    energie INT DEFAULT 50,
    sante INT DEFAULT 50,
    moral INT DEFAULT 50,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (ecurie_id) REFERENCES ecurie(id)
);