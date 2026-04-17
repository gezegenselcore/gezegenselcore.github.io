/**
 * AURA kanonik hukuk / destek HTML sayfaları — Aura uygulamasıyla aynı dil kodları.
 * Tam metin yalnızca TR ve EN; diğer seçimlerde içerik EN + yerelleştirilmiş kısa uyarı.
 */
(function () {
  /** Marka sitesi navbar ile aynı tercih (`gezegensel.js`). */
  var STORAGE_KEY = "gezegensel-lang";
  var LOCALES = ["tr", "en", "de", "fr", "es", "it", "pt-BR", "ar"];
  var PICKER_LABELS = { tr: "Dil", en: "Language", de: "Sprache", fr: "Langue", es: "Idioma", it: "Lingua", "pt-BR": "Idioma", ar: "اللغة" };
  var BTN_SHORT = { tr: "TR", en: "EN", de: "DE", fr: "FR", es: "ES", it: "IT", "pt-BR": "PT", ar: "AR" };
  var FALLBACK_BANNER = {
    tr: "",
    en: "",
    de: "Der vollständige Rechtstext erscheint auf Englisch.",
    fr: "Le texte juridique complet est en anglais.",
    es: "El texto legal completo está en inglés.",
    it: "Il testo legale completo è in inglese.",
    "pt-BR": "O texto legal completo está em inglês.",
    ar: "النص القانوني الكامل معروض بالإنجليزية."
  };

  function normalizeFromStorage(v) {
    if (!v || typeof v !== "string") return null;
    v = v.trim();
    if (LOCALES.indexOf(v) >= 0) return v;
    return null;
  }

  function mapNavigatorToLocale() {
    var list =
      typeof navigator !== "undefined"
        ? navigator.languages || [navigator.language || navigator.userLanguage || "en"]
        : ["en"];
    for (var i = 0; i < list.length; i++) {
      var raw = String(list[i]).toLowerCase();
      if (raw.indexOf("tr") === 0) return "tr";
      if (raw.indexOf("pt") === 0) return "pt-BR";
      if (raw.indexOf("de") === 0) return "de";
      if (raw.indexOf("fr") === 0) return "fr";
      if (raw.indexOf("es") === 0) return "es";
      if (raw.indexOf("it") === 0) return "it";
      if (raw.indexOf("ar") === 0) return "ar";
      if (raw.indexOf("en") === 0) return "en";
    }
    return "en";
  }

  function detectLocale() {
    try {
      var s = normalizeFromStorage(localStorage.getItem(STORAGE_KEY));
      if (s) return s;
      var legacy = normalizeFromStorage(localStorage.getItem("aura-public-lang"));
      if (legacy) {
        localStorage.setItem(STORAGE_KEY, legacy);
        localStorage.removeItem("aura-public-lang");
        return legacy;
      }
    } catch (e) {}
    return mapNavigatorToLocale();
  }

  function contentLang(ui) {
    return ui === "tr" ? "tr" : "en";
  }

  function bcp47(ui) {
    if (ui === "pt-BR") return "pt-BR";
    return ui;
  }

  /** Hukuki metin (TR/EN) her zaman soldan sağa okunur; Arapça arayüz etiketleri yine LTR. */
  function setDir() {
    document.documentElement.dir = "ltr";
  }

  function apply() {
    var ui = detectLocale();
    var mount = document.getElementById("aura-legal-picker");
    var trBlock = document.getElementById("aura-block-tr");
    var enBlock = document.getElementById("aura-block-en");
    var banner = document.getElementById("aura-legal-fallback-banner");
    if (!trBlock || !enBlock) return;

    setDir();
    document.documentElement.setAttribute("lang", bcp47(ui));

    var c = contentLang(ui);
    trBlock.hidden = c !== "tr";
    enBlock.hidden = c !== "en";

    if (banner) {
      var msg = FALLBACK_BANNER[ui] || "";
      if (msg) {
        banner.textContent = msg;
        banner.hidden = false;
      } else {
        banner.textContent = "";
        banner.hidden = true;
      }
    }

    var titleTr = document.body.getAttribute("data-title-tr");
    var titleEn = document.body.getAttribute("data-title-en");
    if (titleTr && titleEn) {
      document.title = c === "tr" ? titleTr : titleEn;
    }

    if (mount && !mount.dataset.built) {
      mount.dataset.built = "1";
      var lab = document.createElement("span");
      lab.className = "aura-legal-picker-label";
      lab.setAttribute("data-aura-picker-label", "1");
      mount.appendChild(lab);
      LOCALES.forEach(function (code) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("data-aura-lang", code);
        b.textContent = BTN_SHORT[code] || code;
        b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", function () {
          try {
            localStorage.setItem(STORAGE_KEY, code);
          } catch (e) {}
          apply();
          scrollAccountDeletionIfNeeded();
        });
        mount.appendChild(b);
      });
    }

    if (mount) {
      var pl = mount.querySelector("[data-aura-picker-label]");
      if (pl) pl.textContent = PICKER_LABELS[ui] || PICKER_LABELS.en;
      mount.querySelectorAll("[data-aura-lang]").forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-aura-lang") === ui ? "true" : "false");
      });
    }

    scrollAccountDeletionIfNeeded();
  }

  function scrollAccountDeletionIfNeeded() {
    var raw = (typeof location !== "undefined" && location.hash) || "";
    if (raw.replace(/^#/, "") !== "account-deletion") return;
    var c = contentLang(detectLocale());
    var el =
      c === "tr"
        ? document.getElementById("account-deletion")
        : document.getElementById("account-deletion-en");
    if (!el) return;
    window.requestAnimationFrame(function () {
      try {
        el.scrollIntoView({ block: "start", behavior: "smooth" });
      } catch (e) {
        el.scrollIntoView(true);
      }
    });
  }

  document.body.classList.add("aura-legal-body");

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }

  window.addEventListener("hashchange", scrollAccountDeletionIfNeeded);
})();
