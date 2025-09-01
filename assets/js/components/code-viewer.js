/**
 * CodeViewer Web Component
 * A syntax-highlighted code viewer with copy functionality
 * Demonstrates modern Web Components with professional features
 */

class CodeViewer extends HTMLElement {
  static get observedAttributes() {
    return ['language', 'filename', 'highlight-lines', 'show-line-numbers'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.state = {
      code: '',
      language: 'javascript',
      filename: null,
      highlightLines: [],
      showLineNumbers: true,
      copied: false
    };
  }

  connectedCallback() {
    this.state.code = this.textContent.trim();
    this.innerHTML = ''; // Clear original content
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.cleanup();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    switch (name) {
      case 'language':
        this.state.language = newValue;
        break;
      case 'filename':
        this.state.filename = newValue;
        break;
      case 'highlight-lines':
        this.state.highlightLines = newValue.split(',').map(n => parseInt(n.trim()));
        break;
      case 'show-line-numbers':
        this.state.showLineNumbers = newValue !== 'false';
        break;
    }
    
    if (this.shadowRoot) {
      this.render();
    }
  }

  render() {
    const styles = `
      <style>
        :host {
          display: block;
          position: relative;
          font-family: var(--font-family-mono, 'DM Mono', monospace);
          font-size: 14px;
          line-height: 1.6;
          border-radius: 8px;
          overflow: hidden;
          background: var(--code-bg, #1a1a1a);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          container-type: inline-size;
        }

        .code-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          background: var(--code-header-bg, #0d0d0d);
          border-bottom: 1px solid var(--code-border, rgba(255, 255, 255, 0.1));
        }

        .code-filename {
          color: var(--code-filename, #9ca3af);
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .code-language {
          display: inline-block;
          padding: 0.125rem 0.5rem;
          background: var(--code-lang-bg, rgba(139, 92, 246, 0.2));
          color: var(--code-lang-color, #a78bfa);
          border-radius: 4px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .code-actions {
          display: flex;
          gap: 0.5rem;
        }

        .copy-button {
          padding: 0.375rem 0.75rem;
          background: transparent;
          border: 1px solid var(--code-border, rgba(255, 255, 255, 0.2));
          color: var(--code-text, #e5e7eb);
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .copy-button:hover {
          background: var(--code-button-hover, rgba(255, 255, 255, 0.1));
          border-color: var(--code-border-hover, rgba(255, 255, 255, 0.3));
        }

        .copy-button:focus-visible {
          outline: 2px solid var(--color-accent, #4493f8);
          outline-offset: 2px;
        }

        .copy-button.copied {
          background: var(--code-success-bg, rgba(34, 197, 94, 0.2));
          border-color: var(--code-success-border, #22c55e);
          color: var(--code-success-color, #22c55e);
        }

        .code-container {
          position: relative;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        }

        .code-container::-webkit-scrollbar {
          height: 8px;
        }

        .code-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .code-container::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }

        .code-content {
          display: table;
          width: 100%;
          padding: 1rem 0;
        }

        .code-line {
          display: table-row;
          transition: background-color 0.2s;
        }

        .code-line:hover {
          background: var(--code-line-hover, rgba(255, 255, 255, 0.05));
        }

        .code-line.highlighted {
          background: var(--code-highlight, rgba(251, 191, 36, 0.1));
          position: relative;
        }

        .code-line.highlighted::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--code-highlight-accent, #fbbf24);
        }

        .line-number {
          display: table-cell;
          padding: 0 1rem;
          text-align: right;
          color: var(--code-line-number, #4b5563);
          user-select: none;
          width: 1%;
          white-space: nowrap;
        }

        .line-content {
          display: table-cell;
          padding: 0 1rem;
          white-space: pre;
          color: var(--code-text, #e5e7eb);
        }

        /* Syntax highlighting colors */
        .token-keyword { color: #c678dd; }
        .token-string { color: #98c379; }
        .token-number { color: #d19a66; }
        .token-function { color: #61afef; }
        .token-comment { color: #5c6370; font-style: italic; }
        .token-class { color: #e06c75; }
        .token-operator { color: #56b6c2; }
        .token-punctuation { color: #abb2bf; }
        .token-variable { color: #e06c75; }
        .token-property { color: #d19a66; }

        /* Container queries for responsive design */
        @container (max-width: 600px) {
          .code-header {
            flex-direction: column;
            gap: 0.75rem;
            align-items: flex-start;
          }

          .line-number {
            padding: 0 0.5rem;
          }

          .line-content {
            padding: 0 0.5rem;
          }
        }

        /* Animation for copy feedback */
        @keyframes copy-pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }

        .copy-icon {
          width: 16px;
          height: 16px;
        }

        .copied .copy-icon {
          animation: copy-pulse 0.3s ease;
        }
      </style>
    `;

    const copyIcon = `<svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
    </svg>`;

    const checkIcon = `<svg class="copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
    </svg>`;

    const lines = this.state.code.split('\n');
    const highlightedCode = lines.map((line, index) => {
      const lineNumber = index + 1;
      const isHighlighted = this.state.highlightLines.includes(lineNumber);
      const highlightedLine = this.highlightSyntax(line, this.state.language);
      
      return `
        <div class="code-line ${isHighlighted ? 'highlighted' : ''}">
          ${this.state.showLineNumbers ? `<span class="line-number">${lineNumber}</span>` : ''}
          <span class="line-content">${highlightedLine}</span>
        </div>
      `;
    }).join('');

    const template = `
      ${styles}
      <div class="code-header">
        <div class="code-filename">
          ${this.state.filename ? `<span>${this.state.filename}</span>` : ''}
          <span class="code-language">${this.state.language}</span>
        </div>
        <div class="code-actions">
          <button class="copy-button ${this.state.copied ? 'copied' : ''}" aria-label="Copy code">
            ${this.state.copied ? checkIcon : copyIcon}
            <span>${this.state.copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <div class="code-container">
        <div class="code-content">
          ${highlightedCode}
        </div>
      </div>
    `;

    this.shadowRoot.innerHTML = template;
  }

  highlightSyntax(code, language) {
    // Basic syntax highlighting (can be enhanced with Prism.js or highlight.js)
    const patterns = {
      javascript: [
        { regex: /\b(const|let|var|function|class|if|else|for|while|return|import|export|async|await)\b/g, class: 'token-keyword' },
        { regex: /(["'])(?:(?=(\\?))\2.)*?\1/g, class: 'token-string' },
        { regex: /\b\d+\b/g, class: 'token-number' },
        { regex: /\/\/.*$/gm, class: 'token-comment' },
        { regex: /\/\*[\s\S]*?\*\//g, class: 'token-comment' },
        { regex: /\b([a-zA-Z_]\w*)\s*\(/g, class: 'token-function', group: 1 },
        { regex: /[{}[\]()]/g, class: 'token-punctuation' },
        { regex: /[+\-*/%=<>!&|?:]/g, class: 'token-operator' }
      ],
      css: [
        { regex: /[.#][\w-]+/g, class: 'token-class' },
        { regex: /\b(px|em|rem|%|vh|vw|deg|s|ms)\b/g, class: 'token-number' },
        { regex: /:[\w-]+/g, class: 'token-property' },
        { regex: /\/\*[\s\S]*?\*\//g, class: 'token-comment' }
      ],
      html: [
        { regex: /&lt;\/?[\w-]+/g, class: 'token-keyword' },
        { regex: /[\w-]+=/g, class: 'token-property' },
        { regex: /(["'])(?:(?=(\\?))\2.)*?\1/g, class: 'token-string' },
        { regex: /&lt;!--[\s\S]*?--&gt;/g, class: 'token-comment' }
      ]
    };

    let highlighted = this.escapeHtml(code);
    const langPatterns = patterns[language] || patterns.javascript;

    langPatterns.forEach(({ regex, class: className, group }) => {
      if (group) {
        highlighted = highlighted.replace(regex, (match, p1) => 
          match.replace(p1, `<span class="${className}">${p1}</span>`)
        );
      } else {
        highlighted = highlighted.replace(regex, `<span class="${className}">$&</span>`);
      }
    });

    return highlighted;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  setupEventListeners() {
    const copyButton = this.shadowRoot.querySelector('.copy-button');
    copyButton?.addEventListener('click', () => this.copyCode());
  }

  cleanup() {
    const copyButton = this.shadowRoot.querySelector('.copy-button');
    copyButton?.removeEventListener('click', () => this.copyCode());
  }

  async copyCode() {
    try {
      await navigator.clipboard.writeText(this.state.code);
      this.state.copied = true;
      this.render();
      
      setTimeout(() => {
        this.state.copied = false;
        this.render();
      }, 2000);

      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('code-copied', {
        detail: { code: this.state.code, language: this.state.language },
        bubbles: true,
        composed: true
      }));
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }
}

// Register the custom element
customElements.define('code-viewer', CodeViewer);

export default CodeViewer;