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


// --- INSCRIPTION ---
// --- INSCRIPTION ---
app.post("/register", (req, res) => {
    const { nom, prenom, date_naissance, sexe } = req.body;

    // 1. Vérifier si l'utilisateur existe déjà
    db.query("SELECT * FROM users WHERE nom = ?", [nom], (err, rows) => {
        if (err) return res.status(500).send("Erreur serveur");
        
        if (rows.length > 0) {
            return res.send("Identifiant déjà utilisé !");
        }

        // 2. HACHAGE du "mot de passe" (ici le prénom/nom du cheval)
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(prenom, salt);

        // 3. Insertion en base avec le mot de passe haché
        db.query(
            "INSERT INTO users (nom, prenom, date_naissance, sexe) VALUES (?, ?, ?, ?)",
            [nom, hash, date_naissance, sexe],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.send("Erreur lors de l'insertion");
                }

                // 4. Créer la session et rediriger
                req.session.user = { nom };
                res.redirect("/"); 
            }
        );
    });
});
// --- CONNEXION ---
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
        const passwordIsValid = bcrypt.compareSync(prenom, user.prenom);

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