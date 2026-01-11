document.addEventListener("DOMContentLoaded", loadMyHorses);

function loadMyHorses() {
    fetch("/api/my-horses")
        .then(res => res.json())
        .then(horses => {
            const grid = document.getElementById("my-horses-grid");
            grid.innerHTML = "";

            horses.forEach(horse => {
                const card = document.createElement("div");
                card.className = `item-card ${horse.actif ? 'active-card' : ''}`;
                
                card.innerHTML = `
                    ${horse.actif ? '<div class="status-badge">⭐ Actif</div>' : ''}
                    <img src="${horse.chemin_image}" alt="Cheval" class="item-img">
                    <div class="item-name">${horse.nom_personnalise || horse.race}</div>
                    <div class="item-mini-stats">
                        <span>⚡ ${horse.vitesse}</span>
                        <span>⛰️ ${horse.endurance}</span>
                        <span>🦘 ${horse.saut}</span>
                    </div>
                    <div class="purchase-zone">
                        <button class="buy-button" onclick="selectHorse(${horse.id})" ${horse.actif ? 'disabled' : ''}>
                            ${horse.actif ? 'Déjà sélectionné' : 'Choisir ce cheval'}
                        </button>
                    </div>
                `;
                grid.appendChild(card);
            });
        });
}

function selectHorse(id) {
    fetch("/api/select-horse", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ horseId: id })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadMyHorses(); // Rafraîchir l'affichage
        }
    });
}