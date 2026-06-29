/**
 * Mermaid diagram styling and responsiveness helpers.
 * Wraps diagrams in containers and applies the site styling to rendered SVGs.
 */

// Function to wrap mermaid diagrams in a container for better handling
export function wrapMermaidDiagrams() {
  // Find all mermaid diagram containers
  const mermaidDivs = document.querySelectorAll('.mermaid');

  if (mermaidDivs.length === 0) return;

  mermaidDivs.forEach((div) => {
    // Skip if already wrapped
    if (div.parentNode.classList.contains('mermaid-wrapper')) return;

    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'mermaid-wrapper';

    // Replace the mermaid div with the wrapper containing the mermaid div
    div.parentNode.insertBefore(wrapper, div);
    wrapper.appendChild(div);
  });
}

// Function to style mermaid diagrams for better responsiveness
export function styleMermaidDiagrams() {
  // First ensure all diagrams are wrapped
  wrapMermaidDiagrams();

  // Find all mermaid diagram containers
  const mermaidDivs = document.querySelectorAll('.mermaid');

  if (mermaidDivs.length === 0) return;

  mermaidDivs.forEach((div) => {
    // Find the SVG element inside the mermaid div
    const svg = div.querySelector('svg');
    if (!svg) return;

    // Mark as processed
    div.setAttribute('data-processed', 'true');

    // Ensure SVG has proper viewBox for scaling
    if (!svg.getAttribute('viewBox') && svg.getAttribute('width') && svg.getAttribute('height')) {
      const width = parseFloat(svg.getAttribute('width'));
      const height = parseFloat(svg.getAttribute('height'));
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }

    // Make SVG responsive
    svg.style.width = 'auto';
    svg.style.height = 'auto';
    svg.style.maxWidth = '100%';
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    svg.style.overflow = 'visible';

    // Remove any fixed width/height attributes that might cause issues
    svg.removeAttribute('width');
    svg.removeAttribute('height');

    // Adjust container to fit content
    div.style.width = 'auto';
    div.style.maxWidth = '100%';
    div.style.overflowX = 'auto';
    div.style.margin = '30px auto';
    div.style.boxSizing = 'border-box';

    // Add padding for better visibility
    div.style.padding = '15px';

    // Add border and styling
    div.style.backgroundColor = '#1a1a1a';
    div.style.border = '2px solid #6d105a';
    div.style.borderRadius = '4px';
    div.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';

    // Make diagram clickable
    div.style.cursor = 'pointer';
    div.setAttribute('title', 'Click to view larger');
    div.style.transition = 'all 0.3s ease';

    // Ensure SVG doesn't block pointer events for hover
    svg.style.pointerEvents = 'none';

    // Add hover effect
    div.addEventListener('mouseenter', function () {
      this.style.borderColor = '#ff6b6b';
      this.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
      this.style.transform = 'scale(1.02)';
    });
    div.addEventListener('mouseleave', function () {
      this.style.borderColor = '#6d105a';
      this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
      this.style.transform = 'scale(1)';
    });

    // Ensure all text elements are readable with white text
    const textElements = svg.querySelectorAll('text, .label, .nodeLabel, .edgeLabel, .messageText, .loopText, .noteText, .titleText, .sectionTitle, .taskText, .actor, .classTitle, .stateLabel, .stateLabelText, .pieLabel, .pieTitleText');
    textElements.forEach((text) => {
      text.style.fontFamily = "'DM Mono', monospace";
      text.style.fill = '#ffffff';
      text.style.color = '#ffffff';
    });

    // Style nodes - using original coloring
    const nodes = svg.querySelectorAll('.node rect, .node circle, .node ellipse, .node polygon, .node path');
    nodes.forEach((node) => {
      node.style.fill = 'rgba(255, 255, 255, 0.1)';
      node.style.stroke = '#ffffff';
      node.style.strokeWidth = '2px';
    });

    // Style edges - using original coloring
    const edges = svg.querySelectorAll('.edgePath .path');
    edges.forEach((edge) => {
      edge.style.stroke = '#ffffff';
      edge.style.strokeWidth = '2px';
    });

    // Style edge labels - using original coloring
    const edgeLabels = svg.querySelectorAll('.edgeLabel');
    edgeLabels.forEach((label) => {
      label.style.color = '#ffffff';
      label.style.backgroundColor = 'rgba(109, 16, 90, 0.7)';
      label.style.fontFamily = "'DM Mono', monospace";
    });

    // Style clusters - using original coloring
    const clusters = svg.querySelectorAll('.cluster rect');
    clusters.forEach((cluster) => {
      cluster.style.fill = 'rgba(255, 255, 255, 0.05)';
      cluster.style.stroke = '#ffffff';
      cluster.style.strokeWidth = '2px';
    });

    // No special handling for pie charts in this function
  });
}
