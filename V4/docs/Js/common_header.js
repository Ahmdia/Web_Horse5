// Ce script tourne sur chaque page pour maintenir le header à jour
document.addEventListener("DOMContentLoaded", () => {
    updateHeader();

    // Gestion du menu déroulant Profil (commun à toutes les pages)
    const profileTrigger = document.getElementById("profile-trigger");
    const dropdown = document.getElementById("user-dropdown");

    if (profileTrigger && dropdown) {
        profileTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("show");
        });

        window.addEventListener("click", () => {
            dropdown.classList.remove("show");
        });
    }
});

function updateHeader() {
    fetch("/api/user")
        .then(res => res.json())
        .then(data => {
            if (data.loggedIn) {
                const nameDisplay = document.getElementById("user-name-display");
                const coinDisplay = document.getElementById("coin-amount");

                if (nameDisplay) nameDisplay.innerText = data.user.nom;
                if (coinDisplay) {
                    // .toLocaleString() ajoute les espaces pour les milliers (ex: 25 000)
                    coinDisplay.innerText = Number(data.user.argent).toLocaleString();
                }
            }
        })
        .catch(err => console.error("Erreur de chargement du header:", err));
}