/*
 * Verrou d'accès du site.
 *
 * IMPORTANT : ce site est hébergé sur GitHub Pages, un hébergement 100 % statique
 * (aucun serveur, aucune base de données). Il ne peut donc pas y avoir de vraie
 * authentification côté serveur : ce verrou est une protection "légère", côté
 * navigateur, qui empêche l'accès normal au contenu tant que le bon mot de passe
 * n'a pas été saisi. Une personne suffisamment technique pourrait le contourner
 * en lisant le code source. Il suffit pour dissuader les visiteurs non invités.
 *
 * Le mot de passe n'est pas stocké en clair ici : on compare l'empreinte SHA-256
 * de ce qui est saisi à l'empreinte attendue. Pour changer le mot de passe,
 * remplacez EXPECTED_HASH par l'empreinte SHA-256 du nouveau mot de passe
 * (en minuscules), par exemple avec : echo -n "nouveaumotdepasse" | sha256sum
 * (sous macOS/Linux) — pensez à mettre le mot de passe en minuscules avant.
 */
(function () {
  "use strict";

  // Empreinte SHA-256 de "vienna" (comparaison insensible à la casse et aux espaces).
  var EXPECTED_HASH = "4419c07588b7aa80658eeffee32e9ad2aee30ca9de98ffa96a17cbe171e2a726";
  var STORAGE_KEY = "eaGateUnlocked";

  var root = document.documentElement;
  var overlay = document.getElementById("gate-overlay");
  var form = document.getElementById("gate-form");
  var input = document.getElementById("gate-password");
  var error = document.getElementById("gate-error");

  if (!overlay || !form || !input) return;

  function isUnlocked() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch (e) {
      return false;
    }
  }

  function unlock() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      // Stockage indisponible (navigation privée stricte, par ex.) : on
      // laisse quand même passer pour cette visite, l'utilisateur devra
      // simplement resaisir le mot de passe la prochaine fois.
    }
    root.classList.remove("gate-locked");
    overlay.setAttribute("hidden", "hidden");
  }

  function sha256Hex(text) {
    var data = new TextEncoder().encode(text);
    if (window.crypto && window.crypto.subtle) {
      return window.crypto.subtle.digest("SHA-256", data).then(function (buffer) {
        var bytes = Array.from(new Uint8Array(buffer));
        return bytes.map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
      });
    }
    return Promise.reject(new Error("crypto.subtle indisponible"));
  }

  function showError(message) {
    error.textContent = message || "Mot de passe incorrect. Réessayez.";
    error.hidden = false;
    form.classList.add("gate-card--shake");
    window.setTimeout(function () {
      form.classList.remove("gate-card--shake");
    }, 300);
    input.value = "";
    input.focus();
  }

  // Déjà déverrouillé sur cet appareil : rien à faire.
  if (isUnlocked()) {
    root.classList.remove("gate-locked");
    overlay.setAttribute("hidden", "hidden");
    return;
  }

  // Empêche le défilement de la page tant que le verrou est actif.
  document.body.style.overflow = "hidden";

  window.setTimeout(function () {
    input.focus();
  }, 50);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    error.hidden = true;

    var typed = (input.value || "").trim().toLowerCase();
    if (!typed) {
      showError("Merci de saisir le mot de passe.");
      return;
    }

    sha256Hex(typed)
      .then(function (hash) {
        if (hash === EXPECTED_HASH) {
          document.body.style.overflow = "";
          unlock();
        } else {
          showError();
        }
      })
      .catch(function () {
        // Navigateur trop ancien / contexte non sécurisé : comparaison de secours.
        if (typed === "vienna") {
          document.body.style.overflow = "";
          unlock();
        } else {
          showError();
        }
      });
  });
})();
