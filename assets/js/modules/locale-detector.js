/**
 * Automatic Locale Detection Module
 * Detects user's browser language and suggests/redirects to appropriate language version
 */

(function () {
  // Get available languages from the site (defined in Jekyll)
  const availableLanguages = ['en', 'es', 'fr', 'ja', 'zh', 'ar', 'de', 'pt'];
  const defaultLanguage = 'en';

  /**
     * Get user's preferred languages from browser
     */
  function getBrowserLanguages() {
    const languages = [];

    // Primary language
    if (navigator.language) {
      languages.push(navigator.language.toLowerCase());
    }

    // Additional languages
    if (navigator.languages && navigator.languages.length > 0) {
      navigator.languages.forEach((lang) => {
        const normalized = lang.toLowerCase();
        if (!languages.includes(normalized)) {
          languages.push(normalized);
        }
      });
    }

    return languages;
  }

  /**
     * Extract language code from locale (e.g., 'en-US' -> 'en')
     */
  function getLanguageCode(locale) {
    return locale.split('-')[0];
  }

  /**
     * Find best matching language from available options
     */
  function findBestMatch(browserLanguages, availableLangs) {
    // First try exact matches
    for (const browserLang of browserLanguages) {
      const langCode = getLanguageCode(browserLang);
      if (availableLangs.includes(langCode)) {
        return langCode;
      }
    }

    // Check for regional variations (e.g., 'en-US' matches 'en')
    for (const browserLang of browserLanguages) {
      for (const availableLang of availableLangs) {
        if (browserLang.startsWith(`${availableLang}-`)) {
          return availableLang;
        }
      }
    }

    return null;
  }

  /**
     * Get current page language from URL
     */
  function getCurrentLanguage() {
    const path = window.location.pathname;
    const pathParts = path.split('/').filter((part) => part);

    if (pathParts.length > 0 && availableLanguages.includes(pathParts[0])) {
      return pathParts[0];
    }

    return defaultLanguage;
  }

  /**
     * Check if locale detection should run
     */
  function shouldDetectLocale() {
    // Don't run if user has explicitly selected a language
    const hasLanguagePreference = localStorage.getItem('preferred_language');
    if (hasLanguagePreference) {
      return false;
    }

    // Don't run if we've already asked the user
    const hasBeenAsked = sessionStorage.getItem('locale_detection_asked');
    if (hasBeenAsked) {
      return false;
    }

    return true;
  }

  /**
     * Show language suggestion banner
     */
  function showLanguageSuggestion(suggestedLang, currentLang) {
    // Don't suggest if already on the right language
    if (suggestedLang === currentLang) {
      return;
    }

    // Get language names
    const languageNames = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      ja: '日本語',
      zh: '中文',
      ar: 'العربية',
      de: 'Deutsch',
      pt: 'Português',
    };

    // Create banner element
    const banner = document.createElement('div');
    banner.className = 'locale-suggestion-banner';
    banner.innerHTML = `
            <div class="locale-suggestion-content">
                <span class="locale-suggestion-text">
                    Would you prefer to view this site in ${languageNames[suggestedLang]}?
                </span>
                <div class="locale-suggestion-actions">
                    <button class="locale-suggestion-accept" data-lang="${suggestedLang}">
                        Switch to ${languageNames[suggestedLang]}
                    </button>
                    <button class="locale-suggestion-dismiss">
                        Keep ${languageNames[currentLang]}
                    </button>
                </div>
            </div>
        `;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
            .locale-suggestion-banner {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: rgba(109, 16, 90, 0.95);
                border-bottom: 2px solid #ffffff;
                padding: 12px;
                z-index: 10001;
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    transform: translateY(-100%);
                }
                to {
                    transform: translateY(0);
                }
            }
            
            .locale-suggestion-content {
                max-width: 1000px;
                margin: 0 auto;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 16px;
            }
            
            .locale-suggestion-text {
                color: #ffffff;
                font-family: 'DM Mono', monospace;
                font-size: 14px;
            }
            
            .locale-suggestion-actions {
                display: flex;
                gap: 12px;
            }
            
            .locale-suggestion-accept,
            .locale-suggestion-dismiss {
                padding: 6px 12px;
                font-family: 'DM Mono', monospace;
                font-size: 12px;
                border: 1px solid #ffffff;
                background: transparent;
                color: #ffffff;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .locale-suggestion-accept:hover,
            .locale-suggestion-dismiss:hover {
                background: rgba(255, 255, 255, 0.1);
                transform: translateY(-1px);
            }
            
            @media (max-width: 600px) {
                .locale-suggestion-content {
                    flex-direction: column;
                    text-align: center;
                }
            }
        `;

    document.head.appendChild(style);
    document.body.insertBefore(banner, document.body.firstChild);

    // Add body padding to prevent content jump
    document.body.style.paddingTop = `${banner.offsetHeight}px`;

    // Handle accept button
    banner.querySelector('.locale-suggestion-accept').addEventListener('click', function () {
      const { lang } = this.dataset;
      localStorage.setItem('preferred_language', lang);

      // Construct new URL
      let newPath;
      if (lang === defaultLanguage) {
        // Remove language prefix for default language
        newPath = window.location.pathname.replace(/^\/[a-z]{2}\//, '/');
      } else {
        // Add or replace language prefix
        if (currentLang === defaultLanguage) {
          newPath = `/${lang}${window.location.pathname}`;
        } else {
          newPath = window.location.pathname.replace(/^\/[a-z]{2}\//, `/${lang}/`);
        }
      }

      window.location.href = newPath + window.location.search + window.location.hash;
    });

    // Handle dismiss button
    banner.querySelector('.locale-suggestion-dismiss').addEventListener('click', () => {
      sessionStorage.setItem('locale_detection_asked', 'true');
      banner.remove();
      document.body.style.paddingTop = '';
    });
  }

  /**
     * Initialize locale detection
     */
  function init() {
    // Only run on main pages, not in development tools
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return;
    }

    if (!shouldDetectLocale()) {
      return;
    }

    const browserLanguages = getBrowserLanguages();
    const currentLanguage = getCurrentLanguage();
    const suggestedLanguage = findBestMatch(browserLanguages, availableLanguages);

    if (suggestedLanguage && suggestedLanguage !== currentLanguage) {
      // Small delay to ensure page is loaded
      setTimeout(() => {
        showLanguageSuggestion(suggestedLanguage, currentLanguage);
      }, 1000);
    }
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
