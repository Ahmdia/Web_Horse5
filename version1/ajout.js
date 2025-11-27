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

// Boucle sur chaque race pour ajouter un event click
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
      cheval.src = "sellefrancais/Rn-grand.webp";
    }
    if (e.target.id === 'sellefrancais2') 
    {
      cheval.src = "sellefrancais/SF_GS_NV.webp";
    }
  }

  if (e.target.classList.contains('img_PaintHorse')) {
    if (e.target.id === 'PaintHorse1') 
    {cheval.src = "PaintHorse/PH_Nouveau_BB_Pie_O_Alezan.webp";}
    if (e.target.id === 'PaintHorse2') 
      {cheval.src = "PaintHorse/PH_Nouveau_Pie_overo_noir.webp";}
    if (e.target.id === 'PaintHorse3') 
      {cheval.src = "PaintHorse/Pie-tb-alz-grand.webp";}
  }

  if (e.target.classList.contains('img_pottock')) {
  if (e.target.id === 'pottock1') 
  {cheval.src = "Pottock/Bai-b-grand.webp";}
  if (e.target.id === 'pottock2') 
    {cheval.src = "Pottock/Pottok.webp";}
  if (e.target.id === 'pottock3') 
    {cheval.src = "Pottock/Pottock.webp";}
}});



          







