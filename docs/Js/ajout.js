let son = document.getElementById('son');
let cheval = document.getElementById('cheval');

cheval.addEventListener('click', () => son.play());

//on cree un tableau pour chaque race et son image
const races = [
  { id: 'sellefrancais', classImg: 'img_sellefrancais' },
  { id: 'paint_horse', classImg: 'img_PaintHorse' },
  { id: 'pottock', classImg: 'img_pottock' },
  { id: 'pur_sang', classImg: 'img_pur_sang' },
  { id: 'shetland', classImg: 'img_shetland' },
  { id: 'marawi', classImg: 'img_marawi' },
  { id: 'akhal', classImg: 'img_akhal' }
];

// 2️⃣ Boucle sur chaque race pour ajouter un event click
races.forEach(race => {
  let h2 = document.getElementById(race.id);

  h2.addEventListener('click', () => {
    son.play();

    //on mettre tous en hidden(pas visible)
    races.forEach(r => {
      const images = document.getElementsByClassName(r.classImg);
      for (let img of images) {
        img.style.visibility = 'hidden';
      }
    });
    // Afficher uniquement les images de la race clique
    const imagesToShow = document.getElementsByClassName(race.classImg);
    for (let img of imagesToShow) {
      img.style.visibility = 'visible';
      img.style.animation = 'slidein 1s ease-out forwards';
    }
  });
});

// changement de cheval on clique sur les cercles des couleurs
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('img_sellefrancais')) {
    if (e.target.id === 'sellefrancais1') 
    {
      cheval.src = "Img/sellefrancais/Rn-grand.webp";
    }
    if (e.target.id === 'sellefrancais2') 
    {
      cheval.src = "Img/sellefrancais/SF_GS_NV.webp";
    }
  }

  if (e.target.classList.contains('img_PaintHorse')) {
    if (e.target.id === 'PaintHorse1') 
    {cheval.src = "Img/PaintHorse/PH_Nouveau_BB_Pie_O_Alezan.webp";}
    if (e.target.id === 'PaintHorse2') 
      {cheval.src = "Img/PaintHorse/PH_Nouveau_Pie_overo_noir.webp";}
    if (e.target.id === 'PaintHorse3') 
      {cheval.src = "Img/PaintHorse/Pie-tb-alz-grand.webp";}
  }

  if (e.target.classList.contains('img_pottock')) {
  if (e.target.id === 'pottock1') 
  {cheval.src = "Img/Pottock/Bai-b-grand.webp";}
  if (e.target.id === 'pottock2') 
    {cheval.src = "Img/Pottock/Pottok.webp";}
  if (e.target.id === 'pottock3') 
    {cheval.src = "Img/Pottock/Pottock.webp";}
}});



const modal = document.getElementById("modal");
const btn = document.getElementById("valider-btn");
const closeBtn = document.getElementById("close_btn");

// Ouvrir la modale
btn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// Fermer en cliquant sur X
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// Fermer si on clique en dehors de la box
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});


const form = document.getElementById("formulaire_cheval");
form.addEventListener("submit", async (e) => {
  e.preventDefault(); // 🚫 empêche le submit HTML classique

  const nom = document.getElementById("nom").value;
  const prenom = document.getElementById("prenom").value;
  const date_naissance = document.getElementById("date_naissance").value;
  const sexe = document.querySelector('input[name="sexe"]:checked').value;

  try {
    const response = await fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        nom,
        prenom,
        date_naissance,
        sexe
      })
    });

    const result = await response.text();
    console.log("✅ Réponse serveur :", result);

    // Exemple : fermer la modale après succès
    modal.style.display = "none";

  } catch (error) {
    console.error("❌ Erreur lors de l'inscription :", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/user")
        .then(response => response.json())
        .then(data => {
            const statusDiv = document.getElementById("user-status");
            if (data.loggedIn) {
                statusDiv.innerHTML = `
                    <span>Bienvenue, <strong>${data.user.nom}</strong> !</span>
                    <a href="/logout" style="color: #ff4d4d; margin-left: 10px;">Déconnexion</a>
                `;
                // Optionnel : masquer le bouton "Valider choix" si déjà connecté
                document.getElementById("valider-btn").style.display = "none";
            }
        })
        .catch(err => console.error("Erreur de session:", err));
});