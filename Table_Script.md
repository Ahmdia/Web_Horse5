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
CREATE TABLE chevaux (
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
INSERT INTO chevaux (nom, chemin_image, endurance, vitesse, dressage, galop, trot, saut)
VALUES ('Selle Français', 'Img/sellefrancais/sellefrancais1.png', 80, 70, 90, 85, 75, 95);