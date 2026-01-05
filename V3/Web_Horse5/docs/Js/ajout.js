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
async function loadColors(raceKey) {
  const raceId = raceMap[raceKey];
  if (!raceId) return;

  try {
    const response = await fetch(`/api/couleurs?race_id=${raceId}`);
    const colors = await response.json();

    couleurContainer.innerHTML = "";
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
            document.querySelectorAll(".color-circle").forEach(c => c.classList.remove("active"));
            circle.classList.add("active");

          } catch (e) {
            console.error(e);
          }
        });
      }

      couleurContainer.appendChild(circle);
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
document.querySelectorAll("#races h2").forEach(h2 => {
  h2.addEventListener("click", () => {
    son.play();
    loadColors(h2.id);
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

