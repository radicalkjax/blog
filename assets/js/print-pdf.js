/**
 * Print to PDF functionality
 * Creates a button below Key Terms that allows printing the document with custom styling
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Print PDF script loaded');
  
  // Function to create print styles
  function createPrintStyles() {
    const printStyle = document.createElement('style');
    printStyle.id = 'print-styles';
    printStyle.textContent = `
      @media print {
        /* Page setup */
        @page {
          size: letter;
          margin: 1in;
        }
        
        /* Hide elements that shouldn't print */
        #floating-toc,
        #key-terms-container,
        #print-pdf-container,
        .site-header,
        .site-footer,
        #mermaid-modal,
        button,
        .key-term-suggestion,
        .key-term-remove {
          display: none !important;
        }
        
        /* General layout fixes */
        body {
          background: white !important;
          color: black !important;
          font-size: 11pt;
          line-height: 1.5;
        }
        
        .post-content {
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
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
        
        /* Key terms if they need to be printed */
        .key-term-added {
          background-color: #f0f0f0 !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          font-weight: bold;
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
      console.log('No TOC container or parent found');
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