document.addEventListener("DOMContentLoaded", () => {
    console.log("Page Boutique chargée, lancement de loadShopHorses...");
    loadShopHorses();
    loadShopAccessories();
});

function loadShopHorses() {
    console.log("Tentative de chargement des chevaux...");
    fetch("/api/ecurie-list")
        .then(res => res.json())
        .then(horses => {
            console.log("Chevaux reçus du serveur :", horses); // Vérifie ceci dans ta console F12
            
            const grid = document.getElementById("horses-grid");
            if (!grid) {
                console.error("ERREUR : L'élément #horses-grid est introuvable dans le HTML");
                return;
            }
            
            grid.innerHTML = "";

            if (horses.length === 0) {
                grid.innerHTML = "<p>Aucun cheval n'est disponible à la vente actuellement.</p>";
                return;
            }

            horses.forEach(horse => {
                const prix = (horse.vitesse + horse.endurance + horse.saut) * 10;
                
                // On prépare les calques
                let layersHTML = '<div class="horse-shop-container">';

if (horse.images && horse.images.length > 0) {

    const layerOrder = ['shadow', 'body', 'mane', 'forelock', 'tail'];

    layerOrder.forEach(layerName => {
        const img = horse.images.find(src =>
            src.toLowerCase().includes(layerName)
        );
        if (img) {
            layersHTML += `<img src="${img}" class="shop-layer ${layerName}">`;
        }
    });

} else {
    layersHTML += `<div style="padding:20px; text-align:center;">Image non disponible</div>`;
}

layersHTML += '</div>';


                const card = document.createElement("div");
                card.className = "item-card";
                card.innerHTML = `
                    ${layersHTML}
                    <div class="item-name" style="margin-top:10px; font-weight:bold;">
                        ${horse.race} (${horse.couleur})
                    </div>
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
        })
        .catch(err => console.error("Erreur fetch boutique:", err));
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

function loadShopAccessories() {
    fetch("/api/accessoires-list")
        .then(res => res.json())
        .then(items => {
            const grid = document.getElementById("accessories-grid");
            if (!grid) return;
            
            grid.innerHTML = "";

            items.forEach(item => {
                const card = document.createElement("div");
                card.className = "item-card accessory-card";
                
                // On définit un prix fixe pour les accessoires ou basé sur le type
                const prix = 50; 

                card.innerHTML = `
                    <div class="accessory-preview">
                        <img src="${item.image_path}" class="item-img">
                    </div>
                    <div class="item-name">${item.couche}</div>
                    <div class="item-mini-stats">
                        <span>Style: ${item.race}</span>
                    </div>
                    <div class="purchase-zone">
                        <span class="price-tag">💰 ${prix} pièces</span>
                        <button class="buy-button" onclick="acheterAccessoire('${item.image_path}', ${prix})">Acheter</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        });
}

// Fonction pour l'achat (à adapter selon ta table d'inventaire plus tard)
function acheterAccessoire(path, prix) {
    alert("Fonctionnalité d'inventaire bientôt disponible !");
}