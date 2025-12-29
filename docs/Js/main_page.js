// On stocke les valeurs actuelles pour pouvoir les modifier facilement
let horseStats = {
    energie: 0,
    sante: 0,
    moral: 0
};

let currentHorseId = null; // Pour savoir quel cheval on modifie

document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/user-first-horse")
        .then(res => res.json())
        .then(data => {
            if (data.found) {
                const horse = data.horse;
                currentHorseId = horse.id; // On stocke l'ID du cheval

                document.getElementById("user-horse-img").src = horse.chemin_image;
                document.getElementById("user-horse-img").style.display = "block";
                document.getElementById("user-horse-name").innerText = horse.nom_personnalise || horse.nom;

                // INITIALISATION avec les vraies valeurs de la BDD
                initStats(horse); 

                const aptitudes = ['vitesse', 'endurance', 'dressage', 'galop', 'trot', 'saut'];
                aptitudes.forEach(apt => {
                    afficherEtoiles(`star-${apt}`, Math.round(horse[apt] / 10));
                });

                setupActionButtons();
                setInterval(baisserStatsAutomatiquement, 300000);
            }
        });
});

// 1. Affichage du nom de l'utilisateur (récupéré via ta route /api/user existante)
fetch("/api/user")
    .then(res => res.json())
    .then(data => {
        if (data.loggedIn) {
            document.getElementById("user-name-display").innerText = data.user.nom;
        }
    });

// 2. Gestion du menu déroulant Profil
const profileTrigger = document.getElementById("profile-trigger");
const dropdown = document.getElementById("user-dropdown");

profileTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
});

// Fermer le menu si on clique ailleurs
window.addEventListener("click", () => {
    dropdown.classList.remove("show");
});

// On remplace l'ancienne fonction initStats par celle-ci
function initStats(horse) {
    horseStats.energie = horse.energie;
    horseStats.sante = horse.sante;
    horseStats.moral = horse.moral;
    updateVisualBars();
}

// Nouvelle fonction pour envoyer les données au serveur
function sauvegarderStatsBDD() {
    if (!currentHorseId) return;

    fetch("/api/update-horse-stats", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            horseId: currentHorseId,
            energie: horseStats.energie,
            sante: horseStats.sante,
            moral: horseStats.moral
        })
    });
}

function setupActionButtons() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            const type = slot.querySelector('img').alt;

            if (type === "Carotte") horseStats.energie += 15;
            else if (type === "Foin") horseStats.energie += 5;
            else if (type === "Eau") { horseStats.energie += 10; horseStats.sante += 5; }
            else if (type === "Brosse") { horseStats.sante += 5; horseStats.moral += 10; }
            else if (type === "Cure-pied") { horseStats.sante += 10; horseStats.moral += 15; }
            
            updateVisualBars();
            sauvegarderStatsBDD(); // SAUVEGARDE AUTOMATIQUE APRÈS CLIC
        });
    });
}

function baisserStatsAutomatiquement() {
    horseStats.energie -= 5;
    horseStats.sante -= 5;
    horseStats.moral -= 5;
    updateVisualBars();
    sauvegarderStatsBDD(); // SAUVEGARDE APRÈS LA BAISSE DES 5 MIN
}

function updateVisualBars() {
    // On s'assure que rien ne dépasse 100 ou ne descend sous 0
    for (let s in horseStats) {
        if (horseStats[s] > 100) horseStats[s] = 100;
        if (horseStats[s] < 0) horseStats[s] = 0;
        document.getElementById(`bar-${s}`).style.width = horseStats[s] + "%";
    }
}

function setupActionButtons() {
    const slots = document.querySelectorAll('.slot');
    
    slots.forEach(slot => {
        slot.addEventListener('click', () => {
            const type = slot.querySelector('img').alt;

            if (type === "Carotte") {
                horseStats.energie += 15;
            } else if (type === "Foin") {
                horseStats.energie += 5;
            } else if (type === "Eau") {
                horseStats.energie += 10;
                horseStats.sante += 5;
            } else if (type === "Brosse") {
                horseStats.sante += 5;
                horseStats.moral += 10;
            } else if (type === "Cure-pied") {
                horseStats.sante += 10;
                horseStats.moral += 15;
            }
            
            updateVisualBars();
        });
    });
}

// Fonction pour la baisse toutes les 5 minutes
function baisserStatsAutomatiquement() {
    console.log("Les jauges baissent un peu...");
    horseStats.energie -= 5;
    horseStats.sante -= 5;
    horseStats.moral -= 5;
    updateVisualBars();
}

// Garde tes fonctions afficherEtoiles ici...
function afficherEtoiles(elementId, count) {
    const container = document.getElementById(elementId);
    
    // Sécurité : si l'élément n'est pas trouvé, on ne fait rien
    if (!container) {
        console.warn(`Attention : l'élément avec l'ID "${elementId}" est introuvable.`);
        return;
    }

    let html = "";
    for (let i = 1; i <= 10; i++) {
        if (i <= count) {
            html += "★"; 
        } else {
            html += "<span class='star-empty'>☆</span>"; 
        }
    }
    container.innerHTML = html;
}
/*
function remplirJaugesAleatoires() {
    ['energie', 'sante', 'moral'].forEach(stat => {
        const val = Math.floor(Math.random() * 70) + 30;
        document.getElementById(`bar-${stat}`).style.width = val + "%";
    });
}
*/
