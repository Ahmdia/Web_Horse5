const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// IMAGES
const horseImg = new Image();
horseImg.src = "Img/mini_jeu/horse.png";

const obstacleImg = new Image();
obstacleImg.src = "Img/mini_jeu/obstacle.png";

// CHEVAL
let cheval = {
    x: 120,
    y: 280,
    width: 80,
    height: 60,
    vy: 0,
    jumping: false
};

// OBSTACLES
let obstacles = [
    { x: 800, y: 310, width: 40, height: 40 },
    { x: 1200, y: 310, width: 40, height: 40 }
];

let score = 0;
const gravity = 0.8;
const speed = 4;

// CONTROLES
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp" && !cheval.jumping) {
        cheval.vy = -14;
        cheval.jumping = true;
    }
});

// LOGIQUE
function update() {
    // Physique du cheval
    cheval.vy += gravity;
    cheval.y += cheval.vy;

    if (cheval.y >= 280) {
        cheval.y = 280;
        cheval.vy = 0;
        cheval.jumping = false;
    }

    // Obstacles
    obstacles.forEach(ob => {
        ob.x -= speed;
        if (ob.x < -ob.width) {
            ob.x = canvas.width + Math.random() * 400;
            score++;
        }

        // Collision
        if (
            cheval.x < ob.x + ob.width &&
            cheval.x + cheval.width > ob.x &&
            cheval.y < ob.y + ob.height &&
            cheval.y + cheval.height > ob.y
        ) {
            finDeJeu();
        }
    });
}

// DESSIN
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sol
    ctx.fillStyle = "#6ab04c";
    ctx.fillRect(0, 340, canvas.width, 60);

    // Cheval
    ctx.drawImage(horseImg, cheval.x, cheval.y, cheval.width, cheval.height);

    // Obstacles
    obstacles.forEach(ob => {
        ctx.drawImage(obstacleImg, ob.x, ob.y, ob.width, ob.height);
    });

    // Score
    ctx.fillStyle = "#000";
    ctx.font = "18px Arial";
    ctx.fillText("Obstacles franchis : " + score, 10, 25);
}

// FIN DE JEU
function finDeJeu() {
    alert("🏆 Parcours terminé ! Score : " + score);

    sessionStorage.setItem("horseStats", JSON.stringify({
        energie: -15,
        moral: +10,
        sante: -5
    }));

    window.location.href = "/main_page";
}

// BOUCLE
function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

loop();
