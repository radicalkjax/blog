// Custom JavaScript to style MathJax elements after they are rendered

document.addEventListener('DOMContentLoaded', () => {
  // Function to apply styling to MathJax elements
  function styleMathJax() {
    // Style block equations
    document.querySelectorAll('mjx-container[display="true"]').forEach((container) => {
      container.style.backgroundColor = '#1a1a1a';
      container.style.border = '2px solid #6d105a';
      container.style.borderRadius = '4px';
      container.style.padding = '15px';
      container.style.margin = '20px auto';
      container.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
      container.style.maxWidth = '90%';
      container.style.overflowX = 'auto';
      container.style.display = 'block';

      // Style the math content
      const mathElement = container.querySelector('mjx-math');
      if (mathElement) {
        mathElement.style.color = '#ffffff';
        mathElement.style.fontSize = '1.1em';
      }
    });

    // Style inline equations
    document.querySelectorAll('mjx-container:not([display="true"])').forEach((container) => {
      const mathElement = container.querySelector('mjx-math');
      if (mathElement) {
        mathElement.style.backgroundColor = '#1a1a1a';
        mathElement.style.border = '1px solid #6d105a';
        mathElement.style.borderRadius = '3px';
        mathElement.style.padding = '2px 5px';
        mathElement.style.margin = '0 2px';
        mathElement.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.2)';
        mathElement.style.display = 'inline-block';
        mathElement.style.color = '#ffffff';
      }
    });
  }

  // Apply styling when MathJax is done rendering
  if (typeof MathJax !== 'undefined') {
    MathJax.Hub.Register.StartupHook('End', styleMathJax);
  } else {
    // If MathJax is not loaded yet, wait a bit and try again
    setTimeout(styleMathJax, 1000);
    // Also try again after 2 seconds to be sure
    setTimeout(styleMathJax, 2000);
  }
});
