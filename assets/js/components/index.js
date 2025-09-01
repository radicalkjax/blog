/**
 * Web Components Registry
 * Central module for loading and managing custom elements
 * Demonstrates modern JavaScript module architecture
 */

// Import all components
import ThemeToggle from './theme-toggle.js';
import CodeViewer from './code-viewer.js';

// Component registry
const components = {
  'theme-toggle': ThemeToggle,
  'code-viewer': CodeViewer,
};

/**
 * Initialize all web components
 * @returns {Promise<void>}
 */
export async function initializeComponents() {
  // Check for Web Components support
  if (!('customElements' in window)) {
    console.warn('Web Components are not supported in this browser');
    return;
  }

  // Wait for all components to be defined
  const promises = Object.keys(components).map((name) => customElements.whenDefined(name));

  try {
    await Promise.all(promises);
  } catch (error) {
    console.error('Failed to initialize components:', error);
  }
}

/**
 * Lazy load a component
 * @param {string} componentName - Name of the component to load
 * @returns {Promise<void>}
 */
export async function loadComponent(componentName) {
  if (customElements.get(componentName)) {
    return; // Already loaded
  }

  try {
    const module = await import(`./${componentName}.js`);
    return module.default;
  } catch (error) {
    console.error(`Failed to load component ${componentName}:`, error);
  }
}

/**
 * Check if a component is registered
 * @param {string} componentName - Name of the component
 * @returns {boolean}
 */
export function isComponentRegistered(componentName) {
  return customElements.get(componentName) !== undefined;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComponents);
} else {
  initializeComponents();
}

// Export components for direct usage
export { ThemeToggle, CodeViewer };

// Default export
export default {
  initializeComponents,
  loadComponent,
  isComponentRegistered,
  components,
};
