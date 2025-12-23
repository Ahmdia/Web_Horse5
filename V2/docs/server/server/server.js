const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const mysql = require("mysql2");

// --- CONNEXION A LA BASE DE DONNÉES ---
const db = mysql.createConnection({
    host: "localhost",
    user: "Tagadateam",
    password: "T@g@d@.Polytech",
    database: "tagadateam"
});

db.connect((err) => {
    if (err) throw err;
    console.log("✔ Connecté à MySQL !");
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
    res.sendFile(path.join(__dirname, "..", "index.html"));
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
app.listen(3000, () => console.log("🚀 Serveur lancé sur http://localhost:3000"));
