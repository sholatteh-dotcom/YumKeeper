/**
 * YumKeeper Legal Pages — Shared UI
 * Provides:
 *   1. GDPR cookie/analytics consent banner
 *   2. EN / FR / DE / ES / NL language switcher with full body-text translations
 *
 * Both features are fully self-contained and use localStorage only.
 * No external scripts or tracking pixels are loaded until the user accepts.
 */

// ─── Translation Strings ──────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    // Cookie banner
    cookieTitle: "🍪 We respect your privacy",
    cookieBody: "We use essential cookies to make this site work. We would also like to use optional analytics cookies to understand how you use our legal pages and improve them. You can accept or decline optional cookies below. See our <a href=\"/privacy-policy\">Privacy Policy</a> for details.",
    cookieAccept: "Accept all",
    cookieDecline: "Decline optional",
    // Privacy Policy page headings
    ppTitle: "Privacy Policy",
    ppLastReviewed: "Last reviewed: 21 March 2026",
    ppCompliance: "This privacy policy complies with the EU General Data Protection Regulation (GDPR) 2016/679.",
    ppFooter: "© 2026 YumKeeper. All rights reserved.",
    // Terms page headings
    tosTitle: "Terms of Service",
    tosLastReviewed: "These Terms of Service were last reviewed on 21 March 2026 and are governed by the laws of England and Wales.",
    tosFooter: "© 2026 YumKeeper. All rights reserved.",
    // Hero paragraphs
    ppHero: "We are committed to protecting your personal data and respecting your privacy rights under the General Data Protection Regulation (GDPR) and applicable data protection laws.",
    tosHero: "Please read these Terms carefully before using YumKeeper. By downloading or using the App, you agree to be bound by these Terms.",
    // Section headings — Privacy Policy
    pp_s1: "1. Data Controller",
    pp_s2: "2. Data We Collect",
    pp_s3: "3. Legal Basis for Processing",
    pp_s4: "4. How We Use Your Data",
    pp_s5: "5. Third-Party Services",
    pp_s6: "6. Data Retention",
    pp_s7: "7. Security",
    pp_s8: "8. International Transfers",
    pp_s9: "9. Your Rights Under GDPR",
    pp_s10: "10. Children's Privacy",
    pp_s11: "11. Changes to This Policy",
    pp_s12: "12. Contact & Complaints",
    // Section headings — Terms of Service
    tos_s1: "1. Acceptance of Terms",
    tos_s2: "2. Description of Service",
    tos_s3: "3. Eligibility",
    tos_s4: "4. User Accounts",
    tos_s5: "5. Subscriptions & Payments",
    tos_s6: "6. Free Trial",
    tos_s7: "7. Acceptable Use",
    tos_s8: "8. User Content",
    tos_s9: "9. Intellectual Property",
    tos_s10: "10. Disclaimers",
    tos_s11: "11. Limitation of Liability",
    tos_s12: "12. Termination",
    tos_s13: "13. Changes to Terms",
    tos_s14: "14. Governing Law & Dispute Resolution",
    tos_s15: "15. Contact",
  },
  fr: {
    cookieTitle: "🍪 Nous respectons votre vie privée",
    cookieBody: "Nous utilisons des cookies essentiels pour faire fonctionner ce site. Nous aimerions également utiliser des cookies d'analyse optionnels pour comprendre comment vous utilisez nos pages légales et les améliorer. Vous pouvez accepter ou refuser les cookies optionnels ci-dessous. Consultez notre <a href=\"/privacy-policy\">Politique de confidentialité</a> pour plus de détails.",
    cookieAccept: "Tout accepter",
    cookieDecline: "Refuser les optionnels",
    ppTitle: "Politique de confidentialité",
    ppLastReviewed: "Dernière révision : 21 mars 2026",
    ppCompliance: "Cette politique de confidentialité est conforme au Règlement général sur la protection des données (RGPD) UE 2016/679.",
    ppFooter: "© 2026 YumKeeper. Tous droits réservés.",
    tosTitle: "Conditions d'utilisation",
    tosLastReviewed: "Dernière révision : 21 mars 2026",
    tosFooter: "© 2026 YumKeeper. Tous droits réservés.",
    pp_s1: "1. Responsable du traitement",
    pp_s2: "2. Données collectées",
    pp_s3: "3. Base juridique du traitement",
    pp_s4: "4. Utilisation de vos données",
    pp_s5: "5. Services tiers",
    pp_s6: "6. Conservation des données",
    pp_s7: "7. Sécurité",
    pp_s8: "8. Transferts internationaux",
    pp_s9: "9. Vos droits au titre du RGPD",
    pp_s10: "10. Protection des mineurs",
    pp_s11: "11. Modifications de cette politique",
    pp_s12: "12. Contact et réclamations",
    tos_s1: "1. Acceptation des conditions",
    tos_s2: "2. Description du service",
    tos_s3: "3. Conditions d'éligibilité",
    tos_s4: "4. Comptes utilisateurs",
    tos_s5: "5. Abonnements et paiements",
    tos_s6: "6. Essai gratuit",
    tos_s7: "7. Utilisation acceptable",
    tos_s8: "8. Contenu utilisateur",
    tos_s9: "9. Propriété intellectuelle",
    tos_s10: "10. Avertissements",
    tos_s11: "11. Limitation de responsabilité",
    tos_s12: "12. Résiliation",
    tos_s13: "13. Modifications des conditions",
    tos_s14: "14. Droit applicable et règlement des litiges",
    tos_s15: "15. Contact",
  },
  de: {
    cookieTitle: "🍪 Wir respektieren Ihre Privatsphäre",
    cookieBody: "Wir verwenden essentielle Cookies, damit diese Website funktioniert. Wir würden auch gerne optionale Analyse-Cookies verwenden, um zu verstehen, wie Sie unsere rechtlichen Seiten nutzen und diese zu verbessern. Sie können optionale Cookies unten akzeptieren oder ablehnen. Weitere Informationen finden Sie in unserer <a href=\"/privacy-policy\">Datenschutzerklärung</a>.",
    cookieAccept: "Alle akzeptieren",
    cookieDecline: "Optionale ablehnen",
    ppTitle: "Datenschutzerklärung",
    ppLastReviewed: "Zuletzt überprüft: 21. März 2026",
    ppCompliance: "Diese Datenschutzerklärung entspricht der EU-Datenschutz-Grundverordnung (DSGVO) 2016/679.",
    ppFooter: "© 2026 YumKeeper. Alle Rechte vorbehalten.",
    tosTitle: "Nutzungsbedingungen",
    tosLastReviewed: "Zuletzt überprüft: 21. März 2026",
    tosFooter: "© 2026 YumKeeper. Alle Rechte vorbehalten.",
    pp_s1: "1. Verantwortlicher",
    pp_s2: "2. Erhobene Daten",
    pp_s3: "3. Rechtsgrundlage der Verarbeitung",
    pp_s4: "4. Verwendung Ihrer Daten",
    pp_s5: "5. Drittanbieterdienste",
    pp_s6: "6. Datenspeicherung",
    pp_s7: "7. Sicherheit",
    pp_s8: "8. Internationale Übermittlungen",
    pp_s9: "9. Ihre Rechte gemäß DSGVO",
    pp_s10: "10. Datenschutz für Kinder",
    pp_s11: "11. Änderungen dieser Richtlinie",
    pp_s12: "12. Kontakt und Beschwerden",
    tos_s1: "1. Annahme der Bedingungen",
    tos_s2: "2. Beschreibung des Dienstes",
    tos_s3: "3. Zulassungsvoraussetzungen",
    tos_s4: "4. Benutzerkonten",
    tos_s5: "5. Abonnements und Zahlungen",
    tos_s6: "6. Kostenlose Testversion",
    tos_s7: "7. Akzeptable Nutzung",
    tos_s8: "8. Nutzerinhalte",
    tos_s9: "9. Geistiges Eigentum",
    tos_s10: "10. Haftungsausschluss",
    tos_s11: "11. Haftungsbeschränkung",
    tos_s12: "12. Kündigung",
    tos_s13: "13. Änderungen der Bedingungen",
    tos_s14: "14. Anwendbares Recht und Streitbeilegung",
    tos_s15: "15. Kontakt",
  },
  es: {
    cookieTitle: "🍪 Respetamos su privacidad",
    cookieBody: "Utilizamos cookies esenciales para que este sitio funcione. También nos gustaría utilizar cookies de análisis opcionales para entender cómo utiliza nuestras páginas legales y mejorarlas. Puede aceptar o rechazar las cookies opcionales a continuación. Consulte nuestra <a href=\"/privacy-policy\">Política de privacidad</a> para más detalles.",
    cookieAccept: "Aceptar todo",
    cookieDecline: "Rechazar opcionales",
    ppTitle: "Política de privacidad",
    ppLastReviewed: "Última revisión: 21 de marzo de 2026",
    ppCompliance: "Esta política de privacidad cumple con el Reglamento General de Protección de Datos (RGPD) de la UE 2016/679.",
    ppFooter: "© 2026 YumKeeper. Todos los derechos reservados.",
    tosTitle: "Términos de servicio",
    tosLastReviewed: "Última revisión: 21 de marzo de 2026",
    tosFooter: "© 2026 YumKeeper. Todos los derechos reservados.",
    pp_s1: "1. Responsable del tratamiento",
    pp_s2: "2. Datos que recopilamos",
    pp_s3: "3. Base jurídica del tratamiento",
    pp_s4: "4. Cómo usamos sus datos",
    pp_s5: "5. Servicios de terceros",
    pp_s6: "6. Conservación de datos",
    pp_s7: "7. Seguridad",
    pp_s8: "8. Transferencias internacionales",
    pp_s9: "9. Sus derechos según el RGPD",
    pp_s10: "10. Privacidad de los menores",
    pp_s11: "11. Cambios en esta política",
    pp_s12: "12. Contacto y reclamaciones",
    tos_s1: "1. Aceptación de los términos",
    tos_s2: "2. Descripción del servicio",
    tos_s3: "3. Elegibilidad",
    tos_s4: "4. Cuentas de usuario",
    tos_s5: "5. Suscripciones y pagos",
    tos_s6: "6. Prueba gratuita",
    tos_s7: "7. Uso aceptable",
    tos_s8: "8. Contenido del usuario",
    tos_s9: "9. Propiedad intelectual",
    tos_s10: "10. Avisos legales",
    tos_s11: "11. Limitación de responsabilidad",
    tos_s12: "12. Rescisión",
    tos_s13: "13. Cambios en los términos",
    tos_s14: "14. Ley aplicable y resolución de conflictos",
    tos_s15: "15. Contacto",
  },
  nl: {
    cookieTitle: "🍪 Wij respecteren uw privacy",
    cookieBody: "Wij gebruiken essentiële cookies om deze site te laten werken. We willen ook optionele analytische cookies gebruiken om te begrijpen hoe u onze juridische pagina's gebruikt en deze te verbeteren. U kunt optionele cookies hieronder accepteren of weigeren. Zie ons <a href=\"/privacy-policy\">Privacybeleid</a> voor meer informatie.",
    cookieAccept: "Alles accepteren",
    cookieDecline: "Optionele weigeren",
    ppTitle: "Privacybeleid",
    ppLastReviewed: "Laatst herzien: 21 maart 2026",
    ppCompliance: "Dit privacybeleid voldoet aan de EU Algemene Verordening Gegevensbescherming (AVG) 2016/679.",
    ppFooter: "© 2026 YumKeeper. Alle rechten voorbehouden.",
    tosTitle: "Gebruiksvoorwaarden",
    tosLastReviewed: "Laatst herzien: 21 maart 2026",
    tosFooter: "© 2026 YumKeeper. Alle rechten voorbehouden.",
    pp_s1: "1. Verwerkingsverantwoordelijke",
    pp_s2: "2. Gegevens die wij verzamelen",
    pp_s3: "3. Rechtsgrondslag voor verwerking",
    pp_s4: "4. Hoe wij uw gegevens gebruiken",
    pp_s5: "5. Diensten van derden",
    pp_s6: "6. Bewaartermijnen",
    pp_s7: "7. Beveiliging",
    pp_s8: "8. Internationale overdrachten",
    pp_s9: "9. Uw rechten onder de AVG",
    pp_s10: "10. Privacy van kinderen",
    pp_s11: "11. Wijzigingen in dit beleid",
    pp_s12: "12. Contact en klachten",
    tos_s1: "1. Aanvaarding van de voorwaarden",
    tos_s2: "2. Beschrijving van de dienst",
    tos_s3: "3. Geschiktheid",
    tos_s4: "4. Gebruikersaccounts",
    tos_s5: "5. Abonnementen en betalingen",
    tos_s6: "6. Gratis proefperiode",
    tos_s7: "7. Acceptabel gebruik",
    tos_s8: "8. Gebruikersinhoud",
    tos_s9: "9. Intellectueel eigendom",
    tos_s10: "10. Disclaimers",
    tos_s11: "11. Beperking van aansprakelijkheid",
    tos_s12: "12. Beëindiging",
    tos_s13: "13. Wijzigingen in de voorwaarden",
    tos_s14: "14. Toepasselijk recht en geschillenbeslechting",
    tos_s15: "15. Contact",
  },
};

const LANG_NAMES = { en: "English", fr: "Français", de: "Deutsch", es: "Español", nl: "Nederlands" };

// ─── 1. GDPR Cookie Consent Banner ────────────────────────────────────────────

(function initCookieBanner() {
  const CONSENT_KEY = "yumkeeper_cookie_consent";
  const stored = localStorage.getItem(CONSENT_KEY);
  if (stored) return; // Already decided — don't show again

  const banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie consent");
  document.body.appendChild(banner);

  function renderBanner(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
    banner.innerHTML = `
      <div class="cb-inner">
        <div class="cb-text">
          <strong>${t.cookieTitle}</strong>
          <p>${t.cookieBody}</p>
        </div>
        <div class="cb-actions">
          <button id="cb-decline" class="cb-btn cb-btn-secondary">${t.cookieDecline}</button>
          <button id="cb-accept" class="cb-btn cb-btn-primary">${t.cookieAccept}</button>
        </div>
      </div>
    `;
    document.getElementById("cb-accept").addEventListener("click", () => dismiss(true));
    document.getElementById("cb-decline").addEventListener("click", () => dismiss(false));
  }

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

  // Initial render — will be re-rendered when language changes
  const savedLang = localStorage.getItem("yumkeeper_legal_lang") || "en";
  renderBanner(savedLang);

  // Listen for language change events from the switcher
  window.addEventListener("yumkeeper_lang_change", (e) => {
    if (!document.getElementById("cookie-banner")) return;
    renderBanner(e.detail.lang);
  });
})();


// ─── 2. Language Switcher ─────────────────────────────────────────────────────

(function initLanguageSwitcher() {
  const LANG_KEY = "yumkeeper_legal_lang";

  // Detect saved preference or browser language
  const saved = localStorage.getItem(LANG_KEY);
  const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
  const defaultLang = saved || (LANG_NAMES[browserLang] ? browserLang : "en");

  // Build switcher widget
  const switcher = document.createElement("div");
  switcher.id = "lang-switcher";
  switcher.setAttribute("aria-label", "Language switcher");
  switcher.innerHTML = Object.entries(LANG_NAMES)
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

  // Apply translations to the page
  function applyLang(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // Translate all elements with data-i18n attribute
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (t[key] !== undefined) {
        // Use innerHTML for elements that may contain HTML (links etc.)
        if (el.tagName === "P" || el.tagName === "SPAN") {
          el.innerHTML = t[key];
        } else {
          el.textContent = t[key];
        }
      }
    });

    // Also support legacy data-lang-XX attributes on headings
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

    // Notify cookie banner to re-render in the new language
    window.dispatchEvent(new CustomEvent("yumkeeper_lang_change", { detail: { lang } }));
  }

  // Wire up buttons
  switcher.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang-btn");
    if (btn) applyLang(btn.dataset.lang);
  });

  // Apply on load
  applyLang(defaultLang);
})();
