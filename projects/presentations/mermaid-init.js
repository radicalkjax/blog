/* global mermaid */

// Initialize mermaid if it exists
if (typeof mermaid !== 'undefined') {
  mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    themeVariables: {
      primaryColor: '#6d105a',
      primaryTextColor: '#ffffff',
      primaryBorderColor: '#ffffff',
      lineColor: '#ffffff',
      secondaryColor: '#ffffff',
      tertiaryColor: '#6d105a'
    }
  });
}
