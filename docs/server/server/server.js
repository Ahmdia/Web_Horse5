const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const mysql = require("mysql2");

// --- CONNEXION A LA BASE DE DONNÉES ---
// --- CONNEXION A LA BASE DE DONNÉES DISTANTE ---
const db = mysql.createConnection({
    host: "mysql-tagadateam.alwaysdata.net", 
    user: "448191",                       
    password: "T@g@d@.Polytech",          
    database: "tagadateam_base",            
    ssl: {}                                 
});

db.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion à Alwaysdata :", err.message);
        return;
    }
    console.log("✔ Connecté à la base de données Alwaysdata !");
});

const app = express();

// --- MIDDLEWARES ---
app.use(express.urlencoded({ extended: true }));
const publicPath = path.join(__dirname, "..", "..");
console.log("Dossier racine pour les ressources :", publicPath);
app.use(express.static(publicPath));

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));
console.log("Le serveur cherche l'index ici :", path.join(__dirname, "..", "index.html"));
// --- PAGE PRINCIPALE ---
app.get("/", (req, res) => {
    // On utilise le même chemin pour envoyer le fichier index.html
    res.sendFile(path.join(publicPath, "index.html"));
});

app.post("/register", (req, res) => {
    const { nom, prenom, date_naissance, sexe, image_cheval } = req.body;

    // 1. On cherche d'abord l'ID du cheval
    db.query("SELECT id FROM ecurie WHERE chemin_image = ?", [image_cheval], (err, ecurieRows) => {
        if (err) return res.status(500).send("Erreur base ecurie");

        const chevalId = (ecurieRows.length > 0) ? ecurieRows[0].id.toString() : null;

        // 2. On hache le mot de passe
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(prenom, salt);

        // 3. On tente l'insertion
        db.query(
            "INSERT INTO users (nom, mot_de_passe, date_naissance, sexe, chevaux) VALUES (?, ?, ?, ?, ?)",
            [nom, hash, date_naissance, sexe, chevalId],
            (err) => {
                if (err) {
                    // Si l'erreur est un doublon de NOM
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.send("Cet identifiant est déjà pris, choisis-en un autre !");
                    }
                    console.error(err);
                    return res.status(500).send("Erreur lors de l'inscription");
                }
                
                req.session.user = { nom: nom };
                res.send("Inscription réussie");
            }
        );
    });
});

// --- CONNEXION ---
app.post("/login", (req, res) => {
    const { nom, prenom } = req.body;

    db.query("SELECT * FROM users WHERE nom = ?", [nom], (err, rows) => {
        if (err) return res.status(500).send("Erreur serveur");
        
        if (rows.length === 0) {
            return res.send("Identifiant introuvable");
        }

        const user = rows[0];

        // Compare le texte clair (prenom) avec le hash en base (user.prenom)
        const passwordIsValid = bcrypt.compareSync(prenom, user.mot_de_passe); 
        if (!passwordIsValid) {
            return res.send("Nom de cheval incorrect");
        }

        req.session.user = user;
        res.redirect("/");
    });
});

// Route pour savoir si l'utilisateur est connecté
app.get("/api/user", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});
// --- DÉCONNEXION ---
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

// --- LANCER LE SERVEUR ---
// On utilise le port donné par l'hébergeur, sinon le port 3000 par défaut
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Serveur lancé sur le port ${PORT}`);
    if (!process.env.PORT) {
        console.log(`Lien local : http://localhost:${PORT}`);
    }
});



///////AFFICHAGE DYNAMIQUE//////////////////////
/*
fetch('/api/mon-ecurie')
    .then(res => res.json())
    .then(mesChevaux => {
        mesChevaux.forEach(cheval => {
            console.log(`Cheval : ${cheval.nom}, Vitesse : ${cheval.vitesse}`);
            // Ici vous pouvez créer des balises <img> avec cheval.chemin_image
        });
    });*/
    ///////Recuperation des chevaux de l'utilisateur//////////////////////
/*
    app.get("/api/mon-ecurie", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    // 1. Récupérer la chaîne "1-5-12" de l'utilisateur
    db.query("SELECT chevaux FROM users WHERE nom = ?", [req.session.user.nom], (err, rows) => {
        if (err || rows.length === 0 || !rows[0].chevaux) return res.json([]);

        // 2. Transformer "1-5-12" en tableau [1, 5, 12]
        const ids = rows[0].chevaux.split('-').map(Number);

        // 3. Chercher tous les chevaux correspondants dans la table 'chevaux'
        db.query("SELECT * FROM chevaux WHERE id IN (?)", [ids], (err, results) => {
            if (err) throw err;
            res.json(results); // Envoie la liste complète des objets chevaux
        });
    });
});*/