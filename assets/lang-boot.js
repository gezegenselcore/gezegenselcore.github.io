/* Sync: <html lang> + data-boot-l10n (tr|en) before first paint — gezegensel.js tam seçimi uygular. */
(function () {
  var LOCALES = ["tr", "en", "de", "fr", "es", "it", "pt-BR", "ar"];
  var STORAGE_KEY = "gezegensel-lang";

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

  function bootContentLang(ui) {
    return ui === "tr" ? "tr" : "en";
  }

  function bcp47(ui) {
    if (ui === "pt-BR") return "pt-BR";
    return ui;
  }

  var ui = null;
  try {
    ui = normalize(localStorage.getItem(STORAGE_KEY));
  } catch (e) {}
  if (!ui) ui = fromNavigator();
  if (!ui) ui = "en";

  document.documentElement.lang = bcp47(ui);
  document.documentElement.setAttribute("data-boot-l10n", bootContentLang(ui));
})();
