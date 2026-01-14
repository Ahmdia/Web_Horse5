// Js/entrainement.js

document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".training-card");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const discipline = card.dataset.type;


            // 1. Récupérer le cheval actif
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

                    // 2. Calculer l'effet de l'entraînement
                    switch(discipline) {
                        case "cso":
                            horseStats.energie -= 10;
                            horseStats.moral -= 5;
                            horseStats.sante -= 5;
                            break;
                        case "dressage":
                            horseStats.energie -= 8;
                            horseStats.moral -= 3;
                            horseStats.sante -= 2;
                            break;
                        case "longe":
                            horseStats.energie -= 5;
                            horseStats.moral += 2;
                            horseStats.sante += 3;
                            break;
                        case "balade":
                            horseStats.energie -= 3;
                            horseStats.moral += 5;
                            horseStats.sante += 2;
                            break;
                        default:
                            console.warn("Discipline inconnue :", discipline);
                            break;
                    }

                    // Limiter les stats entre 0 et 100
                    for (let s in horseStats) {
                        if (horseStats[s] < 0) horseStats[s] = 0;
                        if (horseStats[s] > 100) horseStats[s] = 100;
                    }

                    // 3. Envoyer au serveur pour sauvegarde
                    fetch("/api/update-horse-stats", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams({
                            horseId: horseId,
                            energie: horseStats.energie,
                            sante: horseStats.sante,
                            moral: horseStats.moral
                        })
                    })
                    .then(res => res.text())
                    .then(() => {
                        alert(`✅ Entraînement ${discipline} effectué !`);
                        // Stocker les nouvelles stats pour main_page
                        sessionStorage.setItem("horseStats", JSON.stringify(horseStats));
                        // Redirection vers main_page pour mise à jour des jauges
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



