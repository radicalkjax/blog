(function () {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', () => {
    // Find the references section
    const referencesSection = findReferencesSection();
    if (!referencesSection) return;

    // Create collapsible wrapper
    createCollapsibleReferences(referencesSection);

    // Handle inline reference clicks
    handleInlineReferences();

    // Listen for custom expand event
    document.addEventListener('expand-references', () => {
      expandReferences();
    });
  });

  function findReferencesSection() {
    // Look for h2 or h3 with "References" text
    const headers = document.querySelectorAll('h2, h3');
    let referencesHeader = null;

    for (const header of headers) {
      if (header.textContent.toLowerCase().includes('references')) {
        referencesHeader = header;
        break;
      }
    }

    if (!referencesHeader) return null;

    // Get all content between references header and next header or end of content
    const referencesContent = [];
    let currentElement = referencesHeader.nextElementSibling;

    while (currentElement && !['H1', 'H2', 'H3'].includes(currentElement.tagName)) {
      referencesContent.push(currentElement);
      currentElement = currentElement.nextElementSibling;
    }

    return {
      header: referencesHeader,
      content: referencesContent,
    };
  }

  function createCollapsibleReferences(referencesSection) {
    // Create container div
    const container = document.createElement('div');
    container.className = 'references-container';

    // Create header with toggle button
    const headerWrapper = document.createElement('div');
    headerWrapper.className = 'references-header';

    // Move the original header into wrapper
    const headerText = referencesSection.header.textContent;
    referencesSection.header.textContent = '';

    const headerContent = document.createElement('span');
    headerContent.textContent = headerText;

    const toggleButton = document.createElement('button');
    toggleButton.className = 'references-toggle';
    toggleButton.setAttribute('aria-label', 'Toggle References');
    toggleButton.innerHTML = '<span class="toggle-icon">▼</span>';

    headerWrapper.appendChild(headerContent);
    headerWrapper.appendChild(toggleButton);
    referencesSection.header.appendChild(headerWrapper);

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'references-content tex2jax_ignore';

    // Insert container after header
    referencesSection.header.parentNode.insertBefore(container, referencesSection.header);
    container.appendChild(referencesSection.header);
    container.appendChild(contentWrapper);

    // Move all content into wrapper
    referencesSection.content.forEach((element) => {
      // Add tex2jax_ignore class to each element to prevent MathJax processing
      if (element.classList) {
        element.classList.add('tex2jax_ignore');
      }
      contentWrapper.appendChild(element);
    });

    // Add click event
    headerWrapper.addEventListener('click', () => {
      toggleReferences(container, toggleButton);
    });

    // Start collapsed
    container.classList.add('collapsed');

    // Add reference count and ensure references have IDs
    // Look for both list items and paragraphs that start with reference numbers
    let referenceItems = contentWrapper.querySelectorAll('ol li');

    // If no list items found, look for paragraphs with reference pattern
    if (referenceItems.length === 0) {
      const paragraphs = contentWrapper.querySelectorAll('p');
      const refParagraphs = [];
      paragraphs.forEach((p) => {
        if (p.textContent.match(/^\[\d+\]/)) {
          refParagraphs.push(p);
        }
      });
      referenceItems = refParagraphs;
    }

    const referenceCount = referenceItems.length;

    if (referenceCount > 0) {
      const countSpan = document.createElement('span');
      countSpan.className = 'references-count';
      countSpan.textContent = `(${referenceCount} references)`;
      headerContent.appendChild(countSpan);

      // Ensure each reference has an ID for linking
      referenceItems.forEach((item, index) => {
        if (!item.id) {
          // Extract reference number from text if possible
          const match = item.textContent.match(/^\[(\d+)\]/);
          const refNumber = match ? parseInt(match[1], 10) : (index + 1);
          item.id = `ref-${refNumber}`;

          // Also add alternative IDs for different linking conventions
          item.setAttribute('data-ref-id', refNumber);
        }
      });
    }
  }

  function toggleReferences(container, button) {
    container.classList.toggle('collapsed');
    const isCollapsed = container.classList.contains('collapsed');
    button.querySelector('.toggle-icon').textContent = isCollapsed ? '▼' : '▲';
  }

  function expandReferences() {
    const container = document.querySelector('.references-container');
    if (container && container.classList.contains('collapsed')) {
      container.classList.remove('collapsed');
      const button = container.querySelector('.references-toggle');
      if (button) {
        button.querySelector('.toggle-icon').textContent = '▲';
      }
    }
  }

  function handleInlineReferences() {
    // Find all links that might be reference citations
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) return;

      // Check if this is a reference link (typically #ref-1, #reference-1, or similar patterns)
      // Also check for footnote patterns like #fn:1
      if (href.match(/#(ref|reference|fn|cite)[-:]?\d+/i)
                || (href.match(/#\d+$/) && link.textContent.match(/^\[\d+\]$/))) {
        // Prevent default jump behavior temporarily
        e.preventDefault();

        // Expand references section first
        expandReferences();

        // Wait a moment for the animation to start, then scroll
        setTimeout(() => {
          let target = document.querySelector(href);

          // If not found, try to find by reference number
          if (!target) {
            let refNum;
            if (href.match(/#ref-\d+$/)) {
              refNum = href.replace('#ref-', '');
            } else if (href.match(/#\d+$/)) {
              refNum = href.replace('#', '');
            }

            if (refNum) {
              // Try multiple selectors
              target = document.querySelector(`#ref-${refNum}`)
                                    || document.querySelector(`[data-ref-id="${refNum}"]`);

              // If still not found, look for paragraphs with [refNum] at the start
              if (!target) {
                const referencesContent = document.querySelector('.references-content');
                if (referencesContent) {
                  const paragraphs = referencesContent.querySelectorAll('p');
                  for (const p of paragraphs) {
                    if (p.textContent.trim().startsWith(`[${refNum}]`)) {
                      target = p;
                      break;
                    }
                  }
                }
              }
            }
          }

          if (target) {
            // First scroll the page to the references section
            const referencesContainer = document.querySelector('.references-container');
            if (referencesContainer) {
              const containerTop = referencesContainer.getBoundingClientRect().top + window.pageYOffset - 100;
              window.scrollTo({
                top: containerTop,
                behavior: 'smooth',
              });
            }

            // Then scroll within the references content to the specific reference
            setTimeout(() => {
              const referencesContent = document.querySelector('.references-content');
              if (referencesContent && target) {
                // Method 1: Use scrollIntoView if available
                if (target.scrollIntoView) {
                  // First, reset scroll to top to ensure proper calculation
                  referencesContent.scrollTop = 0;

                  // Use scrollIntoView with block: 'start' to scroll the element to the top
                  target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest',
                  });
                } else {
                  // Method 2: Manual calculation as fallback
                  const containerRect = referencesContent.getBoundingClientRect();
                  const targetRect = target.getBoundingClientRect();

                  // Calculate how far to scroll
                  const scrollDistance = targetRect.top - containerRect.top + referencesContent.scrollTop - 30;

                  referencesContent.scrollTo({
                    top: scrollDistance,
                    behavior: 'smooth',
                  });
                }

                // Highlight the reference briefly
                target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                target.style.transition = 'background-color 0.3s ease';

                setTimeout(() => {
                  target.style.backgroundColor = '';
                }, 2000);
              }
            }, 600); // Wait for page scroll and expansion to complete
          }
        }, 100);
      }
    });

    // Also handle hash changes (for when someone navigates directly to a reference)
    window.addEventListener('hashchange', () => {
      const { hash } = window.location;
      if (hash.match(/#(ref|reference|fn|cite)[-:]?\d+/i)) {
        expandReferences();
      }
    });

    // Check on page load if we're linking to a reference
    if (window.location.hash) {
      const { hash } = window.location;
      if (hash.match(/#(ref|reference|fn|cite)[-:]?\d+/i)) {
        expandReferences();
      }
    }
  }
}());
