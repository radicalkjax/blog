/**
 * Key Terms Storage functionality
 * Creates a storage for key terms that can be looked up via Wikipedia or Google search
 * Terms are displayed as bubbles at the bottom of the TOC
 * Potential key terms in the content are underlined and can be added to storage when clicked
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('Key Terms script loaded');
  
  // List of potential key terms to highlight in the content
  const potentialKeyTerms = [
    // Malware and security terms
    'malware detection', 'ensemble learning', 'deep learning', 'adversarial robustness',
    'multi-provider', 'Byzantine fault tolerance', 'information-theoretic analysis',
    'Monte Carlo simulations', 'ROI', 'false positive', 'API costs', 'latency requirements',
    'human factor', 'correlation', 'uncertainty quantification', 'ensemble approaches',
    'cybersecurity', 'neural networks', 'machine learning', 'artificial intelligence',
    'threat landscape', 'detection degradation', 'adversarial decay', 'polymorphic',
    'metamorphic', 'feature engineering', 'weight optimization', 'Shapley value',
    'attack success rate', 'provider diversity', 'cost-benefit analysis',
    
    // Additional technical terms
    'algorithm', 'data science', 'classification', 'regression', 'clustering',
    'supervised learning', 'unsupervised learning', 'reinforcement learning',
    'convolutional neural network', 'recurrent neural network', 'transformer',
    'attention mechanism', 'backpropagation', 'gradient descent', 'overfitting',
    'underfitting', 'regularization', 'hyperparameter', 'cross-validation',
    'precision', 'recall', 'F1 score', 'accuracy', 'ROC curve', 'AUC',
    'feature selection', 'dimensionality reduction', 'PCA', 'SVD', 't-SNE',
    'transfer learning', 'fine-tuning', 'zero-shot learning', 'few-shot learning',
    
    // Cybersecurity specific terms
    'vulnerability', 'exploit', 'threat actor', 'attack vector', 'payload',
    'signature-based detection', 'heuristic detection', 'behavioral analysis',
    'sandbox', 'honeypot', 'intrusion detection', 'intrusion prevention',
    'endpoint protection', 'firewall', 'encryption', 'decryption', 'hash function',
    'cryptography', 'authentication', 'authorization', 'zero-day', 'CVE',
    'penetration testing', 'red team', 'blue team', 'SIEM', 'SOC',
    'threat intelligence', 'incident response', 'forensics', 'malware analysis'
  ];
  
  // Initialize key terms storage from localStorage if available
  let keyTerms = [];
  if (localStorage.getItem('keyTerms')) {
    try {
      keyTerms = JSON.parse(localStorage.getItem('keyTerms'));
      console.log('Loaded key terms from localStorage:', keyTerms);
    } catch (e) {
      console.error('Error loading key terms from localStorage:', e);
      localStorage.removeItem('keyTerms');
    }
  }
  
  // Function to save key terms to localStorage
  function saveKeyTerms() {
    localStorage.setItem('keyTerms', JSON.stringify(keyTerms));
    console.log('Saved key terms to localStorage:', keyTerms);
  }
  
  // Function to add a key term
  function addKeyTerm(term) {
    // Check if term already exists
    if (keyTerms.includes(term)) {
      console.log('Term already exists:', term);
      return;
    }
    
    keyTerms.push(term);
    saveKeyTerms();
    renderKeyTerms();
    console.log('Added key term:', term);
  }
  
  // Function to remove a key term
  function removeKeyTerm(term) {
    const index = keyTerms.indexOf(term);
    if (index !== -1) {
      keyTerms.splice(index, 1);
      saveKeyTerms();
      renderKeyTerms();
      console.log('Removed key term:', term);
    }
  }
  
  // Function to render key terms as bubbles
  function renderKeyTerms() {
    const keyTermsContainer = document.getElementById('key-terms-content');
    if (!keyTermsContainer) {
      console.log('No key terms container found');
      return;
    }
    
    // Clear existing terms
    keyTermsContainer.innerHTML = '';
    
    // Add each term as a bubble
    keyTerms.forEach(term => {
      const bubble = document.createElement('div');
      bubble.className = 'key-term-bubble';
      
      // Create the term text
      const termText = document.createElement('span');
      termText.className = 'key-term-text';
      termText.textContent = term;
      termText.addEventListener('click', function() {
        // Open Wikipedia search in a new tab
        const searchUrl = `https://www.google.com/search?q=wikipedia+${encodeURIComponent(term)}`;
        window.open(searchUrl, '_blank');
      });
      bubble.appendChild(termText);
      
      // Create the remove button
      const removeBtn = document.createElement('span');
      removeBtn.className = 'key-term-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering the bubble click
        removeKeyTerm(term);
      });
      bubble.appendChild(removeBtn);
      
      keyTermsContainer.appendChild(bubble);
    });
  }
  
  // Function to highlight potential key terms in the content
  function highlightKeyTerms() {
    const postContent = document.querySelector('.post-content');
    if (!postContent) {
      console.log('No post content found');
      return;
    }
    
    console.log('Found post content:', postContent);
    
    // Get all text nodes in the post content
    const textNodes = [];
    const walk = document.createTreeWalker(
      postContent,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Skip empty text nodes
          if (!node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }
          
          // Skip nodes that are in code blocks, pre tags, or script tags
          const parent = node.parentNode;
          if (parent.nodeName === 'CODE' || parent.nodeName === 'PRE' || 
              parent.nodeName === 'SCRIPT' || parent.nodeName === 'STYLE' ||
              parent.classList && (parent.classList.contains('key-term-suggestion') || 
                                  parent.classList.contains('mermaid'))) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      },
      false
    );
    
    let node;
    while (node = walk.nextNode()) {
      textNodes.push(node);
    }
    
    console.log('Found ' + textNodes.length + ' text nodes');
    
    // Process each text node
    textNodes.forEach(textNode => {
      let text = textNode.nodeValue;
      let parent = textNode.parentNode;
      let matches = [];
      
      // Find all potential key terms in this text node
      potentialKeyTerms.forEach(term => {
        // Case insensitive search
        const termRegex = new RegExp('\\b' + term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'gi');
        let match;
        
        while ((match = termRegex.exec(text)) !== null) {
          // Don't highlight terms that are already in the key terms storage
          if (!keyTerms.includes(match[0].toLowerCase()) && 
              !keyTerms.includes(match[0])) {
            matches.push({
              term: match[0],
              index: match.index,
              length: match[0].length
            });
          }
        }
      });
      
      // Sort matches by index (descending) to avoid messing up indices when replacing
      matches.sort((a, b) => b.index - a.index);
      
      // Replace text with highlighted spans
      matches.forEach(match => {
        // Split the text node at the match
        const before = text.substring(0, match.index);
        const matchText = text.substring(match.index, match.index + match.length);
        const after = text.substring(match.index + match.length);
        
        // Create a span for the match
        const span = document.createElement('span');
        span.className = 'key-term-suggestion';
        span.textContent = matchText;
        span.title = 'Click to add to key terms';
        span.addEventListener('click', function() {
          addKeyTerm(matchText);
          // Remove the suggestion styling after adding
          span.classList.remove('key-term-suggestion');
          span.classList.add('key-term-added');
          span.title = 'Added to key terms';
          // Remove the click event
          span.replaceWith(span.cloneNode(true));
        });
        
        // Replace the text node with the three new nodes
        const afterNode = document.createTextNode(after);
        parent.insertBefore(afterNode, textNode.nextSibling);
        parent.insertBefore(span, afterNode);
        textNode.nodeValue = before;
        
        // Update for next iteration
        text = before;
      });
    });
  }
  
  // Function to create the key terms container
  function createKeyTermsContainer() {
    const tocContainer = document.getElementById('floating-toc');
    if (!tocContainer) {
      console.log('No TOC container found');
      return;
    }
    
    // Create the key terms header
    const keyTermsHeader = document.createElement('div');
    keyTermsHeader.id = 'key-terms-header';
    keyTermsHeader.textContent = 'Key Terms';
    
    // Create the key terms content (scrollable area)
    const keyTermsContent = document.createElement('div');
    keyTermsContent.id = 'key-terms-content';
    
    // Create the key terms input area
    const keyTermsInput = document.createElement('div');
    keyTermsInput.id = 'key-terms-input';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Add a key term...';
    
    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.addEventListener('click', function() {
      const term = input.value.trim();
      if (term) {
        addKeyTerm(term);
        input.value = '';
      }
    });
    
    // Add event listener for Enter key
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const term = input.value.trim();
        if (term) {
          addKeyTerm(term);
          input.value = '';
        }
      }
    });
    
    keyTermsInput.appendChild(input);
    keyTermsInput.appendChild(addButton);
    
    // Create the key terms container
    const keyTermsContainer = document.createElement('div');
    keyTermsContainer.id = 'key-terms-container';
    keyTermsContainer.appendChild(keyTermsHeader);
    keyTermsContainer.appendChild(keyTermsContent);
    keyTermsContainer.appendChild(keyTermsInput);
    
    // Add the key terms container to the TOC container
    tocContainer.appendChild(keyTermsContainer);
    
    // Render existing key terms
    renderKeyTerms();
  }
  
  // Initialize the key terms container after a short delay to ensure TOC is created
  setTimeout(function() {
    createKeyTermsContainer();
    // Highlight key terms in the content after the container is created
    setTimeout(function() {
      console.log('Running highlightKeyTerms');
      highlightKeyTerms();
      
      // If no terms were highlighted on the first try, try again after a longer delay
      // This helps with dynamic content that might load after the initial page load
      setTimeout(function() {
        console.log('Running highlightKeyTerms again');
        highlightKeyTerms();
      }, 1000);
    }, 100);
  }, 500);
});

// Add CSS for key term suggestions
const style = document.createElement('style');
style.textContent = `
  .key-term-suggestion {
    text-decoration: underline;
    text-decoration-style: dotted;
    text-decoration-color: #9c1f8c;
    text-decoration-thickness: 2px;
    cursor: pointer;
    color: inherit;
    transition: background-color 0.2s;
    padding-bottom: 2px;
    border-bottom: 1px dotted #9c1f8c;
  }
  
  .key-term-suggestion:hover {
    background-color: rgba(156, 31, 140, 0.2);
  }
  
  .key-term-added {
    color: inherit;
    background-color: rgba(156, 31, 140, 0.1);
  }
`;
document.head.appendChild(style);
