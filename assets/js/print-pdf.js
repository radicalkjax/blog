/**
 * Print to PDF functionality
 * Creates a button below Key Terms that allows printing the document with custom styling.
 *
 * Entry module: imports the print submodules and wires up the same initialization as before.
 */

import { createPrintStyles } from './print/print-styles.js';
import { createPrintContainer } from './print/print-button.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize print functionality
  createPrintStyles();

  // Wait for other components to load
  setTimeout(() => {
    createPrintContainer();
  }, 1000);
});
