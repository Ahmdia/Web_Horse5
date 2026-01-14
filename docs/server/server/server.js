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
app.use(express.json());



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

app.get("/entrainement", (req, res) => {
    if (!req.session.user) return res.redirect("/");
    res.render("entrainement", { user: req.session.user });
});


app.get("/mini_jeu", (req, res) => {
    if (!req.session.user) return res.redirect("/");
    res.render("mini_jeu", { user: req.session.user });
});

app.post("/register", (req, res) => {
    const { nom, prenom, date_naissance, sexe, race, couleur } = req.body;
    console.log("Body reçu:", req.body); // log du body complet

    // Vérification race et couleur
    if (!race || !couleur) {
        return res.status(400).send("Race et couleur requises");
    }

    // 1️⃣ On cherche l'ID dans la table ecurie2 correspondant à la race et couleur
    db.query(
        "SELECT id FROM ecurie2 WHERE race = ? AND couleur = ?",
        [race, couleur],
        (err, ecurieRows) => {
            if (err) {
                console.error("❌ Erreur SQL ecurie2 :", err);
                return res.status(500).send("Erreur serveur");
            }

            if (ecurieRows.length === 0) {
                console.log("❌ Aucun ecurie trouvé pour Race/Couleur :", race, couleur);
                return res.status(400).send("Erreur : race/couleur introuvable");
            }

            const ecurieId = ecurieRows[0].id;
            console.log("ID ecurie récupéré :", ecurieId, "Race :", race, "Couleur :", couleur);

            // 2️⃣ Hachage du mot de passe (ici le prenom)
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(prenom, salt);

            // 3️⃣ Insertion de l'utilisateur
            db.query(
                "INSERT INTO users (nom, mot_de_passe, date_naissance, sexe) VALUES (?, ?, ?, ?)",
                [nom, hash, date_naissance, sexe],
                (err, userResult) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') return res.send("Cet identifiant est déjà pris !");
                        console.error("❌ Erreur insertion user :", err);
                        return res.status(500).send("Erreur lors de l'inscription");
                    }

                    const newUserId = userResult.insertId;
                    console.log("Nouvel utilisateur ID :", newUserId);

                    // 4️⃣ On récupère l'image_path du premier cheval à partir de chevaux_images
                    db.query(
                        "SELECT image_path FROM chevaux_images WHERE race = ? AND couleur = ? ORDER BY layer_order ASC LIMIT 1",
                        [race, couleur],
                        (err, imageRows) => {
                            if (err) {
                                console.error("❌ Erreur récupération image :", err);
                                return res.status(500).send("Erreur lors de la récupération de l'image du cheval");
                            }

                            if (imageRows.length === 0) {
                                console.log("❌ Aucun cheval trouvé pour Race/Couleur :", race, couleur);
                                return res.status(400).send("Aucune image disponible pour cette race/couleur");
                            }

                            const imagePath = imageRows[0].image_path;
                            console.log("Image du cheval :", imagePath);

                            // 5️⃣ Insertion du premier cheval dans possede_chevaux
                            db.query(
                                "INSERT INTO possede_chevaux2 (user_id, ecurie_id, nom_personnalise, energie, sante, moral, actif) VALUES (?, ?, ?, 50, 50, 50, 1)",
                                [newUserId, ecurieId, "Mon premier cheval"],
                                (err) => {
                                    if (err) {
                                        console.error("❌ Erreur lors de l'attribution du cheval :", err);
                                        return res.status(500).send("Erreur lors de l'attribution du cheval");
                                    }
                                
                                    req.session.user = { id: newUserId, nom: nom };
console.log("✅ Inscription réussie pour l'utilisateur :", nom);
res.json({
    success: true,
    user: { id: newUserId, nom: nom },
    chevalImage: imagePath // <-- on envoie l'image au front
});
                                }
                            );
                        }
                    );
                }
            );
        }
    );
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

// -------------------------------
// SESSION
// -------------------------------

app.get("/api/user", (req, res) => {
    if (!req.session.user) return res.json({ loggedIn: false });

    // On va chercher les infos les plus récentes en BDD
    db.query("SELECT id, nom, argent FROM users WHERE id = ?", [req.session.user.id], (err, results) => {
        if (err || results.length === 0) return res.status(500).json({ loggedIn: false });
        
        const userFreshData = results[0];
        // Optionnel : on met à jour la session pour qu'elle soit synchro
        req.session.user.argent = userFreshData.argent; 
        
        res.json({ loggedIn: true, user: userFreshData });
    });
});
// -------------------------------
// COULEURS PAR RACE
// -------------------------------
app.get("/api/couleurs", (req, res) => {
    const raceId = req.query.race_id;

    if (!raceId) {
        return res.status(400).json({ error: "race_id manquant" });
    }

    const sql = `
        SELECT id, nom, preview_image
        FROM couleurs
        WHERE race_id = ?
    `;

    db.query(sql, [raceId], (err, rows) => {
        if (err) {
            console.error("❌ Erreur SQL /api/couleurs :", err);
            return res.status(500).json({ error: "Erreur serveur SQL" });
        }

        res.json(rows);
    });
});
// -------------------------------
// CHEVAL PAR RACE + COULEUR
// -------------------------------
app.get("/api/cheval/:race", (req, res) => {
    const race = req.params.race;
    const couleur = req.query.couleur;

    if (!race) {
        return res.status(400).json({ error: "race manquante" });
    }

    if (!couleur) {
        return res.status(400).json({ error: "couleur manquante" });
    }

    const sql = `
        SELECT id, couche, image_path
        FROM chevaux_images
        WHERE race = ? AND couleur = ?
        ORDER BY layer_order ASC
    `;

    db.query(sql, [race, couleur], (err, rows) => {
        if (err) {
            console.error("❌ Erreur SQL /api/cheval :", err);
            return res.status(500).json({ error: "Erreur serveur SQL" });
        }

        res.json(rows); // ✅ TOUJOURS UN TABLEAU
    });
});

// -------------------------------
// IMAGES PAR RACE (PERSONNALISATION)
// -------------------------------
// -------------------------------
// CHEVAUX POUR PERSONNALISATION
// -------------------------------
app.get("/api/chevaux_personnalisation", (req, res) => {
    const race = req.query.race;
    if (!race) {
        return res.status(400).json({ error: "race manquante" });
    }

    const sql = `
        SELECT id, couche, image_path
        FROM chevaux_images
        WHERE race = ?
        ORDER BY layer_order ASC
    `;

    db.query(sql, [race], (err, rows) => {
        if (err) {
            console.error("❌ Erreur SQL /api/chevaux_personnalisation :", err);
            return res.status(500).json({ error: "Erreur serveur SQL" });
        }

        res.json(rows); // ⬅️ toujours un TABLEAU
    });
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
    if (!req.session.user) {
        return res.status(401).json({ error: "Non connecté" });
    }

    const userId = req.session.user.id;

    const sql = `
        SELECT 
            p.id AS horse_id,
            p.nom_personnalise,
            p.energie,
            p.sante,
            p.moral,
            p.actif,

            e2.race,
            e2.couleur,
            e2.endurance,
            e2.vitesse,
            e2.dressage,
            e2.galop,
            e2.trot,
            e2.saut,

            ci.couche,
            ci.image_path,
            ci.layer_order
        FROM possede_chevaux2 p
        JOIN ecurie2 e2 ON p.ecurie_id = e2.id
        JOIN chevaux_images ci 
            ON ci.race = e2.race
            AND ci.couleur = e2.couleur
        WHERE p.user_id = ?
          AND p.actif = 1
        ORDER BY ci.layer_order DESC
    `;

    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("❌ Erreur SQL user-first-horse :", err);
            return res.status(500).json({ found: false });
        }

        if (rows.length === 0) {
            return res.json({ found: false });
        }

        // 🧠 Construction propre de l'objet cheval
        const horse = {
            id: rows[0].horse_id,
            nom_personnalise: rows[0].nom_personnalise,
            energie: rows[0].energie,
            sante: rows[0].sante,
            moral: rows[0].moral,

            race: rows[0].race,
            couleur: rows[0].couleur,

            vitesse: rows[0].vitesse,
            endurance: rows[0].endurance,
            dressage: rows[0].dressage,
            galop: rows[0].galop,
            trot: rows[0].trot,
            saut: rows[0].saut,

            images: rows.map(r => ({
                couche: r.couche,
                src: r.image_path,
                order: r.layer_order
            }))
        };

        res.json({ found: true, horse });
    });
});



app.post("/api/update-horse-stats", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    const { horseId, energie, sante, moral } = req.body;

    const sql = `UPDATE possede_chevaux2 SET energie = ?, sante = ?, moral = ? WHERE id = ? AND user_id = ?`;
    
    db.query(sql, [energie, sante, moral, horseId, req.session.user.id], (err) => {
        if (err) return res.status(500).send("Erreur sauvegarde");
        res.send("OK");
    });
});
//Gestion des pieces



// Gestion des pièces
app.post("/api/update-money", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    const { montant } = req.body;

    db.query("UPDATE users SET argent = ? WHERE id = ?", [montant, req.session.user.id], (err) => {
        if (err) return res.status(500).send("Erreur monnaie");

        // ⚡ Mettre à jour la session avec le nouveau montant
        req.session.user.argent = montant;

        res.send("OK");
    });
});

// ✅ AJOUTER DE L'ARGENT (mini-jeu, récompenses)
app.post("/api/add-money", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    const gain = parseInt(req.body.montant, 10);
    if (isNaN(gain)) return res.status(400).send("Montant invalide");

    const userId = req.session.user.id;

    db.query(
        "UPDATE users SET argent = argent + ? WHERE id = ?",
        [gain, userId],
        (err) => {
            if (err) {
                console.error("Erreur add-money:", err);
                return res.status(500).send("Erreur monnaie");
            }

            // 🔥 SYNCHRO SESSION
            req.session.user.argent += gain;

            res.json({ success: true, gain });
        }
    );
});


app.post("/api/rename-horse", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    const { horseId, nom } = req.body;
    const query = "UPDATE possede_chevaux2 SET nom_personnalise = ? WHERE id = ? AND user_id = ?";

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
    // Jointure pour récupérer les infos du modèle + tous les calques d'images associés
    const query = `
        SELECT e.*, ci.image_path, ci.layer_order, ci.couche
        FROM ecurie2 e
        LEFT JOIN chevaux_images ci ON e.race = ci.race AND e.couleur = ci.couleur
        ORDER BY e.id ASC, ci.layer_order ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Erreur ecurie-list:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        // Regroupement par cheval
        const shopHorses = {};
        results.forEach(row => {
            if (!shopHorses[row.id]) {
                shopHorses[row.id] = {
                    id: row.id,
                    race: row.race,
                    couleur: row.couleur,
                    vitesse: row.vitesse,
                    endurance: row.endurance,
                    saut: row.saut,
                    images: []
                };
            }
            if (row.image_path) {
                shopHorses[row.id].images.push(row.image_path);
            }
        });

        res.json(Object.values(shopHorses));
    });
});

app.post("/api/buy-horse", (req, res) => {
    if (!req.session.user) 
        return res.status(401).json({ success: false, message: "Non connecté" });

    const userId = req.session.user.id;
    const { horseId, prix } = req.body;

    // 1. Vérifier le solde
    db.query("SELECT argent FROM users WHERE id = ?", [userId], (err, results) => {
        if (err || results.length === 0) 
            return res.status(500).json({ success: false });

        const soldeActuel = results[0].argent;
        if (soldeActuel < prix) {
            return res.json({ success: false, message: "Fonds insuffisants !" });
        }

        // 2. Récupérer la race et la couleur du cheval dans ecurie2
        db.query("SELECT race, couleur FROM ecurie2 WHERE id = ?", [horseId], (err, horseData) => {
            if (err || horseData.length === 0) 
                return res.status(500).json({ success: false });

            const defaultName = horseData[0].race; // le nom par défaut = race
            const nouveauSolde = soldeActuel - prix;

            // 3. INSERT dans possede_chevaux
            const insertQuery = `
                INSERT INTO possede_chevaux2 
                (user_id, ecurie_id, nom_personnalise, energie, sante, moral,actif) 
                VALUES (?, ?, ?, 50, 50, 50,0)
            `;

            db.query(insertQuery, [userId, horseId, defaultName], (err) => {
                if (err) {
                    console.error("Erreur SQL:", err.message);
                    return res.status(500).json({ success: false, message: "Erreur lors de l'achat" });
                }

                // 4. Mettre à jour l'argent
                db.query("UPDATE users SET argent = ? WHERE id = ?", [nouveauSolde, userId], (err) => {
                    if (err) console.error("Erreur mise à jour argent :", err.message);
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
    
    // Jointure triple : possede_chevaux2 -> ecurie2 -> chevaux_images
    const query = `
        SELECT 
            p.id, p.nom_personnalise, p.actif, p.energie, p.sante, p.moral,
            e.vitesse, e.endurance, e.saut, e.race, e.couleur,
            ci.image_path, ci.layer_order
        FROM possede_chevaux2 p
        JOIN ecurie2 e ON p.ecurie_id = e.id
        LEFT JOIN chevaux_images ci ON ci.race = e.race AND ci.couleur = e.couleur
        WHERE p.user_id = ?
        ORDER BY p.id ASC, ci.layer_order ASC`;
    
    db.query(query, [req.session.user.id], (err, results) => {
        if (err) return res.status(500).json([]);

        // On regroupe les calques par cheval
        const horsesMap = {};
        results.forEach(row => {
            if (!horsesMap[row.id]) {
                horsesMap[row.id] = {
                    id: row.id,
                    nom_personnalise: row.nom_personnalise,
                    actif: row.actif,
                    vitesse: row.vitesse,
                    endurance: row.endurance,
                    saut: row.saut,
                    race: row.race,
                    images: []
                };
            }
            if (row.image_path) {
                horsesMap[row.id].images.push(row.image_path);
            }
        });

        res.json(Object.values(horsesMap));
    });
});

// API pour mettre à jour stats après entraînement
app.post("/api/entrainement", (req, res) => {
    if (!req.session.user) return res.status(401).send("Non connecté");

    const { horseId, energie, sante, moral } = req.body;

    const sql = `UPDATE possede_chevaux SET energie = ?, sante = ?, moral = ? WHERE id = ? AND user_id = ?`;

    db.query(sql, [energie, sante, moral, horseId, req.session.user.id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Erreur lors de la mise à jour du cheval");
        }
        res.json({ success: true });
    });
});

app.get("/api/accessoires-list", (req, res) => {
    // On sélectionne uniquement Forelock (1), Mane (2) et Tail (3)
    // On utilise DISTINCT pour ne pas avoir 10 fois la même crinière si elle est liée à plusieurs chevaux
    const query = `
        SELECT DISTINCT image_path, couche, race, couleur
        FROM chevaux_images
        WHERE layer_order IN (1, 2, 3)
        ORDER BY layer_order ASC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error("Erreur accessoires-list:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
    });
});

// Changer le cheval actif
app.post("/api/select-horse", (req, res) => {
    const userId = req.session.user.id;
    const { horseId } = req.body;

    // 1. On met tous les chevaux de l'utilisateur à actif = 0
    db.query("UPDATE possede_chevaux2 SET actif = 0 WHERE user_id = ?", [userId], (err) => {
        if (err) return res.json({ success: false });

        // 2. On met le cheval choisi à actif = 1
        db.query("UPDATE possede_chevaux2 SET actif = 1 WHERE id = ? AND user_id = ?", [horseId, userId], (err) => {
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