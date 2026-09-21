# Site de mariage — Emma & Arnaud

Site statique (HTML, CSS, JavaScript) : aucun outil de compilation, aucun compte tiers obligatoire.
Il se publie gratuitement avec GitHub Pages. Toutes vos photos et informations sont déjà intégrées ;
il ne reste que quelques points listés en bas de ce fichier.

## Structure

```
index.html          Contenu et textes du site
css/style.css        Mise en page et couleurs (variables en tête du fichier)
js/config.js         Réglages : date, cagnotte, WhatsApp, RSVP, lieux, événements, galerie
js/main.js           Comportements (menu, compte à rebours, carte, formulaire…)
js/gate.js            Verrou d'accès par mot de passe (voir section dédiée)
assets/img/          Photos du site
assets/gallery/       Photos de la galerie (après le mariage)
assets/favicon.svg    Icône de l’onglet
CNAME                 Nom de domaine personnalisé pour GitHub Pages (emma-arnaud.fr)
robots.txt            Demande aux moteurs de recherche de ne pas indexer le site
```

## Publier sur GitHub Pages

1. Créez un dépôt GitHub (par exemple `mariage`) et déposez-y tout le contenu de ce dossier, `CNAME` compris.
2. Dans le dépôt : **Settings → Pages → Build and deployment → Source : Deploy from a branch**, puis choisissez la branche `main` et le dossier `/ (root)`.
3. Toujours dans **Settings → Pages**, sous *Custom domain*, `emma-arnaud.fr` devrait déjà apparaître (grâce au fichier `CNAME`) ; sinon, saisissez-le.
4. Chez le registrar où vous avez acheté `emma-arnaud.fr`, ajoutez les enregistrements DNS que GitHub demande (en général une entrée `A` vers les IP de GitHub Pages, ou une entrée `CNAME` si vous utilisez un sous-domaine comme `www`). GitHub affiche la marche à suivre exacte dans cette même page une fois le domaine saisi.
5. Une fois le DNS propagé (de quelques minutes à quelques heures), le site est en ligne sur `https://emma-arnaud.fr/`. En attendant, il reste accessible sur `https://VOTRE-PSEUDO.github.io/mariage/`.

## Photos

Toutes les photos que vous avez envoyées sont en place dans `assets/img/`, compressées pour le web (environ 2,2 Mo au total pour les 12 images du site). Les huit photos de la section « La région » restent chargées depuis Pexels ; pour ne pas dépendre d’un site externe, téléchargez-les dans `assets/img/` et modifiez leurs `src` dans `index.html`.

Vos trois photos supplémentaires illustrent maintenant :
- la carte postale ancienne de Bransles → section « Hébergements » ;
- la robe suspendue → section « Informations pratiques » ;
- le reflet du moulin sous les saules → section « Voyage de noces ».

## Verrou d'accès par mot de passe

Le site demande un mot de passe avant d'afficher son contenu : **`Vienna`** (insensible à la casse — `vienna`, `VIENNA`… fonctionnent aussi). Une fois le bon mot de passe saisi, le navigateur du visiteur s'en souvient (via `localStorage`) : il ne le redemandera pas tant que la personne revient depuis le même appareil et le même navigateur, sauf si elle efface les données de navigation. Il faudra le ressaisir sur chaque nouvel appareil ou navigateur.

⚠️ **Ce n'est pas une vraie protection serveur.** GitHub Pages est un hébergement statique : il n'existe pas de mot de passe « côté serveur » possible sans changer d'hébergeur. Ce verrou est une vérification faite dans le navigateur du visiteur (`js/gate.js`) — il bloque l'accès normal et décourage les visiteurs non invités, mais une personne technique pourrait le contourner (par exemple en lisant le code source, où figure l'empreinte du mot de passe, ou en désactivant JavaScript puis en cherchant le contenu dans le code de la page). Pour une vraie confidentialité (site inaccessible sans authentification, y compris pour un visiteur technique), il faudrait un hébergeur avec protection par mot de passe côté serveur, comme Cloudflare Access (gratuit) ou Netlify (payant pour cette fonction) — ce sont des alternatives à GitHub Pages, pas des compléments.

Pour changer le mot de passe : le mot de passe n'est pas stocké en clair dans le code, seule son empreinte SHA-256 l'est (variable `EXPECTED_HASH` en haut de `js/gate.js`). Pour la remplacer, calculez l'empreinte du nouveau mot de passe **en minuscules**, par exemple dans un terminal :

```
echo -n "nouveaumotdepasse" | shasum -a 256
```

(ou `sha256sum` sous Linux), puis collez le résultat dans `EXPECTED_HASH`.

## WhatsApp

Le bouton « Écrivez-nous sur WhatsApp » (section RSVP) et le lien « contactez-nous » (section Hébergements) utilisent `whatsappUrl` dans `js/config.js`, actuellement vide : ils affichent « bientôt disponible » tant qu'il n'est pas renseigné. Deux options :

- **Discussion de groupe** (recommandé, permet de vous joindre tous les deux dans la même conversation) : dans l'appli WhatsApp, créez un groupe avec vous deux, puis *Infos du groupe → Inviter via lien* et copiez le lien `https://chat.whatsapp.com/...`.
- **Un seul numéro** : `https://wa.me/33612345678` (indicatif du pays, puis le numéro sans le 0 initial ni espaces).

Collez le lien choisi dans `whatsappUrl`.

## Recevoir les réponses RSVP

Un site statique ne peut pas enregistrer de données seul : le formulaire envoie les réponses à un service de votre choix, à renseigner dans `js/config.js` (`rsvp.endpoint`).

### Option recommandée : Google Sheets (gratuit, sans limite raisonnable)

1. Créez une feuille Google Sheets, puis **Extensions → Apps Script**.
2. Remplacez le contenu par le script ci-dessous.
3. **Déployer → Nouveau déploiement → Application Web** ; *Exécuter en tant que* : vous ; *Qui a accès* : **Tout le monde**.
4. Copiez l’URL obtenue (elle se termine par `/exec`) dans `rsvp.endpoint`.

```js
const COLUMNS = [
  "date_envoi", "prenom", "nom", "email", "presence", "accompagne",
  "accompagnant_prenom", "accompagnant_nom", "vendredi", "visite_samedi_matin",
  "samedi", "brunch", "navette", "allergies", "message"
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(COLUMNS);
    sheet.appendRow(COLUMNS.map(name => e.parameter[name] || ""));
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

Après chaque modification du script, refaites **Déployer → Gérer les déploiements → Modifier → Nouvelle version**.

### Alternatives

- **Formspree** (formspree.io) : créez un formulaire, collez son URL dans `endpoint`. Le plan gratuit est limité à quelques dizaines de réponses par mois.
- **Web3Forms** (web3forms.com) : `endpoint: "https://api.web3forms.com/submit"` et `extraFields: { access_key: "VOTRE_CLE" }`. Les réponses arrivent par e-mail.

### Sans service configuré

Si `endpoint` est vide mais `contactEmail` renseigné, le formulaire ouvre un e-mail pré-rempli. Si les deux sont vides, il affiche « Le formulaire n’est pas encore configuré » : à tester avant d’envoyer le lien aux invités.

## Points à vérifier avant l’envoi

- **Cagnotte** : `giftUrl` est vide dans `js/config.js` ; les boutons affichent « bientôt disponible » tant qu’il n’est pas rempli.
- **WhatsApp** : voir la section ci-dessus, `whatsappUrl` est vide pour le moment.
- **RSVP** : `rsvp.endpoint` est configuré avec votre script Google Apps Script ; le formulaire est prêt à enregistrer les réponses. Envoyez-vous une réponse test avant de diffuser le lien aux invités, pour vérifier qu'elle arrive bien dans votre Google Sheet.
- **Coordonnées de la carte** : celles de l'Orangerie du Moulin, de l'Abbaye, de Vaugouard, de la Mairie du 11e et du Danica ont toutes été vérifiées à partir de vos liens Google Maps et sont précises.
- **Cérémonie du samedi** : l’heure et le lieu restent annoncés « prochainement » dans `index.html`, comme demandé.
- **Confidentialité** : le site est configuré en `noindex` (absent de Google) et protégé par le mot de passe `Vienna` (voir section dédiée ci-dessus) — une protection légère côté navigateur, pas une vraie protection serveur.
- **RGPD** : les polices sont chargées depuis Google Fonts. Si vous souhaitez éviter tout appel à Google, téléchargez Cormorant Garamond et Inter (fontsource.org) et déclarez-les avec `@font-face` dans `css/style.css`.

## Tester en local

Ouvrez le dossier dans un terminal et lancez `python3 -m http.server 8000`, puis rendez-vous sur <http://localhost:8000>.
