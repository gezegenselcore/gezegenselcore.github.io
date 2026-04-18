/**
 * Ana sayfa (tr/en): fareye göre çok hafif arka plan parallax (--gc-px / --gc-py).
 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var max = 12;
  window.addEventListener(
    "mousemove",
    function (e) {
      var x = ((e.clientX / window.innerWidth) - 0.5) * 2 * max;
      var y = ((e.clientY / window.innerHeight) - 0.5) * 2 * max;
      document.documentElement.style.setProperty("--gc-px", x.toFixed(2));
      document.documentElement.style.setProperty("--gc-py", y.toFixed(2));
    },
    { passive: true }
  );
})();
