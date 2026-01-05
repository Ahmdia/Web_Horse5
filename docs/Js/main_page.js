let horseStats = { energie: 0, sante: 0, moral: 0 };
let horseSkills = { Vitesse: 0, Endurance: 0, Dressage: 0, Galop: 0, Trot: 0, Saut: 0 };
let userCoins = 0;
let currentHorseId = null;

document.addEventListener("DOMContentLoaded", () => {
    // 1. Charger le cheval
    fetch("/api/user-first-horse")
        .then(res => res.json())
        .then(data => {
            if (data.found) {
                const horse = data.horse;
                currentHorseId = horse.id;
                document.getElementById("user-horse-img").src = horse.chemin_image;
                document.getElementById("user-horse-img").style.display = "block";
                document.getElementById("user-horse-name").innerText = horse.nom_personnalise || horse.nom;

                initStats(horse);

                // Initialiser les compétences
                horseSkills.Vitesse = Math.round(horse.Vitesse / 10);
                horseSkills.Endurance = Math.round(horse.Endurance / 10);
                horseSkills.Dressage = Math.round(horse.Dressage / 10);
                horseSkills.Galop = Math.round(horse.Galop / 10);
                horseSkills.Trot = Math.round(horse.Trot / 10);
                horseSkills.Saut = Math.round(horse.Saut / 10);

                updateAllSkills();
                setupActionButtons();
                setInterval(baisserStatsAutomatiquement, 300000); // toutes les 5 min
            }
        });

    // 2. Récupérer l'argent
    fetch("/api/user")
        .then(res => res.json())
        .then(data => { if (data.loggedIn) userCoins = data.user.argent || 0; });

    setupNameEditing();
});

// Gestion du nom du cheval
function setupNameEditing() {
    const displayGroup = document.getElementById("name-display-group");
    const editGroup = document.getElementById("name-edit-group");
    const nameLabel = document.getElementById("user-horse-name");
    const nameInput = document.getElementById("name-input");
    const editBtn = document.getElementById("edit-name-btn");
    const confirmBtn = document.getElementById("confirm-name");
    const cancelBtn = document.getElementById("cancel-name");

    editBtn.addEventListener("click", () => {
        nameInput.value = nameLabel.innerText;
        displayGroup.style.display = "none";
        editGroup.style.display = "flex";
        nameInput.focus();
    });

    cancelBtn.addEventListener("click", () => {
        displayGroup.style.display = "flex";
        editGroup.style.display = "none";
    });

    confirmBtn.addEventListener("click", () => {
        const newName = nameInput.value.trim();
        if (newName !== "" && newName !== nameLabel.innerText) {
            modifierNomCheval(newName);
        }
        displayGroup.style.display = "flex";
        editGroup.style.display = "none";
    });

    nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") confirmBtn.click();
    });
}

// Initialisation des stats
function initStats(horse) {
    horseStats.energie = horse.energie;
    horseStats.sante = horse.sante;
    horseStats.moral = horse.moral;
    updateVisualBars();
}

// Sauvegarder stats BDD
function sauvegarderStatsBDD() {
    if (!currentHorseId) return;
    fetch("/api/update-horse-stats", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            horseId: currentHorseId,
            energie: horseStats.energie,
            sante: horseStats.sante,
            moral: horseStats.moral,
            Vitesse: horseSkills.Vitesse,
            Endurance: horseSkills.Endurance,
            Dressage: horseSkills.Dressage,
            Galop: horseSkills.Galop,
            Trot: horseSkills.Trot,
            Saut: horseSkills.Saut
        })
    });
}

// Mise à jour barres
function updateVisualBars() {
    for (let s in horseStats) {
        if (horseStats[s] > 100) horseStats[s] = 100;
        if (horseStats[s] < 0) horseStats[s] = 0;
        document.getElementById(`bar-${s}`).style.width = horseStats[s] + "%";
    }
}

// Mise à jour étoiles
function afficherEtoiles(elementId, count) {
    const container = document.getElementById(elementId);
    if (!container) return;
    let html = "";
    for (let i = 1; i <= 10; i++) {
        html += i <= count ? "★" : "<span class='star-empty'>☆</span>";
    }
    container.innerHTML = html;
}

function updateAllSkills() {
    for (let skill in horseSkills) {
        if (horseSkills[skill] > 10) horseSkills[skill] = 10;
        afficherEtoiles(`star-${skill}`, horseSkills[skill]);
    }
}

// Diminution automatique
function baisserStatsAutomatiquement() {
    horseStats.energie -= 5;
    horseStats.sante -= 5;
    horseStats.moral -= 5;
    updateVisualBars();
    sauvegarderStatsBDD();
}

// Setup icônes
function setupActionButtons() {
    const slots = document.querySelectorAll('.slot');
    const prices = { "Carotte": 10, "Foin": 10, "Eau": 5, "Brosse": 10, "Cure-pied": 20, "Entrainement": 0 };

    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            const type = slot.querySelector('img').alt;
            const cout = prices[type];

            if (userCoins < cout) {
                const display = document.getElementById("coin-amount");
                display.style.color = "red";
                setTimeout(() => { display.style.color = ""; }, 1000);
                return;
            }

            userCoins -= cout;
            if (typeof updateHeader === "function") updateHeader();

            switch(type) {
                case "Brosse":
                    horseStats.moral += 10;
                    break;
                case "Carotte":
                case "Foin":
                case "Eau":
                case "Cure-pied":
                    horseStats.sante += 10;
                    break;
                case "Entrainement":
                    lancerEntrainement();
                    break;
            }

            updateVisualBars();
            updateAllSkills();
            sauvegarderStatsBDD();
        });
    });
}

// Fonction entraînement
function lancerEntrainement() {
    const discipline = prompt("Choisis une discipline : CSO, Dressage, Longe, Balade").toLowerCase();

    switch(discipline) {
        case "cso":
            horseSkills.Galop += 1;
            horseSkills.Saut += 1;
            horseStats.energie -= 15;
            horseStats.moral -= 5;
            alert("🎯 CSO effectué ! +1 Galop, +1 Saut, -15 énergie, -5 moral");
            break;
        case "dressage":
            horseSkills.Dressage += 1;
            horseSkills.Vitesse += 1;
            horseStats.energie -= 10;
            horseStats.moral -= 5;
            alert("🐴 Dressage effectué ! +1 Dressage, +1 Vitesse, -10 énergie, -5 moral");
            break;
        case "longe":
            horseSkills.Endurance += 1;
            horseSkills.Dressage += 1;
            horseStats.energie -= 5;
            horseStats.moral += 2;
            alert("🏇 Longe effectuée ! +1 Endurance, +1 Dressage, -5 énergie, +2 moral");
            break;
        case "balade":
            horseSkills.Endurance += 1;
            horseSkills.Galop += 1;
            horseStats.energie -= 5;
            horseStats.moral += 10;
            alert("🌳 Balade réussie ! +1 Endurance, +1 Galop, -5 énergie, +10 moral");
            break;
        default:
            alert("Discipline inconnue !");
            return;
    }

    updateVisualBars();
    updateAllSkills();
    sauvegarderStatsBDD();
}

// Modifier nom cheval
function modifierNomCheval(nouveauNom) {
    fetch("/api/rename-horse", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            horseId: currentHorseId,
            nom: nouveauNom
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) document.getElementById("user-horse-name").innerText = nouveauNom;
        else alert("Erreur lors du changement de nom.");
    });
}

