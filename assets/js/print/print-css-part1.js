/**
 * Print CSS (part 1 of 2).
 * First half of the @media print rule block. Concatenated with part 2 to form the full stylesheet.
 */

export const PRINT_CSS_PART1 = `
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
`;
