/**
 * MathJax v3 configuration.
 * Must load before the MathJax library so the global is defined at startup.
 * Applies the site's dark-purple styling to rendered equations.
 */
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscapes: true,
  },
  svg: {
    fontCache: 'global',
  },
  options: {
    skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
    ignoreHtmlClass: 'tex2jax_ignore',
    processHtmlClass: 'tex2jax_process',
  },
  startup: {
    ready() {
      window.MathJax.startup.defaultReady();

      window.MathJax.startup.promise.then(function () {
        // Style block equations
        document.querySelectorAll('mjx-container[jax="CHTML"][display="true"]').forEach(function (container) {
          container.style.backgroundColor = '#1a1a1a';
          container.style.border = '2px solid #6d105a';
          container.style.borderRadius = '4px';
          container.style.padding = '15px';
          container.style.margin = '20px auto';
          container.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
          container.style.maxWidth = '90%';
          container.style.overflowX = 'auto';
          container.style.display = 'block';

          const mathElement = container.querySelector('mjx-math');
          if (mathElement) {
            mathElement.style.color = '#ffffff';
            mathElement.style.fontSize = '1.1em';
          }
        });

        // Style inline equations - color only
        document.querySelectorAll('mjx-container:not([display="true"])').forEach(function (container) {
          container.style.color = '#ffffff';
          const mathElement = container.querySelector('mjx-math');
          if (mathElement) {
            mathElement.style.color = '#ffffff';
          }
        });
      });
    },
  },
};
