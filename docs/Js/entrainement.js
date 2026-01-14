// Cooldown en millisecondes (5 minutes)
const TRAINING_COOLDOWN = 5 * 60 * 1000;

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".training-card");

    // Récupération du timestamp du dernier entraînement depuis sessionStorage
    let lastTrainingTime = sessionStorage.getItem("lastTrainingTime");
    if (lastTrainingTime) lastTrainingTime = parseInt(lastTrainingTime);

    cards.forEach(card => {
        const cooldownOverlay = document.createElement("div");
        cooldownOverlay.classList.add("cooldown-overlay");
        cooldownOverlay.style.display = "none";
        card.appendChild(cooldownOverlay);

        const cooldownTimer = document.createElement("span");
        cooldownTimer.classList.add("cooldown-timer");
        cooldownOverlay.appendChild(cooldownTimer);

        const updateCooldown = () => {
            if (!lastTrainingTime) return;
            const now = Date.now();
            const diff = TRAINING_COOLDOWN - (now - lastTrainingTime);

            if (diff > 0) {
                card.classList.add("disabled-card");
                cooldownOverlay.style.display = "flex";
                cooldownTimer.innerText = formatTime(diff);
            } else {
                card.classList.remove("disabled-card");
                cooldownOverlay.style.display = "none";
            }
        };

        // Vérifier cooldown toutes les secondes
        setInterval(updateCooldown, 1000);
        updateCooldown();

        card.addEventListener("click", () => {
            if (card.classList.contains("disabled-card")) return;

            const discipline = card.dataset.type;

            // 1️⃣ Récupérer le cheval actif
            fetch("/api/user-first-horse")
                .then(res => res.json())
                .then(data => {
                    if (!data.found) return alert("Erreur : cheval introuvable");
                    const horseId = data.horse.id;

                    let horseStats = {
                        energie: data.horse.energie,
                        sante: data.horse.sante,
                        moral: data.horse.moral
                    };

                    let horseSkills = {
                        vitesse: data.horse.vitesse,
                        endurance: data.horse.endurance,
                        dressage: data.horse.dressage,
                        galop: data.horse.galop,
                        trot: data.horse.trot,
                        saut: data.horse.saut
                    };

                    // 2️⃣ Appliquer effets de l'entraînement
                    switch(discipline) {
                        case "cso":
                            horseStats.energie -= 10;
                            horseStats.moral -= 5;
                            horseStats.sante -= 5;
                            horseSkills.saut = Math.min(100, horseSkills.saut + 5);
                            horseSkills.galop = Math.min(100, horseSkills.galop + 3);
                            break;
                        case "dressage":
                            horseStats.energie -= 8;
                            horseStats.moral -= 3;
                            horseStats.sante -= 2;
                            horseSkills.dressage = Math.min(100, horseSkills.dressage + 5);
                            horseSkills.trot = Math.min(100, horseSkills.trot + 3);
                            horseSkills.galop = Math.min(100, horseSkills.galop + 2);
                            break;
                        case "longe":
                            horseStats.energie -= 5;
                            horseStats.moral += 2;
                            horseStats.sante += 3;
                            horseSkills.endurance = Math.min(100, horseSkills.endurance + 5);
                            horseSkills.dressage = Math.min(100, horseSkills.dressage + 2);
                            break;
                        case "balade":
                            horseStats.energie -= 3;
                            horseStats.moral += 5;
                            horseStats.sante += 2;
                            horseSkills.endurance = Math.min(100, horseSkills.endurance + 3);
                            break;
                        default:
                            console.warn("Discipline inconnue :", discipline);
                            break;
                    }

                    // Limiter stats et compétences
                    for (let s in horseStats) horseStats[s] = Math.max(0, Math.min(100, horseStats[s]));
                    for (let s in horseSkills) horseSkills[s] = Math.max(0, Math.min(100, horseSkills[s]));

                    // 3️⃣ Envoyer au serveur
                    fetch("/api/update-horse-stats", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            horseId: horseId,
                            energie: horseStats.energie,
                            sante: horseStats.sante,
                            moral: horseStats.moral,
                            vitesse: horseSkills.vitesse,
                            endurance: horseSkills.endurance,
                            dressage: horseSkills.dressage,
                            galop: horseSkills.galop,
                            trot: horseSkills.trot,
                            saut: horseSkills.saut
                        })
                    })
                    .then(res => res.text())
                    .then(() => {
                        alert(`✅ Entraînement ${discipline} effectué !`);

                        // Stocker pour main_page et cooldown
                        sessionStorage.setItem("horseStats", JSON.stringify(horseStats));
                        sessionStorage.setItem("horseSkills", JSON.stringify(horseSkills));
                        sessionStorage.setItem("lastTrainingTime", Date.now());
                        lastTrainingTime = Date.now();

                        updateCooldown();
                        // Redirection vers main_page
                        window.location.href = "/main_page";
                    })
                    .catch(err => {
                        console.error("Erreur lors de la mise à jour des stats :", err);
                        alert("❌ Impossible de sauvegarder l'entraînement.");
                    });
                })
                .catch(err => {
                    console.error("Erreur récupération cheval :", err);
                    alert("❌ Impossible de récupérer le cheval.");
                });
        });
    });
});

// Formater le temps en mm:ss
function formatTime(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2,'0')}`;
}




