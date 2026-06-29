/**
 * Print CSS (part 2 of 2).
 * Second half of the @media print rule block plus the small-screen media query.
 * Concatenated after part 1 to form the full stylesheet.
 */

export const PRINT_CSS_PART2 = `        
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
