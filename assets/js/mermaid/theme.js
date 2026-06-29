/**
 * Mermaid theme and configuration constants.
 * Shared theme variables, pie-chart config, and global Mermaid initialization.
 */

// Theme variables with the original site coloring.
export const THEME_VARIABLES = {
  primaryColor: 'rgba(255, 255, 255, 0.1)',
  primaryTextColor: '#ffffff',
  primaryBorderColor: '#ffffff',
  lineColor: '#ffffff',
  secondaryColor: 'rgba(109, 16, 90, 0.7)',
  tertiaryColor: 'rgba(255, 255, 255, 0.05)',
  // Ensure all text is white
  textColor: '#ffffff',
  mainBkg: '#1a1a1a',
  nodeBorder: '#ffffff',
  edgeLabelBackground: 'rgba(109, 16, 90, 0.7)',
  clusterBkg: 'rgba(255, 255, 255, 0.05)',
  clusterBorder: '#ffffff',
  titleColor: '#ffffff',
  nodeTextColor: '#ffffff',
  edgeTextColor: '#ffffff',
  actorTextColor: '#ffffff',
  actorBorder: '#ffffff',
  noteBkgColor: 'rgba(109, 16, 90, 0.7)',
  noteTextColor: '#ffffff',
  noteBorderColor: '#ffffff',
  labelColor: '#ffffff',
  loopTextColor: '#ffffff',
};

// Pie chart specific settings shared between global config and per-block init.
export const PIE_CONFIG = {
  textPosition: 0.65, // Default position for text
  useWidth: 0.5, // Default width for the pie
  useMaxWidth: true, // Ensure it fits in the container
  radius: 0.7, // Default pie chart size
  textMargin: 5, // Default text margin
  wrap: true, // Wrap long labels
};

// Function to handle mermaid initialization
export function setupMermaidConfig() {
  if (typeof mermaid !== 'undefined') {
    // Set global mermaid configuration with original coloring
    mermaid.initialize({
      startOnLoad: true,
      theme: 'dark',
      themeVariables: { ...THEME_VARIABLES },
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
      // Add specific settings for pie charts
      pie: { ...PIE_CONFIG },
      securityLevel: 'loose',
    });
  }
}
