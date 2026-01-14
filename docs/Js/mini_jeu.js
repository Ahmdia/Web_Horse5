document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".competition-card");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            const reward = parseInt(card.dataset.reward);
            const penalty = parseInt(card.dataset.penalty);
            startMiniGame(reward, penalty);
        });
    });
});

function startMiniGame(reward, penalty) {
    document.querySelector(".competition-grid").style.display = "none";
    const gameArea = document.getElementById("game-area");
    gameArea.style.display = "block";

    const canvas = document.getElementById("game-canvas");
    const ctx = canvas.getContext("2d");

    const horseImg = new Image();
    horseImg.src = "Img/mini_jeu/horse.png";
    const obsImg = new Image();
    obsImg.src = "Img/mini_jeu/obstacle.png";

    const horse = { x: 50, y: 130, width: 60, height: 60, vy:0, gravity: 1 };
    const obstacles = [
        { x: 700, y: 130, width: 50, height: 50, passed: false },
        { x: 1100, y: 130, width: 50, height: 50, passed: false },
        { x: 1500, y: 130, width: 50, height: 50, passed: false }
    ];

    let gameOver = false;
    let jumps = 0;

    document.addEventListener("keydown", (e) => {
        if (e.code === "Space" && horse.y === 130) horse.vy = -20; // saut
    });

    function update() {
        if(gameOver) return;

        ctx.clearRect(0,0,canvas.width,canvas.height);

        // mouvement cheval
        horse.vy += horse.gravity;
        horse.y += horse.vy;
        if(horse.y > 130) horse.y = 130, horse.vy = 0;

        // obstacles
        obstacles.forEach(ob => {
            ob.x -= 6; // vitesse réduite
            if(ob.x + ob.width < 0) ob.x = canvas.width + Math.random()*400;

            // vérifier si le cheval passe l'obstacle sans collision
            if(!ob.passed && horse.x > ob.x + ob.width) {
                ob.passed = true;
                jumps++;
                if(jumps >= 3) {
                    gameOver = true;
                    endGame(true, reward, penalty);
                }
            }

            // collision
            if(horse.x < ob.x + ob.width &&
               horse.x + horse.width > ob.x &&
               horse.y < ob.y + ob.height &&
               horse.y + horse.height > ob.y) {
                gameOver = true;
                endGame(false, reward, penalty);
            }

            ctx.drawImage(obsImg, ob.x, ob.y, ob.width, ob.height);
        });

        ctx.drawImage(horseImg, horse.x, horse.y, horse.width, horse.height);

        if(!gameOver) requestAnimationFrame(update);
    }

    update();
}

function endGame(success, reward, penalty) {
    alert(success ? `🎉 Succès ! Vous gagnez ${reward} 💰 !` : `💥 Échec ! Perte ${penalty} pts santé`);
    
    // Mise à jour des stats et argent
    fetch("/api/user-first-horse")
        .then(res => res.json())
        .then(data => {
            if(!data.found) return;
            const horseId = data.horse.id;
            let energie = data.horse.energie;
            let sante = data.horse.sante;
            let moral = data.horse.moral;
            if(!success) sante -= penalty;
            if(sante<0) sante=0;

            // mettre à jour stats
            fetch("/api/update-horse-stats", {
                method:"POST",
                headers: {"Content-Type":"application/x-www-form-urlencoded"},
                body: new URLSearchParams({ horseId, energie, sante, moral })
            });

            // mettre à jour argent si succès
            


            if(success) {

                fetch("/api/add-money", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ montant: 150 })
                })
                .then(() => {
                    window.location.href = "/main_page";
                });
                
                

                
                    
            }
            

            // retour à main_page
            window.location.href = "/main_page";
        });
}






