/*
 * Configuration du site — c'est le seul fichier à modifier pour la plupart des ajustements.
 * Les textes du site se modifient directement dans index.html.
 */
window.SITE_CONFIG = {
  // Adresse définitive du site, utilisée pour le QR code, le bouton « Copier le lien »
  // et l'aperçu du lien dans WhatsApp / iMessage (voir aussi <head> dans index.html).
  siteUrl: "https://emma-arnaud.fr/",

  // Moment visé par le compte à rebours (avec le décalage horaire de Paris : +02:00 en été).
  weddingDate: "2027-07-31T14:00:00+02:00",

  // Lien de la cagnotte (Leetchi, Lydia, PayPal…). Tant qu'il est vide,
  // les boutons affichent « La cagnotte sera bientôt disponible ».
  giftUrl: "",

    // Coordonnées des mariés, utilisées pour les boutons « Écrire à Emma » /
  // « Écrire à Arnaud » (WhatsApp, un lien par personne) et pour le bouton
  // « Nous envoyer un e-mail » (un seul clic, adressé aux deux en même temps).
  // Tant qu'un champ whatsapp est vide, son bouton affiche « bientôt disponible ».
  contacts: {
    emma: { name: "Emma", whatsapp: "https://wa.me/33636358581", email: "em.maisonnial@gmail.com" },
    arnaud: { name: "Arnaud", whatsapp: "https://wa.me/33683959031", email: "arnaud.caillat@gmail.com" }
  },

  // Adresse e-mail de secours (facultative). Utilisée par le formulaire RSVP
  // uniquement si aucun service d'enregistrement (rsvp.endpoint) n'est configuré.
  contactEmail: "arnaud.caillat@gmail.com,em.maisonnial@gmail.com",

  // Enregistrement des réponses RSVP — voir le README (section « Recevoir les réponses »).
  rsvp: {
    endpoint: "https://script.google.com/macros/s/AKfycbwVqjT9eUyBdH9LzmxKJ4iKqTyPK1VK0m1uu6olXmQd0NZXa0MTJL7llQDCHK6pmoyPsQ/exec",
    extraFields: {}   // ex. { access_key: "xxxx" } pour Web3Forms
  },

  // Événements proposés à l'ajout au calendrier (heures de Paris, décalage +02:00 en été).
  // Les heures de fin sont des estimations : ajustez-les.
  // Le bloc « en » contient la version anglaise, utilisée sur les pages /en/.
  events: [
    {
      id: "mariage-civil",
      title: "Mariage civil d’Emma & Arnaud",
      start: "2027-07-30T15:00:00+02:00",
      end: "2027-07-30T16:30:00+02:00",
      location: "Mairie du 11e arrondissement de Paris, 12 place Léon-Blum, 75011 Paris",
      description: "À l’issue de la cérémonie, départ dans l’après-midi vers Bransles et l’Orangerie du Moulin.",
      en: {
        title: "Emma & Arnaud’s civil wedding",
        location: "Paris 11th arrondissement town hall, 12 place Léon-Blum, 75011 Paris",
        description: "After the ceremony, we head out in the afternoon to Bransles and L’Orangerie du Moulin."
      }
    },
    {
      id: "diner-vendredi",
      title: "Dîner informel — Emma & Arnaud",
      start: "2027-07-30T19:30:00+02:00",
      end: "2027-07-30T23:00:00+02:00",
      location: "L’Orangerie du Moulin, 1 Moulin de Gros Lot, 77620 Bransles",
      description: "Dîner informel à l’Orangerie du Moulin, à partir de 19h30.",
      en: {
        title: "Informal dinner — Emma & Arnaud",
        description: "Informal dinner at L’Orangerie du Moulin, from 7:30 pm."
      }
    },
    {
      id: "mariage",
      title: "Mariage d’Emma & Arnaud",
      start: "2027-07-31T18:00:00+02:00",
      end: "2027-08-01T02:00:00+02:00",
      location: "L’Orangerie du Moulin, 1 Moulin de Gros Lot, 77620 Bransles",
      description: "Cocktail à 18h00. Dîner à 20h00. Soirée à partir de 23h00.",
      en: {
        title: "Emma & Arnaud’s wedding",
        description: "Drinks at 6:00 pm. Dinner at 8:00 pm. Party from 11:00 pm."
      }
    },
    {
      id: "brunch",
      title: "Brunch d’Emma & Arnaud",
      start: "2027-08-01T11:30:00+02:00",
      end: "2027-08-01T14:30:00+02:00",
      location: "L’Orangerie du Moulin, 1 Moulin de Gros Lot, 77620 Bransles",
      description: "Après une courte — ou peut-être très courte — nuit, brunch à partir de 11h30.",
      en: {
        title: "Emma & Arnaud’s brunch",
        description: "After a short — or perhaps very short — night, brunch from 11:30 am."
      }
    }
  ],

  // Lieux affichés sur la carte. group : "weekend" ou "lodging".
  // Coordonnées vérifiées via vos liens Google Maps, sauf mention contraire.
  // Pour corriger un pin : clic droit sur le lieu dans Google Maps → copier les coordonnées.
  places: [
    { group: "weekend", name: "Mairie du 11e arrondissement de Paris", address: "12 place Léon-Blum, 75011 Paris", lat: 48.858641, lng: 2.379184, en: { name: "Paris 11th arrondissement town hall" } },
    { group: "weekend", name: "L’Orangerie du Moulin", address: "1 Moulin de Gros Lot, 77620 Bransles", lat: 48.139665, lng: 2.803084 },
    { group: "lodging", name: "Logis Hôtel de l’Abbaye", address: "1 rue de la Prairie de l’Étang, 45210 Ferrières-en-Gâtinais", lat: 48.085824, lng: 2.789567 },
    { group: "lodging", name: "Domaine de Vaugouard — Château & Golf", address: "Chemin des Bois, 45210 Fontenay-sur-Loing", lat: 48.068287, lng: 2.773953 },
    { group: "lodging", name: "Le Danica — Cabanes insolites", address: "Chemin du Puits, 45680 Dordives", lat: 48.151402, lng: 2.775657, en: { name: "Le Danica — Treehouses & cabins" } }
  ],

  // Galerie (à remplir après le mariage). Tant que la liste est vide, le message
  // « Nos souvenirs arrivent bientôt… » s'affiche.
  // Exemple :
  // { src: "assets/gallery/01.jpg", thumb: "assets/gallery/thumbs/01.jpg", alt: "Les mariés sur les marches", caption: "" }
  gallery: []
};
