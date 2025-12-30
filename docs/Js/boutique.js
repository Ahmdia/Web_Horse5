document.addEventListener("DOMContentLoaded", () => {
    // On ne charge plus l'argent ici, common_header s'en occupe
    loadShopHorses();
});

function loadShopHorses() {
    fetch("/api/ecurie-list")
        .then(res => res.json())
        .then(horses => {
            const grid = document.getElementById("horses-grid");
            grid.innerHTML = "";
            horses.forEach(horse => {
                const prix = (horse.vitesse + horse.endurance + horse.saut) * 10;
                const card = document.createElement("div");
                card.className = "item-card";
                card.innerHTML = `
                    <img src="${horse.chemin_image}" alt="${horse.nom}" class="item-img">
                    <div class="item-name">${horse.nom}</div>
                    <div class="item-mini-stats">
                        <span>⚡ ${horse.vitesse}</span>
                        <span>⛰️ ${horse.endurance}</span>
                        <span>🦘 ${horse.saut}</span>
                    </div>
                    <div class="purchase-zone">
                        <span class="price-tag">💰 ${prix} pièces</span>
                        <button class="buy-button" onclick="acheterCheval(${horse.id}, ${prix})">Acheter</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        });
}

function acheterCheval(id, prix) {
    if (!confirm(`Voulez-vous vraiment acheter ce cheval pour ${prix} pièces ?`)) return;

    fetch("/api/buy-horse", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ horseId: id, prix: prix })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            // ON APPELLE LA FONCTION COMMUNE POUR METTRE À JOUR LE HEADER
            if (typeof updateHeader === "function") updateHeader();
        } else {
            alert("Erreur : " + data.message);
        }
    })
    .catch(err => console.error("Erreur achat:", err));
}