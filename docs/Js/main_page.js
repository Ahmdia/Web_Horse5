document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/user-first-horse")
        .then(res => res.json())
        .then(data => {
            if (data.found) {
                const horse = data.horse;
                
                // Affichage image et nom
                document.getElementById("user-horse-img").src = horse.chemin_image;
                document.getElementById("user-horse-img").style.display = "block";
                document.getElementById("user-horse-name").innerText = horse.nom;

                // 1. Remplir les jauges d'état (Aléatoire pour le moment)
                remplirJaugesAleatoires();

                // 2. Remplir les étoiles d'aptitudes (Depuis la base de données)
                const aptitudes = ['vitesse', 'endurance', 'dressage', 'galop', 'trot', 'saut'];
                aptitudes.forEach(apt => {
                    const score = horse[apt] || 0; // Récupère la valeur (ex: 80)
                    const nbEtoiles = Math.round(score / 10); // Convertit 80 en 8 étoiles
                    afficherEtoiles(`star-${apt}`, nbEtoiles);
                });
            }
        });
});

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
function remplirJaugesAleatoires() {
    const stats = ['energie', 'sante', 'moral'];
    
    stats.forEach(stat => {
        const valeurAleatoire = Math.floor(Math.random() * 71) + 30; // Entre 30% et 100%
        const barre = document.getElementById(`bar-${stat}`);
        if (barre) {
            barre.style.width = valeurAleatoire + "%";
        }
    });
}