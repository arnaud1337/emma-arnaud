/*
 * Choix de la langue (français par défaut, anglais dans le dossier /en/).
 *
 * - Le français reste la version par défaut du site.
 * - Quand un invité choisit « EN » (ou arrive directement sur une page anglaise),
 *   son navigateur s'en souvient : s'il revient plus tard sur l'adresse principale,
 *   il est renvoyé automatiquement vers la version anglaise. Cliquer sur « FR »
 *   annule ce choix.
 * - En changeant de langue, on reste au même endroit de la page (#rsvp, etc.) :
 *   les ancres sont identiques dans les deux versions.
 *
 * Ce script est chargé dans le <head> de chaque page, avant l'affichage.
 * Sur les pages françaises, l'attribut data-alt-en de la balise <html> indique
 * l'adresse de la page anglaise correspondante.
 */
(function () {
  "use strict";

  var KEY = "eaLang";
  var root = document.documentElement;
  var lang = root.lang === "en" ? "en" : "fr";

  function getPref() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function setPref(value) {
    try { window.localStorage.setItem(KEY, value); } catch (e) { /* stockage indisponible */ }
  }

  // Page française, mais l'invité a choisi l'anglais : on bascule avant l'affichage.
  if (lang === "fr" && getPref() === "en") {
    var target = root.getAttribute("data-alt-en");
    if (target) {
      window.location.replace(target + window.location.search + window.location.hash);
      return;
    }
  }

  if (lang === "en") setPref("en");

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("[data-lang-link]");
    if (!link) return;
    setPref(link.getAttribute("data-lang-link"));
    if (window.location.hash && !link.hash) {
      event.preventDefault();
      window.location.href = link.href + window.location.hash;
    }
  });
})();
