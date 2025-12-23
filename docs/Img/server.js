const express = require("express");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("."));
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

// Page principale protégée
app.get("/", (req, res) => {
    if (!req.session.user) return res.redirect("/login.html");
    res.sendFile(path.join(__dirname, "index.html"));
});

// Inscription
app.post("/register", (req, res) => {
    const { nom, prenom } = req.body;

    let users = [];
    if (fs.existsSync("users.json")) {
        users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
    }

    // Vérifier si l'identifiant existe déjà
    if (users.find(u => u.nom === nom)) {
        return res.send("Identifiant déjà utilisé !");
    }

    // Hasher le "mot de passe" (ici prenom du cheval)
    const hashed = bcrypt.hashSync(prenom, 10);

    // Ajouter l'utilisateur
    users.push({ nom, prenom: hashed });
    fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

    res.redirect("/login.html");
});

// Connexion
app.post("/login", (req, res) => {
    const { nom, prenom } = req.body;

    let users = [];
    if (fs.existsSync("users.json")) {
        users = JSON.parse(fs.readFileSync("users.json", "utf-8"));
    }

    const user = users.find(u => u.nom === nom);
    if (!user) return res.send("Identifiant introuvable");

    if (!bcrypt.compareSync(prenom, user.prenom)) return res.send("Nom de cheval incorrect");

    req.session.user = user;
    res.redirect("/");
});

// Déconnexion
app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login.html");
});

app.listen(3000, () => console.log("Serveur lancé sur http://localhost:3000"));
