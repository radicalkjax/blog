/**
 * Custom JavaScript for Mermaid diagrams
 * Ensures diagrams fit properly within post containers
 *
 * Entry ES module: wires together the theme, styling, processing, and modal
 * submodules and reproduces the original DOMContentLoaded initialization.
 */

import { setupMermaidConfig } from './mermaid/theme.js';
import { styleMermaidDiagrams } from './mermaid/style.js';
import { processMermaidInitBlocks, setupMermaidObserver } from './mermaid/process.js';
import { createMermaidModal, setupMermaidClickHandlers } from './mermaid/modal.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Setup mermaid configuration
  setupMermaidConfig();

  // Process any mermaid code blocks with init parameters
  processMermaidInitBlocks();

  // Apply initial styling
  styleMermaidDiagrams();

  // Wait for mermaid to initialize and render diagrams
  setTimeout(() => {
    // Only process diagrams that haven't been processed yet
    const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
    if (unprocessedDiagrams.length > 0) {
      styleMermaidDiagrams();
    }
  }, 1000);

  // Apply styling again after a longer delay to catch late-rendered diagrams
  setTimeout(() => {
    // Only process diagrams that haven't been processed yet
    const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
    if (unprocessedDiagrams.length > 0) {
      styleMermaidDiagrams();
    }
  }, 2500);

  // Handle window resize events - but don't reprocess diagrams
  window.addEventListener('resize', () => {
    // Just ensure SVGs are responsive without reprocessing
    document.querySelectorAll('.mermaid svg').forEach((svg) => {
      svg.style.width = 'auto';
      svg.style.height = 'auto';
      svg.style.maxWidth = '100%';
    });
  });

  // Fix for diagrams in the post we're working on
  const specificPost = document.querySelector('.post-content');
  if (specificPost) {
    specificPost.style.overflowX = 'visible';
  }

  // Ensure all post containers can handle mermaid diagrams
  document.querySelectorAll('.post-content, .post-container').forEach((container) => {
    container.style.overflowX = 'visible';
  });

  // Check for mermaid diagrams periodically in case they're loaded dynamically
  const checkInterval = setInterval(() => {
    // Only process diagrams that haven't been processed yet
    const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
    if (unprocessedDiagrams.length > 0) {
      styleMermaidDiagrams();
    } else {
      // If all diagrams are processed, stop checking
      clearInterval(checkInterval);
    }
  }, 1000);

  // Stop checking after 5 seconds to avoid infinite checking
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 5000);
});

// Run setup when the page loads
document.addEventListener('DOMContentLoaded', () => {
  processMermaidInitBlocks();
  setupMermaidObserver();
  createMermaidModal();
  setupMermaidClickHandlers();
});
