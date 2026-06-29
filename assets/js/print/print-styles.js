/**
 * Print styles for the Print to PDF feature.
 * Composes the full print stylesheet from its two CSS parts and injects it into the document head.
 */

import { PRINT_CSS_PART1 } from './print-css-part1.js';
import { PRINT_CSS_PART2 } from './print-css-part2.js';

export const PRINT_CSS = PRINT_CSS_PART1 + PRINT_CSS_PART2;

/**
 * Inject the print styles into the document head.
 */
export function createPrintStyles() {
  const printStyle = document.createElement('style');
  printStyle.id = 'print-styles';
  printStyle.textContent = PRINT_CSS;
  document.head.appendChild(printStyle);
}
