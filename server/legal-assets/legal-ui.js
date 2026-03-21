/**
 * YumKeeper Legal Pages — Shared UI
 * Provides:
 *   1. GDPR cookie/analytics consent banner
 *   2. EN / FR / DE / ES language switcher
 *
 * Both features are fully self-contained and use localStorage only.
 * No external scripts or tracking pixels are loaded until the user accepts.
 */

// ─── 1. GDPR Cookie Consent Banner ────────────────────────────────────────────

(function initCookieBanner() {
  const CONSENT_KEY = "yumkeeper_cookie_consent";
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored) return; // Already decided — don't show again

  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent");
  banner.innerHTML = `
    <div class="cb-inner">
      <div class="cb-text">
        <strong>🍪 We respect your privacy</strong>
        <p>
          We use essential cookies to make this site work. We would also like to use
          optional analytics cookies to understand how you use our legal pages and improve them.
          You can accept or decline optional cookies below.
          See our <a href="/privacy-policy">Privacy Policy</a> for details.
        </p>
      </div>
      <div class="cb-actions">
        <button id="cb-decline" class="cb-btn cb-btn-secondary">Decline optional</button>
        <button id="cb-accept" class="cb-btn cb-btn-primary">Accept all</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  function dismiss(accepted) {
    localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined");
    banner.classList.add("cb-hide");
    setTimeout(() => banner.remove(), 400);
    if (accepted) {
      // Placeholder: fire analytics initialisation here when you add a provider
      // e.g. window.gtag('consent', 'update', { analytics_storage: 'granted' });
      console.log("[YumKeeper] Analytics consent granted.");
    }
  }

  document.getElementById("cb-accept").addEventListener("click", () => dismiss(true));
  document.getElementById("cb-decline").addEventListener("click", () => dismiss(false));
})();


// ─── 2. Language Switcher ─────────────────────────────────────────────────────

(function initLanguageSwitcher() {
  const LANG_KEY = "yumkeeper_legal_lang";
  const LANGS = { en: "English", fr: "Français", de: "Deutsch", es: "Español" };

  // Detect saved preference or browser language
  const saved = localStorage.getItem(LANG_KEY);
  const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  const defaultLang = saved || (LANGS[browserLang] ? browserLang : "en");

  // Build switcher widget
  const switcher = document.createElement("div");
  switcher.id = "lang-switcher";
  switcher.setAttribute("aria-label", "Language switcher");
  switcher.innerHTML = Object.entries(LANGS)
    .map(([code, label]) =>
      `<button class="lang-btn${code === defaultLang ? " lang-active" : ""}" data-lang="${code}">${label}</button>`
    )
    .join("");

  // Insert after header
  const header = document.querySelector("header");
  if (header && header.nextSibling) {
    header.parentNode.insertBefore(switcher, header.nextSibling);
  } else {
    document.body.prepend(switcher);
  }

  // Apply translations
  function applyLang(lang) {
    document.querySelectorAll("[data-lang-en]").forEach((el) => {
      const key = `data-lang-${lang}`;
      const fallback = el.getAttribute("data-lang-en");
      el.textContent = el.getAttribute(key) || fallback;
    });
    // Update active button
    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("lang-active", btn.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    localStorage.setItem(LANG_KEY, lang);
  }

  // Wire up buttons
  switcher.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang-btn");
    if (btn) applyLang(btn.dataset.lang);
  });

  // Apply on load
  applyLang(defaultLang);
})();
