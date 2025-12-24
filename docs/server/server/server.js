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
app.use(express.static(path.join(__dirname, ".."))); // sert tout le dossier docs/

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

// --- PAGE PRINCIPALE (sert index.html) ---
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..","..", "index.html"));
});



// --- INSCRIPTION ---
app.post("/register", (req, res) => {
    console.log("📥 Données reçues :", req.body);
    res.send("OK");


    const { nom, prenom, date_naissance, sexe } = req.body;

    db.query("SELECT * FROM users WHERE nom = ?", [nom], (err, rows) => {
        if (rows.length > 0) {
            return res.send("Identifiant déjà utilisé !");
        }

        db.query(
            "INSERT INTO users (nom, prenom, date_naissance, sexe) VALUES (?, ?, ?, ?)",
            [nom, prenom, date_naissance, sexe],
            (err) => {
                if (err) throw err;

                // Créer une session pour l'utilisateur directement après inscription
                req.session.user = { nom };
                res.redirect("/"); // plus de login.html
            }
        );
    });

});
// --- CONNEXION ---
app.post("/login", (req, res) => {
    const { nom, prenom } = req.body;

    db.query("SELECT * FROM users WHERE nom = ?", [nom], (err, rows) => {
        if (rows.length === 0) {
            return res.send("Identifiant introuvable");
        }

        const user = rows[0];

        if (!bcrypt.compareSync(prenom, user.prenom)) {
            return res.send("Nom de cheval incorrect");
        }

        req.session.user = user;
        res.redirect("/");
    });
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