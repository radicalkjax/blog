/**
 * Print button for the Print to PDF feature.
 * Holds the print preparation logic plus the floating button creation and click/print handlers.
 */

/**
 * Prepare the document for printing, ensuring images are loaded before triggering print.
 */
export function preparePrint() {
  // Ensure all images are loaded
  const images = document.querySelectorAll('img');
  const imagePromises = Array.from(images).map((img) => new Promise((resolve, _reject) => {
    if (img.complete) {
      resolve();
    } else {
      img.onload = resolve;
      img.onerror = resolve; // Resolve even on error to not block printing
    }
  }));

  // Wait for all images and then print
  Promise.all(imagePromises).then(() => {
    // Give a small delay for any final rendering
    setTimeout(() => {
      window.print();
    }, 500);
  });
}

/**
 * Create the floating print button container and attach it to the document body.
 */
export function createPrintContainer() {
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
  printButton.onmouseover = function () {
    this.style.backgroundColor = '#ff6b6b';
    this.style.transform = 'scale(1.05)';
  };
  printButton.onmouseout = function () {
    this.style.backgroundColor = '#6d105a';
    this.style.transform = 'scale(1)';
  };

  // Add click handler
  printButton.addEventListener('click', () => {
    preparePrint();
  });

  // Assemble the container
  printContainer.appendChild(printButton);

  // Insert in the body to ensure it's independent
  document.body.appendChild(printContainer);
}
