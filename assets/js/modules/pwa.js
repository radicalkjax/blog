/**
 * PWA Manager Module - Handles Progressive Web App functionality
 * ES6+ Module
 */

export class PWAManager {
  constructor() {
    this.registration = null;
    this.deferredPrompt = null;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator) {
      await this.registerServiceWorker();
      this.setupInstallPrompt();
      this.setupUpdateListener();
      this.setupOfflineDetection();
    }
  }

  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      
      // Check for updates
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdate();
      });
      
      // Check registration status
      if (this.registration.waiting) {
        this.promptUpdate();
      }
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  handleUpdate() {
    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.promptUpdate();
      }
    });
  }

  promptUpdate() {
    if (confirm('A new version is available! Would you like to update?')) {
      this.skipWaiting();
    }
  }

  skipWaiting() {
    if (this.registration.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Reload when the new service worker takes control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  setupInstallPrompt() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the default prompt
      e.preventDefault();
      
      // Store the event for later use
      this.deferredPrompt = e;
      
      // Show custom install button
      this.showInstallButton();
    });
    
    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.hideInstallButton();
      this.deferredPrompt = null;
    });
  }

  showInstallButton() {
    // Check if button already exists
    if (document.querySelector('.pwa-install-button')) return;
    
    const button = document.createElement('button');
    button.className = 'pwa-install-button';
    button.innerHTML = '<i class="fas fa-download"></i> Install App';
    button.setAttribute('aria-label', 'Install application');
    
    button.addEventListener('click', () => this.promptInstall());
    
    document.body.appendChild(button);
    
    // Animate in
    requestAnimationFrame(() => {
      button.classList.add('visible');
    });
  }

  hideInstallButton() {
    const button = document.querySelector('.pwa-install-button');
    if (button) {
      button.classList.remove('visible');
      setTimeout(() => button.remove(), 300);
    }
  }

  async promptInstall() {
    if (!this.deferredPrompt) {
      return;
    }
    
    // Show the install prompt
    this.deferredPrompt.prompt();
    
    // Wait for the user's response
    const { outcome } = await this.deferredPrompt.userChoice;
    
    
    if (outcome === 'accepted') {
      this.hideInstallButton();
    }
    
    // Clear the deferred prompt
    this.deferredPrompt = null;
  }

  setupUpdateListener() {
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'CACHE_CLEARED') {
        this.showNotification('Cache cleared', 'success');
      }
    });
  }

  setupOfflineDetection() {
    // Check initial online status
    this.updateOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.updateOnlineStatus());
    window.addEventListener('offline', () => this.updateOnlineStatus());
  }

  updateOnlineStatus() {
    const isOnline = navigator.onLine;
    
    document.body.classList.toggle('offline', !isOnline);
    
    if (!isOnline) {
      this.showOfflineNotification();
    } else {
      this.hideOfflineNotification();
    }
  }

  showOfflineNotification() {
    // Check if notification already exists
    if (document.querySelector('.offline-notification')) return;
    
    const notification = document.createElement('div');
    notification.className = 'offline-notification';
    notification.innerHTML = `
      <i class="fas fa-wifi-slash"></i>
      <span>You are currently offline. Some features may be limited.</span>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('visible');
    });
  }

  hideOfflineNotification() {
    const notification = document.querySelector('.offline-notification');
    if (notification) {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `pwa-notification pwa-notification--${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
      notification.classList.add('visible');
    });
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('visible');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Public method to clear all caches
  clearCache() {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    }
  }

  // Public method to check if app is installed
  isInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return true;
    }
    
    // Check if running in iOS standalone mode
    if (window.navigator.standalone === true) {
      return true;
    }
    
    return false;
  }
}

export default PWAManager;