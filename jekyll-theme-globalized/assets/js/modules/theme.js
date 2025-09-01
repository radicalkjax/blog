/**
 * Theme Module - Handles dark mode toggle and theme preferences
 * ES6+ Module
 */

class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || 'light';
    this.toggleButton = null;
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.createToggleButton();
    this.bindEvents();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('theme') || 
             (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    } catch (e) {
      return 'light';
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.theme = theme;
    
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
    }
  }

  createToggleButton() {
    this.toggleButton = document.createElement('button');
    this.toggleButton.className = 'theme-toggle';
    this.toggleButton.setAttribute('aria-label', 'Toggle dark mode');
    this.toggleButton.innerHTML = this.getIconForTheme(this.theme);
    
    document.body.appendChild(this.toggleButton);
  }

  getIconForTheme(theme) {
    const icons = {
      light: '<i class="fas fa-moon"></i>',
      dark: '<i class="fas fa-sun"></i>'
    };
    return icons[theme] || icons.light;
  }

  bindEvents() {
    this.toggleButton?.addEventListener('click', () => this.toggleTheme());
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.applyTheme(e.matches ? 'dark' : 'light');
        this.updateToggleButton();
      }
    });
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(newTheme);
    this.updateToggleButton();
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: newTheme } }));
  }

  updateToggleButton() {
    if (this.toggleButton) {
      this.toggleButton.innerHTML = this.getIconForTheme(this.theme);
    }
  }
}

export default ThemeManager;