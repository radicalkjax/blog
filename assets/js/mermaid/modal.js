/**
 * Mermaid fullscreen modal: creation, zoom controls, click handlers, and SVG sizing.
 */

// Function to create and show modal for mermaid diagrams
export function createMermaidModal() {
  // Check if modal already exists
  if (document.getElementById('mermaid-modal')) return;

  // Create modal overlay
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'mermaid-modal';
  modalOverlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        cursor: pointer;
        padding: 20px;
        box-sizing: border-box;
    `;

  // Create modal content container
  const modalContent = document.createElement('div');
  modalContent.id = 'mermaid-modal-content';
  modalContent.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
    `;

  // Create close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '×';
  closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 20px;
        font-size: 40px;
        font-weight: bold;
        color: #ffffff;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 10001;
        line-height: 1;
        padding: 0;
        width: 40px;
        height: 40px;
    `;
  closeButton.onmouseover = function () { this.style.color = '#ff6b6b'; };
  closeButton.onmouseout = function () { this.style.color = '#ffffff'; };

  // Create zoom controls
  const zoomControls = document.createElement('div');
  zoomControls.id = 'mermaid-zoom-controls';
  zoomControls.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 10001;
    `;

  const zoomInBtn = document.createElement('button');
  zoomInBtn.innerHTML = '+';
  zoomInBtn.style.cssText = `
        width: 40px;
        height: 40px;
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        background-color: #6d105a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;

  const zoomOutBtn = document.createElement('button');
  zoomOutBtn.innerHTML = '−';
  zoomOutBtn.style.cssText = `
        width: 40px;
        height: 40px;
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        background-color: #6d105a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;

  const zoomResetBtn = document.createElement('button');
  zoomResetBtn.innerHTML = '⟲';
  zoomResetBtn.style.cssText = `
        width: 40px;
        height: 40px;
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
        background-color: #6d105a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;

  // Add hover effects to zoom buttons
  [zoomInBtn, zoomOutBtn, zoomResetBtn].forEach((btn) => {
    btn.onmouseover = function () {
      this.style.backgroundColor = '#ff6b6b';
    };
    btn.onmouseout = function () {
      this.style.backgroundColor = '#6d105a';
    };
  });

  zoomControls.appendChild(zoomOutBtn);
  zoomControls.appendChild(zoomResetBtn);
  zoomControls.appendChild(zoomInBtn);

  // Create diagram container
  const diagramContainer = document.createElement('div');
  diagramContainer.id = 'mermaid-modal-diagram';
  diagramContainer.style.cssText = `
        width: 95vw;
        height: 90vh;
        overflow: auto;
        background-color: #1a1a1a;
        border: 2px solid #6d105a;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    `;

  // Assemble modal
  modalContent.appendChild(closeButton);
  modalContent.appendChild(zoomControls);
  modalContent.appendChild(diagramContainer);
  modalOverlay.appendChild(modalContent);
  document.body.appendChild(modalOverlay);

  // Store zoom level
  let currentZoom = 1;

  // Zoom functions
  function applyZoom(zoom) {
    const svg = diagramContainer.querySelector('svg');
    if (svg) {
      svg.style.transform = `scale(${zoom})`;
      svg.style.transformOrigin = 'center';
    }
  }

  // Zoom controls functionality
  zoomInBtn.onclick = function (e) {
    e.stopPropagation();
    currentZoom = Math.min(currentZoom + 0.2, 3);
    applyZoom(currentZoom);
  };

  zoomOutBtn.onclick = function (e) {
    e.stopPropagation();
    currentZoom = Math.max(currentZoom - 0.2, 0.5);
    applyZoom(currentZoom);
  };

  zoomResetBtn.onclick = function (e) {
    e.stopPropagation();
    currentZoom = 1;
    applyZoom(currentZoom);
  };

  // Store functions on modal for access during display
  modalOverlay.setZoom = function (zoom) {
    currentZoom = zoom;
    applyZoom(currentZoom);
  };

  // Close modal on overlay click
  modalOverlay.onclick = function (e) {
    if (e.target === modalOverlay || e.target === modalContent) {
      modalOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  };

  // Close modal on close button click
  closeButton.onclick = function (e) {
    e.stopPropagation();
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
  };

  // Close modal on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.style.display === 'block') {
      modalOverlay.style.display = 'none';
      document.body.style.overflow = '';
    }
  });
}

// Function to handle mermaid diagram and SVG image clicks
export function setupMermaidClickHandlers() {
  document.addEventListener('click', (e) => {
    // Check if clicked element is within a mermaid diagram OR an SVG image
    const mermaidDiv = e.target.closest('.mermaid');
    const svgImage = e.target.closest('img[src$=".svg"]');

    if (!mermaidDiv && !svgImage) return;
    if (mermaidDiv && !mermaidDiv.hasAttribute('data-processed')) return;

    // Prevent default behavior
    e.preventDefault();
    e.stopPropagation();

    if (mermaidDiv) {
      // Handle mermaid diagram
      const svg = mermaidDiv.querySelector('svg');
      if (!svg) return;
    } else if (svgImage) {
      // Handle SVG image
      // SVG image handling
    }

    // Show modal
    const modal = document.getElementById('mermaid-modal');
    const diagramContainer = document.getElementById('mermaid-modal-diagram');

    // Clear previous content
    diagramContainer.innerHTML = '';

    if (mermaidDiv) {
      // Clone the entire mermaid div to preserve all styling
      const mermaidClone = mermaidDiv.cloneNode(true);
      const svgClone = mermaidClone.querySelector('svg');

      // Add cloned mermaid div to modal
      diagramContainer.appendChild(mermaidClone);

      // Remove click functionality from clone
      mermaidClone.style.cursor = 'default';
      mermaidClone.removeAttribute('title');
      mermaidClone.removeAttribute('data-processed');
      mermaidClone.style.transform = 'none';
      mermaidClone.style.border = 'none';
      mermaidClone.style.boxShadow = 'none';
      mermaidClone.style.backgroundColor = 'transparent';
      mermaidClone.style.padding = '0';

      // Style the SVG for larger view
      handleSVGSizing(svgClone);
    } else if (svgImage) {
      // Clone the SVG image
      const imgClone = svgImage.cloneNode(true);

      // Remove any inline styles that might constrain size
      imgClone.style.maxWidth = 'none';
      imgClone.style.border = 'none';
      imgClone.style.boxShadow = 'none';
      imgClone.style.backgroundColor = 'transparent';
      imgClone.style.padding = '0';

      // Add to modal
      diagramContainer.appendChild(imgClone);

      // Style the SVG image for larger view
      handleSVGImageSizing(imgClone);
    }

    // Show modal
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Reset zoom
    if (modal.setZoom) {
      modal.setZoom(1);
    }
  });
}

// Helper function to handle SVG sizing
export function handleSVGSizing(svgElement) {
  if (svgElement) {
    // Get original dimensions
    const viewBox = svgElement.getAttribute('viewBox');
    if (viewBox) {
      const [, , width, height] = viewBox.split(' ').map(Number);
      const aspectRatio = width / height;

      // Calculate optimal size based on viewport
      const maxWidth = window.innerWidth * 0.9;
      const maxHeight = window.innerHeight * 0.85;

      let newWidth; let
        newHeight;
      if (maxWidth / maxHeight > aspectRatio) {
        // Height is the limiting factor
        newHeight = maxHeight;
        newWidth = newHeight * aspectRatio;
      } else {
        // Width is the limiting factor
        newWidth = maxWidth;
        newHeight = newWidth / aspectRatio;
      }

      // Apply dimensions with minimum sizes
      svgElement.style.width = `${Math.max(newWidth, 1200)}px`;
      svgElement.style.height = `${Math.max(newHeight, 600)}px`;
    } else {
      // Fallback for SVGs without viewBox
      svgElement.style.width = '100%';
      svgElement.style.height = '100%';
      svgElement.style.minWidth = '1200px';
      svgElement.style.minHeight = '600px';
    }

    svgElement.style.maxWidth = 'none';
    svgElement.style.maxHeight = 'none';
    svgElement.style.pointerEvents = 'auto';
  }
}

// Helper function to handle SVG image sizing
export function handleSVGImageSizing(imgElement) {
  if (imgElement) {
    // Calculate optimal size based on viewport
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.85;

    // For images, we'll set max dimensions and let the browser maintain aspect ratio
    imgElement.style.width = 'auto';
    imgElement.style.height = 'auto';
    imgElement.style.maxWidth = `${maxWidth}px`;
    imgElement.style.maxHeight = `${maxHeight}px`;
    imgElement.style.minWidth = '800px';
    imgElement.style.display = 'block';
    imgElement.style.margin = '0 auto';
  }
}
