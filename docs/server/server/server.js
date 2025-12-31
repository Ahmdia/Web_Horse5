const express = require("express");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");
const mysql = require("mysql2");
const nunjucks = require('nunjucks');
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
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false
}));

const publicPath = path.join(__dirname, "..", "..");
console.log("Dossier racine pour les ressources :", publicPath);
app.use(express.static(publicPath));

nunjucks.configure(path.join(publicPath, 'views'), { 
    autoescape: true,
    express: app,
    noCache: true 
});
app.set('view engine', 'html');

console.log("Le serveur cherche l'index ici :", path.join(__dirname, "..", "index.html"));
// --- PAGE PRINCIPALE ---
app.get("/", (req, res) => {
    // On utilise le même chemin pour envoyer le fichier index.html
    res.sendFile(path.join(publicPath, "index.html"));
});

// ROUTE MAIN PAGE
app.get("/main_page", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    // ON UTILISE RENDER ! Nunjucks va compiler base.html + main_page.html
    res.render("main_page", { 
        user: req.session.user,
        activePage: 'home' 
    });
});

// ROUTE BOUTIQUE
app.get("/boutique", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    res.render("boutique", { 
        user: req.session.user,
        activePage: 'shop' 
    });
});

app.get("/mes_chevaux", (req, res) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    res.render("mes_chevaux", { 
        user: req.session.user,
        activePage: 'Ranch' 
    });
});

app.post("/register", (req, res) => {
    const { nom, prenom, date_naissance, sexe, image_cheval } = req.body;

    // 1. On cherche d'abord l'ID de la race dans la table ecurie
    db.query("SELECT id FROM ecurie WHERE chemin_image = ?", [image_cheval], (err, ecurieRows) => {
        if (err || ecurieRows.length === 0) return res.status(500).send("Erreur : race de cheval introuvable");

        const ecurieId = ecurieRows[0].id;

        // 2. On hache le mot de passe (le prenom)
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(prenom, salt);

        // 3. Insertion de l'utilisateur
        db.query(
            "INSERT INTO users (nom, mot_de_passe, date_naissance, sexe) VALUES (?, ?, ?, ?)",
            [nom, hash, date_naissance, sexe],
            (err, userResult) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') return res.send("Cet identifiant est déjà pris !");
                    return res.status(500).send("Erreur lors de l'inscription");
                }

                // Récupération de l'ID de l'utilisateur qui vient d'être créé
                const newUserId = userResult.insertId;

                // 4. Insertion du premier cheval dans la table de possession
                // Les stats (energie, sante, moral) seront à 50 par défaut grâce au SQL
                db.query(
                    "INSERT INTO possede_chevaux (user_id, ecurie_id, nom_personnalise) VALUES (?, ?, ?)",
                    [newUserId, ecurieId, "Mon premier cheval"],
                    (err) => {
                        if (err) return res.status(500).send("Erreur lors de l'attribution du cheval");

                        // On connecte l'utilisateur (on stocke son ID en session, c'est important !)
                        req.session.user = { id: newUserId, nom: nom };
                        res.send("Inscription réussie");
                    }
                );
            }
        );
    });
});

// --- CONNEXION ---
app.post("/login", (req, res) => {
    const { nom, prenom } = req.body;

    db.query("SELECT * FROM users WHERE nom = ?", [nom], (err, rows) => {
        if (err) return res.status(500).send("Erreur serveur");
        if (rows.length === 0) return res.send("Identifiant introuvable");

        const user = rows[0];
        if (!bcrypt.compareSync(prenom, user.mot_de_passe)) {
            return res.send("Nom de cheval incorrect");
        }

        // On stocke l'ID et le NOM dans la session
        req.session.user = { id: user.id, nom: user.nom, argent: user.argent };
        res.send("OK");
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
//###################  Main Page ########################//

app.get("/api/user-first-horse", (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Non connecté" });

    const userId = req.session.user.id;

    // On joint la table de possession avec la table ecurie pour avoir l'image et la race
// Dans server.js, modifier la requête de main_page
    const sql = `
        SELECT p.*, e.vitesse, e.endurance, e.saut, e.dressage, e.galop, e.trot, e.chemin_image, e.nom
        FROM possede_chevaux p
        JOIN ecurie e ON p.ecurie_id = e.id
        WHERE p.user_id = ?
        ORDER BY p.actif DESC  -- Le cheval actif sera TOUJOURS le premier de la liste
        LIMIT 1`;
    db.query(sql, [userId], (err, rows) => {
        if (err || rows.length === 0) return res.json({ found: false });
        res.json({ found: true, horse: rows[0] });
    });
});

// Ajoute cette route dans server.js
app.post("/api/update-horse-stats", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    const { horseId, energie, sante, moral } = req.body;

    const sql = `UPDATE possede_chevaux SET energie = ?, sante = ?, moral = ? WHERE id = ? AND user_id = ?`;
    
    db.query(sql, [energie, sante, moral, horseId, req.session.user.id], (err) => {
        if (err) return res.status(500).send("Erreur sauvegarde");
        res.send("OK");
    });
});

//Gestion des pieces

app.post("/api/update-money", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");
    const { montant } = req.body;
    db.query("UPDATE users SET argent = ? WHERE id = ?", [montant, req.session.user.id], (err) => {
        if (err) return res.status(500).send("Erreur monnaie");
        res.send("OK");
    });
});

app.post("/api/rename-horse", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    const { horseId, nom } = req.body;
    const query = "UPDATE possede_chevaux SET nom_personnalise = ? WHERE id = ? AND user_id = ?";

    db.query(query, [nom, horseId, req.session.user.id], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false });
        }
        res.json({ success: true });
    });
});
//###################  Boutique ########################//
// Route pour récupérer le catalogue de l'écurie
app.get("/api/ecurie-list", (req, res) => {
    const query = "SELECT * FROM ecurie";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération de l'écurie:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
    });
});

app.post("/api/buy-horse", (req, res) => {
    if (!req.session.user) return res.status(401).json({ success: false, message: "Non connecté" });

    const userId = req.session.user.id;
    const { horseId, prix } = req.body;

    // 1. Vérifier le solde
    db.query("SELECT argent FROM users WHERE id = ?", [userId], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ success: false });

        const soldeActuel = results[0].argent;
        if (soldeActuel < prix) {
            return res.json({ success: false, message: "Fonds insuffisants !" });
        }

        // 2. Récupérer le nom par défaut du cheval dans l'écurie pour le "nom_personnalise"
        db.query("SELECT nom FROM ecurie WHERE id = ?", [horseId], (err, horseData) => {
            if (err || horseData.length === 0) return res.status(500).json({ success: false });

            const defaultName = horseData[0].nom;
            const nouveauSolde = soldeActuel - prix;

            // 3. INSERT dans possede_chevaux (On respecte ta structure SQL)
            // On met les jauges à 50 (moitié pleines) comme convenu
            const insertQuery = `
                INSERT INTO possede_chevaux 
                (user_id, ecurie_id, nom_personnalise, energie, sante, moral) 
                VALUES (?, ?, ?, 50, 50, 50)`;

            db.query(insertQuery, [userId, horseId, defaultName], (err) => {
                if (err) {
                    console.error("Erreur SQL:", err.message);
                    return res.status(500).json({ success: false, message: "Erreur lors de l'achat" });
                }

                // 4. Mettre à jour l'argent
                db.query("UPDATE users SET argent = ? WHERE id = ?", [nouveauSolde, userId], (err) => {
                    req.session.user.argent = nouveauSolde;
                    res.json({ 
                        success: true, 
                        message: "Félicitations ! Votre nouveau compagnon a rejoint votre écurie.",
                        nouveauSolde: nouveauSolde 
                    });
                });
            });
        });
    });
});

//###################  Chevaux Utilisateurs ########################//
// Lister les chevaux possédés
app.get("/api/my-horses", (req, res) => {
    if (!req.session.user) return res.status(401).json([]);
    
    const query = `
        SELECT p.*, e.vitesse, e.endurance, e.saut, e.chemin_image, e.nom as race
        FROM possede_chevaux p
        JOIN ecurie e ON p.ecurie_id = e.id
        WHERE p.user_id = ?`;
    
    db.query(query, [req.session.user.id], (err, results) => {
        if (err) return res.status(500).json([]);
        res.json(results);
    });
});

// Changer le cheval actif
app.post("/api/select-horse", (req, res) => {
    const userId = req.session.user.id;
    const { horseId } = req.body;

    // 1. On met tous les chevaux de l'utilisateur à actif = 0
    db.query("UPDATE possede_chevaux SET actif = 0 WHERE user_id = ?", [userId], (err) => {
        if (err) return res.json({ success: false });

        // 2. On met le cheval choisi à actif = 1
        db.query("UPDATE possede_chevaux SET actif = 1 WHERE id = ? AND user_id = ?", [horseId, userId], (err) => {
            if (err) return res.json({ success: false });
            res.json({ success: true });
        });
    });
});

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