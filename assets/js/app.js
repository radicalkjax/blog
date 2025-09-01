/**
 * Modern ES6+ Application Entry Point
 * radicalkjax.com
 */

import ThemeManager from './modules/theme.js';
import Navigation from './modules/navigation.js';
import LazyLoader from './modules/lazy-loader.js';
import PWAManager from './modules/pwa.js';

// Import Web Components
import { initializeComponents } from './components/index.js';

class App {
  constructor() {
    this.modules = {};
    this.init();
  }

  async init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.bootstrap());
    } else {
      this.bootstrap();
    }
  }

  async bootstrap() {
    try {
      // Initialize Web Components first
      await initializeComponents();
      
      // Initialize core modules
      this.modules.theme = new ThemeManager();
      this.modules.navigation = new Navigation();
      this.modules.lazyLoader = new LazyLoader();
      
      // Initialize PWA features
      if ('serviceWorker' in navigator) {
        this.modules.pwa = new PWAManager();
      }
      
      // Initialize page-specific features
      this.initializePageFeatures();
      
      // Set up global event listeners
      this.setupEventListeners();
      
      // Mark app as initialized
      document.body.classList.add('app-initialized');
      
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  initializePageFeatures() {
    // Initialize contact form if present
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
      this.initContactForm(contactForm);
    }
    
    // Initialize gallery if present
    const galleries = document.querySelectorAll('.gallery-grid');
    if (galleries.length) {
      this.initGalleries(galleries);
    }
    
    // Initialize social icons animation
    this.animateSocialIcons();
  }

  initContactForm(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      // Validate
      if (!this.validateFormData(data)) {
        this.showNotification('Please fill in all required fields', 'error');
        return;
      }
      
      // Show loading state
      const submitButton = form.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.textContent = 'Sending...';
      submitButton.disabled = true;
      
      try {
        // In production, this would send to a real endpoint
        await this.simulateFormSubmission(data);
        
        this.showNotification('Message sent successfully!', 'success');
        form.reset();
      } catch (error) {
        this.showNotification('Failed to send message. Please try again.', 'error');
      } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
      }
    });
  }

  validateFormData(data) {
    const required = ['name', 'email', 'message'];
    return required.every(field => data[field]?.trim());
  }

  simulateFormSubmission(data) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  initGalleries(galleries) {
    galleries.forEach(gallery => {
      const images = gallery.querySelectorAll('img');
      
      images.forEach(img => {
        img.addEventListener('click', () => {
          this.openLightbox(img.src, img.alt);
        });
      });
    });
  }

  openLightbox(src, alt) {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" aria-label="Close">×</button>
        <img src="${src}" alt="${alt}">
      </div>
    `;
    
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';
    
    // Animate in
    requestAnimationFrame(() => {
      lightbox.classList.add('active');
    });
    
    // Close handlers
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      setTimeout(() => {
        lightbox.remove();
        document.body.style.overflow = '';
      }, 300);
    };
    
    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    
    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  animateSocialIcons() {
    const icons = document.querySelectorAll('.social-icons a');
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animated');
            }, index * 100);
            observer.unobserve(entry.target);
          }
        });
      });
      
      icons.forEach(icon => observer.observe(icon));
    } else {
      // Fallback for older browsers
      icons.forEach((icon, index) => {
        setTimeout(() => {
          icon.classList.add('animated');
        }, index * 100);
      });
    }
  }

  setupEventListeners() {
    // Handle back to top button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(backToTop);
    
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (window.pageYOffset > 300) {
          backToTop.classList.add('visible');
        } else {
          backToTop.classList.remove('visible');
        }
      }, 100);
    });
    
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
    
    // Handle print styles
    window.addEventListener('beforeprint', () => {
      document.body.classList.add('printing');
    });
    
    window.addEventListener('afterprint', () => {
      document.body.classList.remove('printing');
    });
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('visible');
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
}

// Initialize app
const app = new App();

// Export for use in other scripts if needed
export default app;