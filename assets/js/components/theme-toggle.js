/**
 * ThemeToggle Web Component
 * A modern, accessible theme switcher using Web Components API
 * Demonstrates professional JavaScript architecture
 */

class ThemeToggle extends HTMLElement {
  static get observedAttributes() {
    return ['theme', 'storage-key', 'auto-detect'];
  }

  constructor() {
    super();

    // Create Shadow DOM for encapsulation
    this.attachShadow({ mode: 'open' });

    // Component state
    this.state = {
      theme: 'auto',
      systemPreference: null,
      storageKey: 'theme-preference',
    };

    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.handleSystemChange = this.handleSystemChange.bind(this);
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
    this.initializeTheme();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    switch (name) {
      case 'theme':
        this.state.theme = newValue;
        this.updateTheme();
        break;
      case 'storage-key':
        this.state.storageKey = newValue;
        break;
      case 'auto-detect':
        if (newValue === 'true') {
          this.detectSystemPreference();
        }
        break;
      default:
        break;
    }
  }

  render() {
    const styles = `
      <style>
        :host {
          --toggle-size: 60px;
          --toggle-padding: 4px;
          --toggle-transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          
          display: inline-block;
          position: relative;
        }

        .theme-toggle {
          position: relative;
          width: var(--toggle-size);
          height: calc(var(--toggle-size) / 2);
          padding: var(--toggle-padding);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: calc(var(--toggle-size) / 2);
          cursor: pointer;
          overflow: hidden;
          transition: var(--toggle-transition);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .theme-toggle:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        .theme-toggle:focus-visible {
          outline: 3px solid var(--color-accent, #4493f8);
          outline-offset: 3px;
        }

        .toggle-thumb {
          position: absolute;
          top: var(--toggle-padding);
          left: var(--toggle-padding);
          width: calc(var(--toggle-size) / 2 - var(--toggle-padding) * 2);
          height: calc(var(--toggle-size) / 2 - var(--toggle-padding) * 2);
          background: white;
          border-radius: 50%;
          transition: var(--toggle-transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .toggle-thumb::before {
          content: '🌙';
          font-size: calc(var(--toggle-size) / 4);
        }

        :host([theme="dark"]) .toggle-thumb {
          transform: translateX(calc(var(--toggle-size) / 2));
        }

        :host([theme="dark"]) .toggle-thumb::before {
          content: '☀️';
        }

        :host([theme="auto"]) .theme-toggle {
          background: linear-gradient(135deg, #667eea 0%, #f093fb 50%, #f5576c 100%);
        }

        :host([theme="auto"]) .toggle-thumb {
          transform: translateX(calc(var(--toggle-size) / 4));
        }

        :host([theme="auto"]) .toggle-thumb::before {
          content: 'A';
          font-weight: bold;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .theme-toggle,
          .toggle-thumb {
            transition: none;
          }
        }
      </style>
    `;

    const template = `
      ${styles}
      <button 
        class="theme-toggle" 
        role="switch" 
        aria-checked="${this.state.theme === 'dark'}"
        aria-label="Toggle theme"
        part="button"
      >
        <span class="toggle-thumb" part="thumb"></span>
        <span class="sr-only">Current theme: ${this.state.theme}</span>
      </button>
    `;

    this.shadowRoot.innerHTML = template;
  }

  setupEventListeners() {
    const button = this.shadowRoot.querySelector('.theme-toggle');
    button?.addEventListener('click', this.handleClick);

    // Listen for system theme changes
    if (window.matchMedia) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.mediaQuery.addEventListener('change', this.handleSystemChange);
    }
  }

  cleanup() {
    const button = this.shadowRoot.querySelector('.theme-toggle');
    button?.removeEventListener('click', this.handleClick);

    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleSystemChange);
    }
  }

  initializeTheme() {
    // Check localStorage first
    const stored = localStorage.getItem(this.state.storageKey);
    if (stored) {
      this.state.theme = stored;
    } else if (this.getAttribute('auto-detect') === 'true') {
      this.detectSystemPreference();
    }

    this.updateTheme();
  }

  detectSystemPreference() {
    if (window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.state.systemPreference = isDark ? 'dark' : 'light';

      if (this.state.theme === 'auto') {
        this.applyTheme(this.state.systemPreference);
      }
    }
  }

  handleClick() {
    // Cycle through themes: light -> dark -> auto -> light
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.state.theme);
    const nextIndex = (currentIndex + 1) % themes.length;

    this.state.theme = themes[nextIndex];
    this.updateTheme();

    // Save preference
    localStorage.setItem(this.state.storageKey, this.state.theme);

    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('theme-change', {
      detail: { theme: this.state.theme },
      bubbles: true,
      composed: true,
    }));
  }

  handleSystemChange(e) {
    this.state.systemPreference = e.matches ? 'dark' : 'light';

    if (this.state.theme === 'auto') {
      this.applyTheme(this.state.systemPreference);
    }
  }

  updateTheme() {
    this.setAttribute('theme', this.state.theme);

    const effectiveTheme = this.state.theme === 'auto'
      ? this.state.systemPreference || 'light'
      : this.state.theme;

    this.applyTheme(effectiveTheme);
    this.render();
  }

  applyTheme(theme) {
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', theme);

    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'dark' ? '#1a1a1a' : '#6d105a';
    }
  }
}

// Define the custom element
customElements.define('theme-toggle', ThemeToggle);

// Export for module usage
export default ThemeToggle;
