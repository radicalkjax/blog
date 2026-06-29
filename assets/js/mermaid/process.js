/**
 * Mermaid code-block processing and dynamic observation.
 * Transforms code blocks into mermaid divs, rewrites inline init params,
 * and watches the DOM for dynamically added diagrams.
 */

import { THEME_VARIABLES, PIE_CONFIG } from './theme.js';
import { styleMermaidDiagrams } from './style.js';

// Function to process mermaid code blocks with init parameters and transform them into mermaid divs
export function processMermaidInitBlocks() {
  // Find all code blocks with language 'mermaid'
  document.querySelectorAll('pre code.language-mermaid').forEach((element) => {
    // Create a div for mermaid
    const mermaidDiv = document.createElement('div');
    mermaidDiv.className = 'mermaid';
    mermaidDiv.innerHTML = element.textContent;

    // Replace the code block with the mermaid div
    const pre = element.parentNode;
    pre.parentNode.replaceChild(mermaidDiv, pre);
  });

  // Also handle code blocks inside divs (for our IEEE formatted posts)
  document.querySelectorAll('div pre code').forEach((element) => {
    if (element.textContent.trim().startsWith('graph ')
            || element.textContent.trim().startsWith('sequenceDiagram')
            || element.textContent.trim().startsWith('classDiagram')
            || element.textContent.trim().startsWith('gantt')
            || element.textContent.trim().startsWith('pie')
            || element.textContent.trim().startsWith('flowchart')) {
      // Create a div for mermaid
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.innerHTML = element.textContent;

      // Replace the code block with the mermaid div
      const pre = element.parentNode;
      pre.parentNode.replaceChild(mermaidDiv, pre);
    }
  });

  // Process any mermaid blocks with init parameters
  document.querySelectorAll('.mermaid').forEach((mermaidDiv) => {
    const content = mermaidDiv.innerHTML;

    // Check if it has init parameters
    if (content.includes('%%{init:')) {
      try {
        // Extract the init object
        const initMatch = content.match(/%%\{init:\s*(\{.*?\})\s*%%/s);
        if (initMatch && initMatch[1]) {
          // Parse the init object, handling both single and double quotes
          let initObj;
          try {
            // Try parsing with single quotes converted to double quotes
            initObj = JSON.parse(initMatch[1].replace(/'/g, '"'));
          } catch (e) {
            // If that fails, try a more lenient approach
            const cleanedInit = initMatch[1]
              .replace(/'/g, '"')
              .replace(/(\w+):/g, '"$1":') // Convert property names to quoted strings
              .replace(/,\s*}/g, '}'); // Remove trailing commas

            initObj = JSON.parse(cleanedInit);
          }

          // Standardize the flowchart settings
          if (initObj.flowchart) {
            // Keep any width/height settings but ensure they're percentages
            if (typeof initObj.flowchart.width === 'string'
                            && !initObj.flowchart.width.endsWith('%')) {
              initObj.flowchart.width = '100%';
            }

            if (typeof initObj.flowchart.height === 'string'
                            && !initObj.flowchart.height.endsWith('%')) {
              initObj.flowchart.height = 'auto';
            }

            // Always set useMaxWidth to true
            initObj.flowchart.useMaxWidth = true;
          }

          // Ensure theme is dark to match our site
          initObj.theme = 'dark';

          // Special handling for pie charts
          if (content.includes('pie') || content.includes('pie showData')) {
            // Add pie chart specific settings
            initObj.pie = {
              ...initObj.pie,
              ...PIE_CONFIG,
            };
          }

          // Add our theme variables with original coloring
          initObj.themeVariables = {
            ...initObj.themeVariables,
            ...THEME_VARIABLES,
          };

          // Replace the original init with our modified version
          const newInit = JSON.stringify(initObj);
          const newContent = content.replace(
            initMatch[0],
            `%%{init: ${newInit}}%%`,
          );

          // Update the mermaid div
          mermaidDiv.innerHTML = newContent;
        }
      } catch (e) {
      }
    }
  });

  // Initialize mermaid after replacing elements
  if (typeof mermaid !== 'undefined') {
    mermaid.init(undefined, '.mermaid');
  }
}

// MutationObserver to watch for dynamically added mermaid diagrams
export function setupMermaidObserver() {
  // Create a new observer
  const observer = new MutationObserver((mutations) => {
    let needsProcessing = false;

    mutations.forEach((mutation) => {
      // Check for added nodes
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node is a mermaid diagram or contains one
          if ((node.classList && node.classList.contains('mermaid'))
                        || (node.querySelectorAll && node.querySelectorAll('.mermaid').length > 0)) {
            needsProcessing = true;
          }
        });
      }
    });

    // If we found new mermaid diagrams, process them
    if (needsProcessing) {
      // Only process diagrams that haven't been processed yet
      const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
      if (unprocessedDiagrams.length > 0) {
        setTimeout(styleMermaidDiagrams, 500);
      }
    }
  });

  // Start observing the document body for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
