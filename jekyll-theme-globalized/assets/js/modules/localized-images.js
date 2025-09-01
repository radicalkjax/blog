/**
 * Localized Images Module
 * Handles dynamic loading of language-specific images
 */

(function() {
    'use strict';
    
    /**
     * Check if an image URL exists
     */
    function imageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    /**
     * Get localized image URL
     */
    function getLocalizedImageUrl(originalSrc, lang) {
        // Split the URL into parts
        const parts = originalSrc.split('.');
        if (parts.length < 2) return originalSrc;
        
        // Get extension
        const extension = parts.pop();
        
        // Check if already localized (contains language code)
        const lastPart = parts[parts.length - 1];
        const langCodes = ['en', 'es', 'fr', 'ja', 'zh', 'ar', 'de', 'pt'];
        if (langCodes.includes(lastPart)) {
            // Remove existing language code
            parts.pop();
        }
        
        // Add new language code
        parts.push(lang);
        parts.push(extension);
        
        return parts.join('.');
    }
    
    /**
     * Process all images with localization support
     */
    async function processLocalizedImages() {
        // Get current language from document
        const currentLang = document.documentElement.lang || 'en';
        
        // Find all images that could be localized
        const images = document.querySelectorAll('img[data-localizable], .localized-image');
        
        for (const img of images) {
            const originalSrc = img.dataset.originalSrc || img.src;
            
            // Store original src if not already stored
            if (!img.dataset.originalSrc) {
                img.dataset.originalSrc = originalSrc;
            }
            
            // Try to load localized version
            const localizedSrc = getLocalizedImageUrl(originalSrc, currentLang);
            
            if (localizedSrc !== originalSrc) {
                const exists = await imageExists(localizedSrc);
                if (exists) {
                    img.src = localizedSrc;
                    img.dataset.localized = 'true';
                }
            }
        }
    }
    
    /**
     * Add localization support to dynamically added images
     */
    function observeNewImages() {
        if (!window.MutationObserver) return;
        
        const observer = new MutationObserver((mutations) => {
            let hasNewImages = false;
            
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeName === 'IMG' && 
                        (node.dataset.localizable || node.classList.contains('localized-image'))) {
                        hasNewImages = true;
                    }
                    // Check for images in added subtrees
                    if (node.querySelectorAll) {
                        const images = node.querySelectorAll('img[data-localizable], .localized-image');
                        if (images.length > 0) {
                            hasNewImages = true;
                        }
                    }
                });
            });
            
            if (hasNewImages) {
                processLocalizedImages();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * Create helper function for marking images as localizable
     */
    window.markImageAsLocalizable = function(selector) {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
            img.dataset.localizable = 'true';
        });
        processLocalizedImages();
    };
    
    /**
     * Initialize the module
     */
    function init() {
        // Process existing images
        processLocalizedImages();
        
        // Watch for new images
        observeNewImages();
        
        // Re-process on language change
        document.addEventListener('languagechange', processLocalizedImages);
        
        // Also listen for custom language change events
        window.addEventListener('locale-changed', processLocalizedImages);
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();