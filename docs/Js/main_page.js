let horseStats = { energie: 0, sante: 0, moral: 0 };
let userCoins = 0; // On le garde pour la vérification locale
let currentHorseId = null;

document.addEventListener("DOMContentLoaded", () => {

    const savedStats = sessionStorage.getItem("horseStats");
    if (savedStats) {
        horseStats = JSON.parse(savedStats);
        updateVisualBars();
        sessionStorage.removeItem("horseStats");
    }
    fetch("/api/user-first-horse")
        .then(res => res.json())
        .then(data => {
            if (!data.found) return;

            const horse = data.horse;
            currentHorseId = horse.id;

            // 🔥 AFFICHAGE DES IMAGES
            const container = document.getElementById("customCheval");
            container.innerHTML = "";

            horse.images.forEach(layer => {
                const img = document.createElement("img");
                img.src = layer.src;
                img.alt = layer.couche;
                img.classList.add("horse-layer");
                img.style.zIndex = layer.order;
                container.appendChild(img);
            });

            // 📝 Nom
            document.getElementById("user-horse-name").innerText =
                horse.nom_personnalise || horse.race;

            // ⭐ Stats
            initStats(horse);
            const aptitudes = ['vitesse', 'endurance', 'dressage', 'galop', 'trot', 'saut'];
            aptitudes.forEach(apt => {
                afficherEtoiles(`star-${apt}`, Math.round(horse[apt] / 10));
            });

            setupActionButtons();
            setInterval(baisserStatsAutomatiquement, 300000);
        });

    fetch("/api/user")
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                userCoins = data.user.argent || 0;
            }
        });

});


document.addEventListener("DOMContentLoaded", () => {
    const displayGroup = document.getElementById("name-display-group");
    const editGroup = document.getElementById("name-edit-group");
    const nameLabel = document.getElementById("user-horse-name");
    const nameInput = document.getElementById("name-input");
    
    const editBtn = document.getElementById("edit-name-btn");
    const confirmBtn = document.getElementById("confirm-name");
    const cancelBtn = document.getElementById("cancel-name");

    // Passer en mode édition
    editBtn.addEventListener("click", () => {
        nameInput.value = nameLabel.innerText;
        displayGroup.style.display = "none";
        editGroup.style.display = "flex";
        nameInput.focus();
    });

    // Annuler la modification
    cancelBtn.addEventListener("click", () => {
        displayGroup.style.display = "flex";
        editGroup.style.display = "none";
    });

    // Confirmer la modification
    confirmBtn.addEventListener("click", () => {
        const newName = nameInput.value.trim();
        const oldName = nameLabel.innerText;

        if (newName !== "" && newName !== oldName) {
            modifierNomCheval(newName); // Ta fonction fetch déjà créée
        }
        
        // On repasse en mode affichage (le fetch mettra à jour le texte)
        displayGroup.style.display = "flex";
        editGroup.style.display = "none";
    });

    // Permettre de valider avec la touche Entrée
    nameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") confirmBtn.click();
    });
});

function initStats(horse) {
    horseStats.energie = horse.energie;
    horseStats.sante = horse.sante;
    horseStats.moral = horse.moral;
    updateVisualBars();
}

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

async function sauvegarderArgentBDD() {
    await fetch("/api/update-money", { // Notez le "await" ici
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ montant: userCoins })
    });
    // Une fois la sauvegarde terminée, on met à jour le visuel
    if (typeof updateHeader === "function") updateHeader();
}

function updateVisualBars() {
    for (let s in horseStats) {
        if (horseStats[s] > 100) horseStats[s] = 100;
        if (horseStats[s] < 0) horseStats[s] = 0;
        document.getElementById(`bar-${s}`).style.width = horseStats[s] + "%";
    }
}

function setupActionButtons() {
    const slots = document.querySelectorAll('.slot');
    const prices = { "Carotte": 10, "Brosse": 10, "Eau": 5, "Foin": 5, "Cure-pied": 20 };

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
            // On met à jour le header via la fonction globale
            //if (typeof updateHeader === "function") updateHeader(); 

            if (type === "Carotte") horseStats.energie += 15;
            else if (type === "Foin") horseStats.energie += 5;
            else if (type === "Eau") { horseStats.energie += 10; horseStats.sante += 5; }
            else if (type === "Brosse") { horseStats.sante += 5; horseStats.moral += 10; }
            else if (type === "Cure-pied") { horseStats.sante += 10; horseStats.moral += 15; }
            
            updateVisualBars();
            sauvegarderStatsBDD();
            sauvegarderArgentBDD();
            //Update_Header();
        });
    });
}



function baisserStatsAutomatiquement() {
    horseStats.energie -= 5;
    horseStats.sante -= 5;
    horseStats.moral -= 5;
    updateVisualBars();
    sauvegarderStatsBDD();
}

function afficherEtoiles(elementId, count) {
    const container = document.getElementById(elementId);
    if (!container) return;
    let html = "";
    for (let i = 1; i <= 10; i++) {
        html += i <= count ? "★" : "<span class='star-empty'>☆</span>";
    }
    container.innerHTML = html;
}

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
        if (data.success) {
            document.getElementById("user-horse-name").innerText = nouveauNom;
        } else {
            alert("Erreur lors du changement de nom.");
        }
    });
}
/*
function remplirJaugesAleatoires() {
    ['energie', 'sante', 'moral'].forEach(stat => {
        const val = Math.floor(Math.random() * 70) + 30;
        document.getElementById(`bar-${stat}`).style.width = val + "%";
    });
}

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

*/
