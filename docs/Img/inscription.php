<?php
// Vérifier que la requête est bien en POST
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // Récupérer les données du formulaire
    $nom = $_POST["nom"] ?? "";
    $prenom = $_POST["prenom"] ?? "";
    $date_naissance = $_POST["date_naissance"] ?? "";
    $sexe = $_POST["sexe"] ?? "";

    // (OPTIONNEL) Enregistrer dans un fichier pour tester
    file_put_contents("donnees.txt",
        "Nom: $nom\nPrenom: $prenom\nDate: $date_naissance\nSexe: $sexe\n\n",
        FILE_APPEND
    );

    // Une fois fini → redirection
    header("Location: main_page.html");
    exit();

} else {
    echo "Méthode non autorisée";
}
?>
