/*
 * Site de mariage — comportements.
 * Aucune dépendance obligatoire : Leaflet (carte) et qrcodejs (QR code) sont chargés
 * en option ; si l'un des deux est indisponible, le reste du site fonctionne.
 */
(() => {
  "use strict";

  const cfg = window.SITE_CONFIG || {};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const siteUrl = cfg.siteUrl || location.href.split("#")[0];

  /* ---------- Utilitaires ---------- */

  let toastTimer;
  function toast(message) {
    const el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3200);
  }

  const mapsUrl = place =>
    "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(`${place.name}, ${place.address}`);

  /* ---------- Menu mobile ---------- */

  function initMenu() {
    const button = $("#menu-toggle");
    const menu = $("#mobile-menu");
    const desktopList = $("#site-nav ul");
    if (!button || !menu || !desktopList) return;

    $("ul", menu).innerHTML = desktopList.innerHTML; // un seul endroit à maintenir
    const icon = $("use", button);

    const setOpen = open => {
      menu.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      icon.setAttribute("href", open ? "#i-x" : "#i-menu");
    };

    button.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    menu.addEventListener("click", event => { if (event.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) { setOpen(false); button.focus(); }
    });
    window.matchMedia("(min-width: 1024px)").addEventListener("change", event => { if (event.matches) setOpen(false); });
  }

  /* Met en évidence la section visible dans la navigation */
  function initScrollSpy() {
    if (!("IntersectionObserver" in window)) return;
    const links = $$(".site-nav a, .mobile-menu a");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const hash = "#" + entry.target.id;
        links.forEach(a => (a.getAttribute("href") === hash ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current")));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(section => observer.observe(section));
  }

  /* ---------- Compte à rebours ---------- */

  function initCountdown() {
    const box = $("#countdown");
    if (!box) return;
    const target = new Date(cfg.weddingDate).getTime();
    if (Number.isNaN(target)) { box.hidden = true; return; }

    const days = $("#cd-days"), hours = $("#cd-hours"), minutes = $("#cd-minutes");
    let timer;

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        box.classList.add("countdown--done");
        box.textContent = diff > -3 * 864e5 ? "C’est le grand jour !" : "Merci d’avoir été des nôtres.";
        return;
      }
      days.textContent = Math.floor(diff / 864e5);
      hours.textContent = Math.floor((diff % 864e5) / 36e5);
      minutes.textContent = Math.floor((diff % 36e5) / 6e4);
    };

    tick();
    timer = setInterval(tick, 20000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });
  }

  /* ---------- Ajout au calendrier ---------- */

  const icsDate = iso => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const icsEscape = text => String(text || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

  // Les lignes d'un fichier .ics ne doivent pas dépasser 75 caractères : on les « plie ».
  function icsFold(line) {
    if (line.length <= 74) return line;
    const parts = [line.slice(0, 74)];
    for (let i = 74; i < line.length; i += 73) parts.push(" " + line.slice(i, i + 73));
    return parts.join("\r\n");
  }

  function buildIcs() {
    const stamp = icsDate(new Date().toISOString());
    const host = location.hostname || "mariage";
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Emma et Arnaud//Mariage//FR", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    (cfg.events || []).forEach(event => {
      lines.push(
        "BEGIN:VEVENT",
        `UID:${event.id}@${host}`,
        `DTSTAMP:${stamp}`,
        `DTSTART:${icsDate(event.start)}`,
        `DTEND:${icsDate(event.end)}`,
        `SUMMARY:${icsEscape(event.title)}`,
        `LOCATION:${icsEscape(event.location)}`,
        `DESCRIPTION:${icsEscape(event.description)}`,
        "END:VEVENT"
      );
    });
    lines.push("END:VCALENDAR");
    return lines.map(icsFold).join("\r\n") + "\r\n";
  }

  function initCalendar() {
    const google = $("#btn-google-cal");
    const ics = $("#btn-ics");
    const events = cfg.events || [];
    if (!events.length) { $(".actions")?.setAttribute("hidden", ""); return; }

    google?.addEventListener("click", () => {
      const event = events.find(e => e.id === "mariage") || events[0];
      const url = "https://calendar.google.com/calendar/render?action=TEMPLATE"
        + "&text=" + encodeURIComponent(event.title)
        + "&dates=" + icsDate(event.start) + "/" + icsDate(event.end)
        + "&location=" + encodeURIComponent(event.location)
        + "&details=" + encodeURIComponent(event.description);
      window.open(url, "_blank", "noopener,noreferrer");
    });

    ics?.addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([buildIcs()], { type: "text/calendar;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "mariage-emma-arnaud.ics";
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
  }

  /* ---------- Cagnotte & contact ---------- */

  function initLinks() {
    $$("[data-gift]").forEach(el => {
      if (cfg.giftUrl) {
        el.href = cfg.giftUrl;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      } else {
        el.addEventListener("click", event => { event.preventDefault(); toast("La cagnotte sera bientôt disponible."); });
      }
    });
    $$("[data-whatsapp]").forEach(el => {
      const person = (cfg.contacts || {})[el.dataset.whatsapp];
      if (person && person.whatsapp) {
        el.href = person.whatsapp;
        el.target = "_blank";
        el.rel = "noopener noreferrer";
      } else {
        el.addEventListener("click", event => { event.preventDefault(); toast("Ce contact WhatsApp sera bientôt disponible."); });
      }
    });
    $$("[data-email-both]").forEach(el => {
      const addresses = Object.values(cfg.contacts || {}).map(p => p.email).filter(Boolean);
      if (addresses.length) {
        el.href = "mailto:" + addresses.join(",") + "?subject=" + encodeURIComponent("Mariage d’Emma & Arnaud");
      } else {
        el.addEventListener("click", event => { event.preventDefault(); toast("L’e-mail de contact sera bientôt disponible."); });
      }
    });
  }

  /* ---------- Carte ---------- */

  const GROUP_COLORS = { weekend: "#304038", lodging: "#9a7952" };

  function renderPlacesList(places) {
    const list = $("#places-list");
    if (!list) return;
    places.forEach(place => {
      const item = document.createElement("li");
      const name = document.createElement("strong");
      name.textContent = place.name;
      const address = document.createElement("span");
      address.textContent = " · " + place.address;
      const link = document.createElement("a");
      link.className = "link";
      link.href = mapsUrl(place);
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Ouvrir dans Maps";
      item.append(name, address, document.createElement("br"), link);
      list.append(item);
    });
  }

  function popupNode(place) {
    const box = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = place.name;
    const link = document.createElement("a");
    link.href = mapsUrl(place);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Ouvrir dans Maps";
    box.append(name, document.createElement("br"), document.createTextNode(place.address), document.createElement("br"), link);
    return box;
  }

  function initMap() {
    const element = $("#weekend-map");
    const places = cfg.places || [];
    if (!element) return;
    renderPlacesList(places);
    if (!places.length) return;

    let started = false;
    const start = () => {
      if (started || !window.L) return;
      started = true;
      const map = L.map(element, {
        scrollWheelZoom: false,
        dragging: !L.Browser.mobile // évite de bloquer le défilement de la page au doigt
      });
      map.attributionControl.setPrefix(false);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
      }).addTo(map);

      const bounds = places.map(place => {
        L.circleMarker([place.lat, place.lng], {
          radius: 8, color: "#f7f4ec", weight: 3, fillColor: GROUP_COLORS[place.group] || GROUP_COLORS.weekend, fillOpacity: 1
        }).addTo(map).bindPopup(popupNode(place));
        return [place.lat, place.lng];
      });
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    };

    // La carte ne se charge que lorsqu'elle approche de l'écran.
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); start(); }
      }, { rootMargin: "300px" });
      observer.observe(element);
    } else {
      start();
    }
  }

  /* ---------- Partage ---------- */

  function initShare() {
    const qr = $("#qrcode");
    if (qr && window.QRCode) {
      new QRCode(qr, { text: siteUrl, width: 92, height: 92, colorDark: "#304038", colorLight: "#f7f4ec", correctLevel: QRCode.CorrectLevel.M });
    } else {
      $("#qr-block")?.setAttribute("hidden", "");
    }

    $("#copy-link")?.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(siteUrl); toast("Lien copié."); }
      catch { toast("Copiez cette adresse : " + siteUrl); }
    });
  }

  function initBackToTop() {
    const button = $("#back-top");
    if (!button) return;
    const update = () => button.classList.toggle("is-visible", window.scrollY > 700);
    window.addEventListener("scroll", update, { passive: true });
    button.addEventListener("click", () => window.scrollTo(0, 0)); // le défilement doux est géré par le CSS
    update();
  }

  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach(el => el.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: .12 });
    items.forEach(el => observer.observe(el));
  }

  /* Une image introuvable ne doit pas afficher d'icône cassée. */
  function watchImages(root = document) {
    $$("img", root).forEach(img => {
      const mark = () => img.classList.add("is-broken");
      if (img.complete && img.naturalWidth === 0) mark();
      else img.addEventListener("error", mark, { once: true });
    });
  }

  /* ---------- RSVP ---------- */

  async function sendRsvp(data) {
    const { endpoint, extraFields } = cfg.rsvp || {};
    if (endpoint) {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new URLSearchParams({ ...(extraFields || {}), ...data })
      });
      if (!response.ok) throw new Error("http-" + response.status);
      return "sent";
    }
    if (cfg.contactEmail) { // secours : on prépare un e-mail
      const body = Object.entries(data).filter(([, v]) => v).map(([k, v]) => `${k} : ${v}`).join("\n");
      location.href = `mailto:${cfg.contactEmail}?subject=${encodeURIComponent("RSVP mariage")}&body=${encodeURIComponent(body)}`;
      return "mailto";
    }
    throw new Error("no-endpoint");
  }

  function initRsvp() {
    const form = $("#rsvp-form");
    if (!form) return;

    const attending = $("#rsvp-attending");
    const companionNames = $("#companion-names");
    const status = $("#rsvp-status");
    const submit = $("#rsvp-submit");
    const success = $("#rsvp-success");

    const checked = name => form.querySelector(`input[name="${name}"]:checked`)?.value || "";
    const setGroup = (group, show) => {
      group.hidden = !show;
      $$("input, textarea", group).forEach(input => { input.disabled = !show; }); // les champs masqués ne sont pas envoyés
    };

    function sync() {
      const going = checked("presence") === "oui";
      setGroup(attending, going);
      if (going) setGroup(companionNames, checked("accompagne") === "oui");
    }
    form.addEventListener("change", sync);
    sync();

    function clearErrors() {
      $$(".field__error", form).forEach(p => { p.textContent = ""; });
      $$("input[aria-invalid]", form).forEach(input => input.setAttribute("aria-invalid", "false"));
    }

    function validate(fd) {
      const value = name => String(fd.get(name) || "").trim();
      const errors = [];
      if (!value("prenom")) errors.push(["prenom", "Merci d’indiquer votre prénom."]);
      if (!value("nom")) errors.push(["nom", "Merci d’indiquer votre nom."]);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value("email"))) errors.push(["email", "Merci d’indiquer une adresse e-mail valide."]);
      if (!value("presence")) errors.push(["presence", "Merci de choisir une réponse."]);
      if (value("presence") === "oui") {
        if (!value("accompagne")) errors.push(["accompagne", "Merci de choisir une réponse."]);
        if (value("accompagne") === "oui") {
          if (!value("accompagnant_prenom")) errors.push(["accompagnant_prenom", "Merci d’indiquer le prénom de votre accompagnant."]);
          if (!value("accompagnant_nom")) errors.push(["accompagnant_nom", "Merci d’indiquer le nom de votre accompagnant."]);
        }
        if (!fd.getAll("moments").length) errors.push(["moments", "Merci de sélectionner au moins un moment du week-end."]);
      }
      return errors;
    }

    function buildPayload(fd) {
      const value = name => String(fd.get(name) || "").trim();
      const going = value("presence") === "oui";
      const moments = fd.getAll("moments");
      const yesNo = flag => (flag ? "oui" : "non");
      return {
        prenom: value("prenom"),
        nom: value("nom"),
        email: value("email"),
        presence: value("presence"),
        accompagne: going ? value("accompagne") : "",
        accompagnant_prenom: value("accompagnant_prenom"),
        accompagnant_nom: value("accompagnant_nom"),
        vendredi: yesNo(going && moments.includes("vendredi")),
        visite_samedi_matin: yesNo(going && moments.includes("visite")),
        samedi: yesNo(going && moments.includes("samedi")),
        brunch: yesNo(going && moments.includes("brunch")),
        navette: yesNo(going && fd.has("navette")),
        allergies: value("allergies"),
        message: value("message"),
        date_envoi: new Date().toISOString()
      };
    }

    form.addEventListener("submit", async event => {
      event.preventDefault();
      status.textContent = "";
      success.hidden = true;
      clearErrors();

      const fd = new FormData(form);
      if (fd.get("website")) return; // champ piège rempli : on ignore silencieusement

      const errors = validate(fd);
      if (errors.length) {
        errors.forEach(([id, message]) => {
          const error = $("#" + id + "-error");
          if (error) error.textContent = message;
          const input = document.getElementById(id);
          if (input) input.setAttribute("aria-invalid", "true");
        });
        const [firstId] = errors[0];
        (document.getElementById(firstId) || $(`fieldset[aria-describedby="${firstId}-error"] input`, form))?.focus();
        return;
      }

      submit.disabled = true;
      status.textContent = "Envoi de votre réponse…";
      try {
        const result = await sendRsvp(buildPayload(fd));
        if (result === "mailto") {
          status.textContent = "Votre messagerie va s’ouvrir : il ne reste qu’à envoyer le message.";
        } else {
          form.reset();
          sync();
          status.textContent = "";
          success.hidden = false;
          success.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      } catch (error) {
        status.textContent = error.message === "no-endpoint"
          ? "Le formulaire n’est pas encore configuré."
          : "Une erreur est survenue. Merci de réessayer dans un instant.";
      } finally {
        submit.disabled = false;
      }
    });
  }

  /* ---------- Galerie ---------- */

  function initGallery() {
    const photos = cfg.gallery || [];
    const grid = $("#gallery-grid");
    const dialog = $("#lightbox");
    if (!photos.length || !grid || !dialog || typeof dialog.showModal !== "function") return;

    $("#gallery-empty").hidden = true;
    grid.hidden = false;

    const big = $("#lightbox-img");
    const caption = $("#lightbox-caption");
    let index = 0;

    const show = i => {
      index = (i + photos.length) % photos.length;
      const photo = photos[index];
      big.src = photo.src;
      big.alt = photo.alt || "";
      caption.textContent = photo.caption || photo.alt || "";
    };

    photos.forEach((photo, i) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gallery__item";
      button.setAttribute("aria-label", `Agrandir la photo ${i + 1}` + (photo.alt ? ` : ${photo.alt}` : ""));
      const img = new Image();
      img.src = photo.thumb || photo.src;
      img.alt = "";
      img.loading = "lazy";
      img.decoding = "async";
      button.append(img);
      button.addEventListener("click", () => { show(i); dialog.showModal(); });
      grid.append(button);
    });
    watchImages(grid);

    $("#lightbox-close").addEventListener("click", () => dialog.close());
    $("#lightbox-prev").addEventListener("click", () => show(index - 1));
    $("#lightbox-next").addEventListener("click", () => show(index + 1));
    dialog.addEventListener("keydown", event => {
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });
    dialog.addEventListener("click", event => {
      if (event.target === dialog || event.target.classList.contains("lightbox__stage")) dialog.close();
    });

    let touchX = null; // balayage au doigt
    dialog.addEventListener("touchstart", event => { touchX = event.changedTouches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", event => {
      if (touchX === null) return;
      const delta = event.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 50) show(index + (delta < 0 ? 1 : -1));
      touchX = null;
    }, { passive: true });
  }

  /* ---------- Démarrage ---------- */

  function init() {
    initMenu();
    initScrollSpy();
    initCountdown();
    initCalendar();
    initLinks();
    initMap();
    initShare();
    initBackToTop();
    initReveal();
    initRsvp();
    initGallery();
    watchImages();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
