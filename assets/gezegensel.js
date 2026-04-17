/**
 * GezegenselCore statik site — dil: Aura ile aynı 8 kod (tr, en, de, fr, es, it, pt-BR, ar).
 * Aynı üst öğede birden fazla .l10n-* / policy-locale-* varsa: seçilen dil varsa o, yoksa TR aksi EN.
 */
(function () {
  var STORAGE_KEY = "gezegensel-lang";
  var LOCALES = ["tr", "en", "de", "fr", "es", "it", "pt-BR", "ar"];

  function normalize(v) {
    if (!v || typeof v !== "string") return null;
    v = v.trim();
    return LOCALES.indexOf(v) >= 0 ? v : null;
  }

  function fromNavigator() {
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

  function detect() {
    try {
      var s = normalize(localStorage.getItem(STORAGE_KEY));
      if (s) return s;
    } catch (e) {}
    return fromNavigator();
  }

  function localeCodeFromNode(el) {
    if (el.classList.contains("policy-locale-tr")) return "tr";
    if (el.classList.contains("policy-locale-en")) return "en";
    for (var i = 0; i < el.classList.length; i++) {
      var c = el.classList[i];
      if (c.indexOf("l10n-") === 0) return c.slice(5);
    }
    return null;
  }

  function applySiblingL10n(uiLang) {
    var parents = new Map();
    var candidates = document.querySelectorAll(
      '[class*="l10n-"], .policy-locale-tr, .policy-locale-en'
    );
    candidates.forEach(function (el) {
      var p = el.parentElement;
      if (!p) return;
      if (!parents.has(p)) parents.set(p, []);
      parents.get(p).push(el);
    });

    parents.forEach(function (rawChildren, p) {
      var children = rawChildren.filter(function (c) {
        return c.parentElement === p && localeCodeFromNode(c);
      });
      if (children.length < 2) return;

      var exact = null;
      for (var j = 0; j < children.length; j++) {
        if (localeCodeFromNode(children[j]) === uiLang) {
          exact = children[j];
          break;
        }
      }
      function findFirst(arr, pred) {
        for (var k = 0; k < arr.length; k++) {
          if (pred(arr[k])) return arr[k];
        }
        return null;
      }
      var pick =
        exact ||
        (uiLang === "tr" ? findFirst(children, function (n) { return localeCodeFromNode(n) === "tr"; }) : null);
      if (!pick) pick = findFirst(children, function (n) { return localeCodeFromNode(n) === "en"; });
      if (!pick) pick = children[0];

      children.forEach(function (c) {
        var on = c === pick;
        c.style.setProperty("display", on ? "" : "none", "important");
      });
    });
  }

  function applyContentSections(uiLang) {
    var tr = document.getElementById("content-tr");
    var en = document.getElementById("content-en");
    if (!tr && !en) return;
    var showTr = uiLang === "tr";
    if (tr) {
      tr.style.setProperty("display", showTr ? "block" : "none", "important");
    }
    if (en) {
      en.style.setProperty("display", showTr ? "none" : "block", "important");
    }
  }

  function bcp47(ui) {
    if (ui === "pt-BR") return "pt-BR";
    return ui;
  }

  function applyLang(lang) {
    var ui = normalize(lang) || "en";
    try {
      localStorage.setItem(STORAGE_KEY, ui);
    } catch (e) {}

    document.documentElement.lang = bcp47(ui);
    document.documentElement.dir = ui === "ar" ? "rtl" : "ltr";
    document.documentElement.removeAttribute("data-boot-l10n");

    document.querySelectorAll(".gc-lang-btn").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === ui;
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });

    applySiblingL10n(ui);
    applyContentSections(ui);

    var legacyTr = document.getElementById("btn-tr");
    var legacyEn = document.getElementById("btn-en");
    if (legacyTr && legacyEn) {
      legacyTr.setAttribute("aria-pressed", ui === "tr" ? "true" : "false");
      legacyEn.setAttribute("aria-pressed", ui === "en" ? "true" : "false");
    }

    var tTr = document.body && document.body.getAttribute("data-title-tr");
    var tEn = document.body && document.body.getAttribute("data-title-en");
    if (tTr && tEn) {
      document.title = ui === "tr" ? tTr : tEn;
    }
  }

  function scrollToAccountDeletionSection() {
    var raw = (typeof location !== "undefined" && location.hash) || "";
    if (raw.replace(/^#/, "") !== "account-deletion") return;
    var ui = detect();
    var el =
      ui === "tr"
        ? document.getElementById("account-deletion")
        : document.querySelector("#content-en .gc-account-deletion-heading");
    if (!el) return;
    window.requestAnimationFrame(function () {
      try {
        el.scrollIntoView({ block: "start", behavior: "auto" });
      } catch (e) {
        el.scrollIntoView(true);
      }
    });
  }

  function onReady() {
    applyLang(detect());
    scrollToAccountDeletionSection();
    document.querySelectorAll(".gc-lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang") || "en");
        scrollToAccountDeletionSection();
      });
    });
    var legacyTr = document.getElementById("btn-tr");
    var legacyEn = document.getElementById("btn-en");
    if (legacyTr) {
      legacyTr.addEventListener("click", function () {
        applyLang("tr");
        scrollToAccountDeletionSection();
      });
    }
    if (legacyEn) {
      legacyEn.addEventListener("click", function () {
        applyLang("en");
        scrollToAccountDeletionSection();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }

  window.gezegenselSetLang = applyLang;
})();
