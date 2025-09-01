/**
 * Print to PDF functionality
 * Creates a button below Key Terms that allows printing the document with custom styling
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // Function to create print styles
  function createPrintStyles() {
    const printStyle = document.createElement('style');
    printStyle.id = 'print-styles';
    printStyle.textContent = `
      @media print {
        /* Page setup - reduced margins for more content */
        @page {
          size: letter;
          margin: 0.5in;
        }
        
        /* Hide elements that shouldn't print */
        header,
        footer,
        .site-logo-container,
        .social-icons,
        nav,
        #toc-container,
        #floating-toc,
        #key-terms-container,
        #print-pdf-container,
        #print-pdf-btn,
        .site-header,
        .site-footer,
        #mermaid-modal,
        button,
        .key-term-remove,
        .references-toggle,
        .header-content {
          display: none !important;
        }
        
        /* General layout fixes */
        body {
          background: white !important;
          color: black !important;
          font-size: 11pt;
          line-height: 1.5;
          margin: 0 !important;
          padding: 0 !important;
          font-family: Arial, sans-serif !important;
        }
        
        /* Main container should use full width */
        main,
        .container,
        article,
        .post {
          max-width: 100% !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        .post-content {
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
        
        /* Headers */
        h1, h2, h3, h4, h5, h6 {
          color: black !important;
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        
        h1 {
          font-size: 24pt;
          margin-top: 0;
        }
        
        h2 {
          font-size: 18pt;
          margin-top: 24pt;
        }
        
        h3 {
          font-size: 14pt;
          margin-top: 18pt;
        }
        
        /* Code blocks */
        pre {
          background-color: #f5f5f5 !important;
          border: 1px solid #ddd !important;
          page-break-inside: avoid;
          font-size: 9pt;
          overflow-wrap: break-word;
          white-space: pre-wrap;
        }
        
        pre code {
          color: black !important;
          background: transparent !important;
        }
        
        /* Fix for elements with rgba colors */
        [style*="rgba"] {
          color: black !important;
        }
        
        /* Ensure IEEE paper styling prints correctly */
        div[style*="text-align: center"] {
          text-align: center !important;
          width: 100% !important;
          margin: 0 auto !important;
        }
        
        div[style*="text-align: center"] * {
          color: black !important;
          display: inline-block !important;
          visibility: visible !important;
        }
        
        /* Ensure italic divs (Abstract and Index Terms) print correctly */
        div[style*="font-style: italic"] {
          color: black !important;
          display: block !important;
          visibility: visible !important;
        }
        
        div[style*="font-style: italic"] p,
        div[style*="font-style: italic"] strong {
          color: black !important;
          display: inline !important;
          visibility: visible !important;
        }
        
        /* Fix for content after em dashes */
        p:contains("—") {
          color: black !important;
        }
        
        /* Ensure all paragraph text is visible */
        p {
          color: black !important;
          visibility: visible !important;
          display: block !important;
          opacity: 1 !important;
          -webkit-text-fill-color: black !important;
        }
        
        /* Default text color for all elements */
        body, p, span, div, li, td, th, strong, em, i, b, article, section {
          color: black !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Remove any filters or effects that might hide text */
        * {
          filter: none !important;
          -webkit-filter: none !important;
          text-shadow: none !important;
          -webkit-text-stroke: 0 !important;
        }
        
        /* Ensure text in italic divs is visible */
        div[style*="font-style: italic"] {
          font-family: Arial, sans-serif !important;
        }
        
        div[style*="font-style: italic"] p {
          color: black !important;
          -webkit-text-fill-color: black !important;
          font-family: Arial, sans-serif !important;
          font-style: italic !important;
        }
        
        /* Specifically target paragraphs with Index Terms */
        p:contains("Index Terms") {
          font-family: Arial, sans-serif !important;
          color: black !important;
          -webkit-text-fill-color: black !important;
        }
        
        /* Inline code */
        code {
          background-color: #f0f0f0 !important;
          color: black !important;
          padding: 2px 4px !important;
          font-size: 10pt;
        }
        
        /* Links */
        a {
          color: black !important;
          text-decoration: underline !important;
        }
        
        /* Show URLs after links */
        a[href]:after {
          content: " (" attr(href) ")";
          font-size: 9pt;
          color: #666 !important;
        }
        
        /* But not for internal links */
        a[href^="#"]:after,
        a[href^="javascript:"]:after {
          content: "";
        }
        
        /* Tables */
        table {
          border-collapse: collapse !important;
          width: 100% !important;
          page-break-inside: avoid;
        }
        
        th, td {
          border: 1px solid #666 !important;
          padding: 8px !important;
          color: black !important;
        }
        
        th {
          background-color: #f0f0f0 !important;
          font-weight: bold;
        }
        
        /* Images */
        img {
          max-width: 100% !important;
          height: auto !important;
          page-break-inside: avoid;
        }
        
        /* Mermaid diagrams */
        .mermaid {
          background: white !important;
          border: 1px solid #ccc !important;
          page-break-inside: avoid;
          padding: 10px !important;
          margin: 10px 0 !important;
        }
        
        .mermaid svg {
          max-width: 100% !important;
          height: auto !important;
        }
        
        /* Mermaid text should be black */
        .mermaid text,
        .mermaid .label,
        .mermaid .nodeLabel,
        .mermaid .edgeLabel {
          fill: black !important;
          color: black !important;
        }
        
        /* Mermaid paths and shapes */
        .mermaid path,
        .mermaid line,
        .mermaid rect,
        .mermaid circle,
        .mermaid ellipse,
        .mermaid polygon {
          stroke: black !important;
          fill: white !important;
        }
        
        /* Mermaid backgrounds */
        .mermaid .node rect,
        .mermaid .node circle,
        .mermaid .node ellipse,
        .mermaid .node polygon {
          fill: #f9f9f9 !important;
          stroke: black !important;
        }
        
        /* Math equations */
        .MathJax_Display {
          page-break-inside: avoid;
          margin: 10px 0 !important;
        }
        
        /* MathJax specific fixes */
        mjx-container {
          page-break-inside: avoid !important;
          margin: 15px 0 !important;
        }
        
        /* Display equations get a dark background with white text */
        mjx-container[display="true"] {
          display: block !important;
          text-align: center !important;
          background-color: #333333 !important;
          border: 1px solid #000 !important;
          padding: 15px !important;
          border-radius: 4px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Inline equations */
        mjx-container:not([display="true"]) {
          display: inline-block !important;
          background-color: #555555 !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Override the universal transparent background for MathJax */
        mjx-container, mjx-container * {
          background-color: inherit !important;
        }
        
        /* MathJax math content - WHITE text */
        mjx-math, mjx-math * {
          color: white !important;
          fill: white !important;
          stroke: white !important;
        }
        
        /* All MathJax elements - WHITE */
        mjx-mi, mjx-mo, mjx-mn, mjx-ms, mjx-mtext, mjx-mfrac, mjx-msqrt, mjx-mroot, mjx-msub, mjx-msup, mjx-msubsup, mjx-munder, mjx-mover, mjx-munderover {
          color: white !important;
          fill: white !important;
        }
        
        /* MathJax SVG elements if used */
        mjx-container svg {
          background: transparent !important;
        }
        
        mjx-container svg * {
          fill: white !important;
          stroke: white !important;
        }
        
        /* Equation numbers */
        mjx-mtd, mjx-mlabeledtr {
          color: white !important;
        }
        
        /* Override the universal black color for MathJax content */
        mjx-container, mjx-container *, 
        mjx-math, mjx-math *,
        mjx-mi, mjx-mo, mjx-mn, mjx-ms, mjx-mtext,
        mjx-mfrac, mjx-msqrt, mjx-mroot,
        mjx-msub, mjx-msup, mjx-msubsup,
        mjx-munder, mjx-mover, mjx-munderover,
        mjx-mtd, mjx-mlabeledtr {
          color: white !important;
          -webkit-text-fill-color: white !important;
          fill: white !important;
        }
        
        /* tex2jax_ignore sections should print normally */
        .tex2jax_ignore, .tex2jax_ignore * {
          color: black !important;
          background: transparent !important;
        }
        
        /* Blockquotes */
        blockquote {
          border-left: 4px solid #666 !important;
          padding-left: 16px !important;
          margin-left: 0 !important;
          color: #333 !important;
          page-break-inside: avoid;
        }
        
        /* Lists */
        ul, ol {
          page-break-inside: avoid;
        }
        
        li {
          page-break-inside: avoid;
        }
        
        /* Ensure content doesn't get cut off */
        p, div {
          orphans: 3;
          widows: 3;
        }
        
        /* Title and metadata */
        .post-title {
          font-size: 28pt;
          margin-bottom: 10pt;
          color: black !important;
        }
        
        .post-meta {
          font-size: 10pt;
          color: #666 !important;
          margin-bottom: 20pt;
        }
        
        /* Clear backgrounds for most elements */
        body * {
          background: transparent !important;
        }
        
        /* But preserve backgrounds for these */
        pre, pre *, code, th, .mermaid, mjx-container, mjx-container * {
          /* Backgrounds set by specific rules */
        }
        
        /* Ensure all text is visible */
        p, div, span, h1, h2, h3, h4, h5, h6 {
          color: black !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        /* Special handling for the IEEE-style title */
        h1[style] {
          color: black !important;
          font-size: 24pt !important;
          text-align: center !important;
          margin: 10px 0 !important;
          display: block !important;
          width: 100% !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Key terms styling for print - inherit parent formatting */
        .key-term-suggestion {
          color: inherit !important;
          background-color: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          text-decoration: inherit !important;
          font-weight: inherit !important;
          font-style: inherit !important;
          font-size: inherit !important;
          font-family: inherit !important;
          display: inline !important;
          visibility: visible !important;
          border: none !important;
        }
        
        .key-term-added {
          background-color: transparent !important;
          padding: 0 !important;
          border-radius: 0 !important;
          font-weight: inherit !important;
          font-style: inherit !important;
          font-size: inherit !important;
          font-family: inherit !important;
          color: inherit !important;
          display: inline !important;
          visibility: visible !important;
        }
        
        /* Ensure key terms are not hidden */
        span.key-term-suggestion, span.key-term-added {
          display: inline !important;
          color: inherit !important;
          visibility: visible !important;
          opacity: 1 !important;
        }
        
        /* Override any JavaScript-added styles that might hide terms */
        [style*="display: none"] .key-term-suggestion,
        [style*="display: none"] .key-term-added {
          display: inline !important;
        }
        
        /* Ensure text with key-term classes is visible even if parent is styled */
        * .key-term-suggestion,
        * .key-term-added {
          color: inherit !important;
          display: inline !important;
          visibility: visible !important;
        }
        
        /* References section should expand for print */
        .references-container {
          border: 1px solid #ccc !important;
          background: white !important;
          box-shadow: none !important;
          margin: 20px 0 !important;
        }
        
        .references-container.collapsed .references-content {
          max-height: none !important;
          padding: 20px !important;
          overflow: visible !important;
        }
        
        .references-content {
          max-height: none !important;
          overflow: visible !important;
          background: white !important;
        }
        
        .references-header {
          background: #f5f5f5 !important;
          color: black !important;
          border-bottom: 1px solid #ccc !important;
        }
        
        /* Citation links should just be text in print */
        .citation-link {
          color: black !important;
          text-decoration: none !important;
          border: none !important;
        }
        
        /* Final overrides to ensure correct rendering */
        /* All text should be black by default */
        body * {
          color: black !important;
        }
        
        /* But MathJax should be white on dark background */
        mjx-container[display="true"] *,
        mjx-container:not([display="true"]) * {
          color: white !important;
          -webkit-text-fill-color: white !important;
        }
        
        
        /* Debug rule - make all text visible */
        p, div, span {
          opacity: 1 !important;
          visibility: visible !important;
        }
      }
      
      /* Hide print button on very small screens if it blocks content */
      @media (max-width: 480px) {
        #print-pdf-container {
          bottom: 10px !important;
          right: 10px !important;
          width: 48px !important;
          height: 48px !important;
        }
        
        #print-to-pdf-button {
          font-size: 20px !important;
        }
      }
    `;
    document.head.appendChild(printStyle);
  }
  
  // Function to prepare document for printing
  function preparePrint() {
    // Ensure all images are loaded
    const images = document.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      return new Promise((resolve, reject) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = resolve;
          img.onerror = resolve; // Resolve even on error to not block printing
        }
      });
    });
    
    // Wait for all images and then print
    Promise.all(imagePromises).then(() => {
      // Give a small delay for any final rendering
      setTimeout(() => {
        window.print();
      }, 500);
    });
  }
  
  // Function to create the print button container
  function createPrintContainer() {
    const tocContainer = document.getElementById('floating-toc');
    if (!tocContainer || !tocContainer.parentNode) {
      return;
    }
    
    // Create the print button container
    const printContainer = document.createElement('div');
    printContainer.id = 'print-pdf-container';
    printContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: #1a1a1a;
      border: 2px solid #6d105a;
      border-radius: 50%;
      padding: 0;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      z-index: 999;
      width: 56px;
      height: 56px;
    `;
    
    // Create the print button
    const printButton = document.createElement('button');
    printButton.id = 'print-to-pdf-button';
    printButton.innerHTML = '🖨️';
    printButton.title = 'Print to PDF';
    printButton.style.cssText = `
      width: 100%;
      height: 100%;
      background-color: #6d105a;
      color: #ffffff;
      border: none;
      border-radius: 50%;
      font-size: 24px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Add hover effect
    printButton.onmouseover = function() {
      this.style.backgroundColor = '#ff6b6b';
      this.style.transform = 'scale(1.05)';
    };
    printButton.onmouseout = function() {
      this.style.backgroundColor = '#6d105a';
      this.style.transform = 'scale(1)';
    };
    
    // Add click handler
    printButton.addEventListener('click', function() {
      preparePrint();
    });
    
    // Assemble the container
    printContainer.appendChild(printButton);
    
    // Insert in the body to ensure it's independent
    document.body.appendChild(printContainer);
  }
  
  // Initialize print functionality
  createPrintStyles();
  
  // Wait for other components to load
  setTimeout(function() {
    createPrintContainer();
  }, 1000);
});