const I18N_CONFIG = {
    defaultLanguage: "en",
    storageKey: "vitalia-language",
    translationsPath: "i18n/translations.json"
};

let translations = {};
let currentLanguage = I18N_CONFIG.defaultLanguage;

document.addEventListener("DOMContentLoaded", initLanguageSelector);

async function initLanguageSelector() {
    translations = await loadTranslations();

    if (!hasTranslations()) {
        disableLanguageSelector();
        return;
    }

    const savedLanguage = getSavedLanguage();
    applyLanguage(savedLanguage);
    bindLanguageSelector();
}

async function loadTranslations() {
    try {
        const response = await fetch(I18N_CONFIG.translationsPath);

        if (!response.ok) {
            throw new Error(`Could not load translations: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return {};
    }
}

function bindLanguageSelector() {
    const selector = document.getElementById("language-selector");

    if (!selector) {
        return;
    }

    selector.addEventListener("click", () => {
        const nextLanguage = currentLanguage === "en" ? "es" : "en";
        applyLanguage(nextLanguage);
    });
}

function applyLanguage(language) {
    const languageToApply = translations[language] ? language : I18N_CONFIG.defaultLanguage;

    currentLanguage = languageToApply;
    document.documentElement.lang = languageToApply;
    document.title = translate("meta.title");

    translateTextContent();
    translatePlaceholders();
    translateAltText();
    translateAriaLabels();
    updateLanguageSelector();
    saveLanguage(languageToApply);
}

function translateTextContent() {
    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const value = translate(element.dataset.i18n);

        if (value) {
            element.textContent = value;
        }
    });
}

function translatePlaceholders() {
    document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
        const value = translate(element.dataset.i18nPlaceholder);

        if (value) {
            element.setAttribute("placeholder", value);
        }
    });
}

function translateAltText() {
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
        const value = translate(element.dataset.i18nAlt);

        if (value) {
            element.setAttribute("alt", value);
        }
    });
}

function translateAriaLabels() {
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
        const value = translate(element.dataset.i18nAriaLabel);

        if (value) {
            element.setAttribute("aria-label", value);
        }
    });
}

function updateLanguageSelector() {
    const label = document.querySelector("[data-language-current]");

    if (label) {
        label.textContent = currentLanguage.toUpperCase();
    }
}

function translate(key) {
    return getNestedValue(translations[currentLanguage], key)
        || getNestedValue(translations[I18N_CONFIG.defaultLanguage], key)
        || "";
}

function getNestedValue(source, key) {
    if (!source || !key) {
        return "";
    }

    return key.split(".").reduce((value, path) => {
        if (value && Object.prototype.hasOwnProperty.call(value, path)) {
            return value[path];
        }

        return "";
    }, source);
}

function getSavedLanguage() {
    try {
        const savedLanguage = localStorage.getItem(I18N_CONFIG.storageKey);
        return translations[savedLanguage] ? savedLanguage : I18N_CONFIG.defaultLanguage;
    } catch (error) {
        return I18N_CONFIG.defaultLanguage;
    }
}

function saveLanguage(language) {
    try {
        localStorage.setItem(I18N_CONFIG.storageKey, language);
    } catch (error) {
        console.warn("Language preference could not be saved.", error);
    }
}

function hasTranslations() {
    return Boolean(translations.en && translations.es);
}

function disableLanguageSelector() {
    const selector = document.getElementById("language-selector");

    if (!selector) {
        return;
    }

    selector.disabled = true;
    selector.setAttribute("aria-label", "Translations could not be loaded");
}
