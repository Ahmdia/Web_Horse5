const son = document.getElementById("son");
const cheval = document.getElementById("cheval");
const couleurContainer = document.getElementById("couleur-container");
const btnLogin = document.getElementById("login-btn");
const modalLogin = document.getElementById("modal-login");
const formLogin = document.getElementById("formulaire_login");

// Mapping race → id base de données
const raceMap = {
  camargue: 1,
  pur_sang_anglais: 2,
  selle_francais: 3,
  fjord: 4,
  trotteur_francais: 5,
  welsh: 6,
  akhal_teke: 7
};

// Son au clic sur le cheval
cheval.addEventListener("click", () => son.play());

// =======================
// Charger les couleurs
// =======================
const colorsList = document.getElementById("colorsList");

async function loadColors(raceKey) {
  const raceId = raceMap[raceKey];
  if (!raceId) return;

  try {
    const response = await fetch(`/api/couleurs?race_id=${raceId}`);
    const colors = await response.json();

    // ❌ couleurContainer.innerHTML = "";
    // ✅ seulement les couleurs
    colorsList.innerHTML = "";

    const MAX = 7;

    for (let i = 0; i < MAX; i++) {
      const circle = document.createElement("div");
      circle.classList.add("color-circle", `color-${i + 1}`);

      if (colors[i]) {
        const color = colors[i];
        const img = document.createElement("img");
        img.src = color.preview_image;
        img.alt = color.nom;
        circle.appendChild(img);

        circle.addEventListener("click", async () => {
          try {
            const res = await fetch(
              `/api/cheval/${raceKey}?couleur=${encodeURIComponent(color.nom)}`
            );
            const couches = await res.json();
            if (!couches.length) return;

            const bgImages = couches
              .sort((a, b) => a.layer_order - b.layer_order)
              .map(c => `url('${c.image_path}')`)
              .join(", ");

            cheval.style.backgroundImage = bgImages;

            // highlight
            document.querySelectorAll(".color-circle").forEach(c =>
              c.classList.remove("active")
            );
            circle.classList.add("active");

            // ✅ activer le bouton personnaliser
            customBtn.disabled = false;

          } catch (e) {
            console.error(e);
          }
        });
      }

      colorsList.appendChild(circle);
    }

  } catch (err) {
    console.error("Erreur chargement couleurs :", err);
  }
}

// =======================
// MODALE CRÉER UN COMPTE
// =======================
const modal = document.getElementById("modal");
const btn = document.getElementById("valider-btn");
const closeBtn = document.getElementById("close_btn");

btn.addEventListener("click", () => modal.style.display = "flex");
closeBtn.addEventListener("click", () => modal.style.display = "none");

modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// =======================
// FORMULAIRE CRÉER UN COMPTE
// =======================
document.getElementById("formulaire_cheval").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nom: document.getElementById("nom").value,
    prenom: document.getElementById("prenom").value,
    date_naissance: document.getElementById("date_naissance").value,
    sexe: document.querySelector('input[name="sexe"]:checked').value,
    image_cheval: cheval.style.backgroundImage.replace(/url\(["']?|["']?\)/g, "")
  };

  const response = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(data)
  });

  const result = await response.text();
  if (result === "Inscription réussie") location.reload();
  else alert(result);
});

// =======================
// MODALE LOGIN
// =======================
//btnLogin.addEventListener("click", () => {
//  modalLogin.style.display = "flex";
//});

const closeLoginBtn = document.getElementById("close_login_btn");
closeLoginBtn.addEventListener("click", () => modalLogin.style.display = "none");

formLogin.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nom = document.getElementById("login_nom").value;
  const prenom = document.getElementById("login_prenom").value;

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ nom, prenom })
    });

    const result = await response.text();
    if (result === "OK") {
      window.location.href = "/main_page";
    } else {
      alert(result);
    }

  } catch (error) {
    console.error("Erreur réseau :", error);
  }
});

// =======================
// Clic sur une race
// =======================
/*document.querySelectorAll("#races h2").forEach(h2 => {
  h2.addEventListener("click", () => {
    son.play();
    loadColors(h2.id);
  });
});*/
document.querySelectorAll("#races h2").forEach(h2 => {
  h2.addEventListener("click", () => {
    son.play();

    selectedRace = h2.id; // ✅ LA LIGNE CLÉ
    console.log("Race sélectionnée :", selectedRace);

    loadColors(h2.id);

    customBtn.disabled = false;

  resetSelectedLayers();
  });
});

// =======================
// SESSION USER
// =======================
document.addEventListener("DOMContentLoaded", () => {
  fetch("/api/user")
    .then(res => res.json())
    .then(data => {
      if (data.loggedIn) {
        document.getElementById("user-status").innerHTML = `
          <span>Bienvenue, <strong>${data.user.nom}</strong></span>
          <a href="/logout" style="color:red;margin-left:10px">Déconnexion</a>
        `;
        document.getElementById("valider-btn").style.display = "none";
      }
    });
});




//gestion de dialogue 
document.addEventListener("DOMContentLoaded", () => {
  const person = document.getElementById("personImg");
  const bubble = document.getElementById("speechBubble");
  const bubbleText = document.getElementById("bubbleText");
  const nextBtn = document.getElementById("nextBtn");

  const dialogues = [
    "Bienvenue au Ranch !",
    "Choisis ton cheval."
  ];
  let index = 0;

  setTimeout(() => {
    person.style.opacity = 1;
    bubble.style.display = "block";
    bubble.style.opacity = 1;
    bubbleText.textContent = dialogues[index];
  }, 5000); // 5 secondes

  nextBtn.addEventListener("click", () => {
    index++;
    if (index < dialogues.length) {
      bubbleText.textContent = dialogues[index];
    } else {
      // tout cacher après dernier message
      bubble.style.opacity = 0;
      person.style.opacity = 0;
      setTimeout(() => {
        bubble.style.display = "none";
      }, 500);
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const person = document.getElementById("personImg");
  const bubble = document.getElementById("speechBubble");
  const bubbleText = document.getElementById("bubbleText");
  const nextBtn = document.getElementById("nextBtn");
  const bubbleContainer = document.getElementById("bubbleContainer");

  const overlay = document.getElementById("overlay");

  const dialogues = [
    "Bienvenue ! Prêt pour ton aventure à l’Écurie Tagada",
    "Choisis ton cheval."
  ];
  let index = 0;

  setTimeout(() => {
    overlay.style.opacity = 1;   // active le flou
    person.style.opacity = 1;
    bubble.style.display = "block";
    bubble.style.opacity = 1;
    bubbleText.textContent = dialogues[index];
  }, 5000);

  nextBtn.addEventListener("click", () => {
    index++;
    if (index < dialogues.length) {
      bubbleText.textContent = dialogues[index];
    } else {
      // tout cacher après dernier message
    bubbleContainer.remove(); // 🔥 supprimé
    overlay.style.opacity = 0;  // désactive le flou

    // APRÈS la transition → libérer les clics
    setTimeout(() => {
      tutorial.classList.add("hidden");
    }, 500);

    }
  });
});







// ===============================
// ÉTAT DES COUCHES SÉLECTIONNÉES
// ===============================
const selectedLayers = {
  forelock: null,
  mane: null,
  tail: null,
  body: null,
  shadow: "./Nouveau/shadow.png" // shadow toujours présent
};

// ===============================
// ÉLÉMENTS DOM
// ===============================
const customCheval = document.getElementById("customCheval");
const customBtn = document.getElementById("customBtn");
const customModal = document.getElementById("customModal");
const closeCustomModal = document.getElementById("closeCustomModal");
const customImagesContainer = document.getElementById("customImages");

// ===============================
// MISE À JOUR DU CHEVAL (layers)
// ===============================
function updateCheval() {
  const layers = [
    selectedLayers.forelock,
    selectedLayers.mane,
    selectedLayers.tail,
    selectedLayers.body,
    selectedLayers.shadow
  ].filter(Boolean);

  const bg = layers.length ? layers.map(l => `url('${l}')`).join(", ") : "none";

  // Mettre à jour le cheval principal et l'aperçu dans la modale
  cheval.style.backgroundImage = bg;
  customCheval.style.backgroundImage = bg;
}

// ===============================
// RESET DES COUCHES
// ===============================
function resetSelectedLayers() {
  selectedLayers.forelock = null;
  selectedLayers.mane = null;
  selectedLayers.tail = null;
  selectedLayers.body = null;
  // shadow reste toujours présent

  // Réinitialiser visuellement l'aperçu
  customCheval.style.backgroundImage = "none";
}

// ===============================
// OUVERTURE MODALE PERSONNALISATION
// ===============================
customBtn.addEventListener("click", async () => {
  if (!selectedRace) {
    alert("Choisis d'abord une race");
    return;
  }

  // Reset avant ouverture
  resetSelectedLayers();
  customImagesContainer.innerHTML = "";

  // Créer le message d'erreur si pas déjà présent
  let errorMsg = document.getElementById("modalErrorMsg");
  if (!errorMsg) {
    errorMsg = document.createElement("p");
    errorMsg.id = "modalErrorMsg";
    errorMsg.style.color = "red";
    errorMsg.style.marginTop = "10px";
    errorMsg.style.display = "none";
    customModal.querySelector(".box_formulaire_style").appendChild(errorMsg);
  }

  // Ouvrir modale
  customModal.style.display = "flex";

  try {
    const res = await fetch(`/api/chevaux_personnalisation?race=${selectedRace}`);
    const images = await res.json();

    images.forEach(imgData => {
      const img = document.createElement("img");
      img.src = imgData.image_path;
      img.alt = imgData.couche;
      img.style.width = "100px";
      img.style.margin = "6px";
      img.style.cursor = "pointer";

      img.addEventListener("click", () => {
        selectedLayers[imgData.couche] = imgData.image_path;
        updateCheval();

        // Si toutes les couches obligatoires sont choisies, cacher le message
        if (selectedLayers.body && selectedLayers.mane && selectedLayers.tail && selectedLayers.forelock) {
          errorMsg.style.display = "none";
        }
      });

      customImagesContainer.appendChild(img);
    });

  } catch (err) {
    console.error(err);
    alert("Erreur lors du chargement des images");
  }
});

// ===============================
// FERMETURE MODALE
// ===============================
closeCustomModal.addEventListener("click", () => {
  // Vérifier si toutes les pièces obligatoires sont choisies
  if (!selectedLayers.body || !selectedLayers.mane || !selectedLayers.tail || !selectedLayers.forelock) {
    const errorMsg = document.getElementById("modalErrorMsg");
    if (errorMsg) {
      errorMsg.textContent = "Tu dois sélectionner toutes les parties : body, mane, tail et forelock ";
      errorMsg.style.display = "block";
    }
    return; // ne ferme pas la modale
  }

  // Si tout est sélectionné, fermer modale
  customModal.style.display = "none";
});
