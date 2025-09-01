/**
 * Lazy Loading Module - Handles lazy loading of images and other resources
 * ES6+ Module with Intersection Observer
 */

export class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: options.rootMargin || '50px',
      threshold: options.threshold || 0.01,
      selector: options.selector || '[data-lazy]',
      loadingClass: options.loadingClass || 'lazy-loading',
      loadedClass: options.loadedClass || 'lazy-loaded',
      errorClass: options.errorClass || 'lazy-error',
    };

    this.observer = null;
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.setupObserver();
      this.observeElements();
    } else {
      // Fallback for browsers without Intersection Observer
      this.loadAllImages();
    }
  }

  setupObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadElement(entry.target);
        }
      });
    }, {
      rootMargin: this.options.rootMargin,
      threshold: this.options.threshold,
    });
  }

  observeElements() {
    const elements = document.querySelectorAll(this.options.selector);

    elements.forEach((element) => {
      // Add loading placeholder
      this.addPlaceholder(element);

      // Start observing
      this.observer.observe(element);
    });
  }

  loadElement(element) {
    const isImage = element.tagName === 'IMG';
    const isVideo = element.tagName === 'VIDEO';
    const isIframe = element.tagName === 'IFRAME';

    if (isImage) {
      this.loadImage(element);
    } else if (isVideo) {
      this.loadVideo(element);
    } else if (isIframe) {
      this.loadIframe(element);
    } else {
      this.loadBackground(element);
    }

    // Stop observing this element
    this.observer.unobserve(element);
  }

  loadImage(img) {
    const { src } = img.dataset;
    const { srcset } = img.dataset;

    if (!src) return;

    // Create a new image to preload
    const tempImg = new Image();

    tempImg.onload = () => {
      img.classList.add(this.options.loadingClass);

      // Set the actual image source
      if (src) img.src = src;
      if (srcset) img.srcset = srcset;

      // Remove data attributes
      delete img.dataset.src;
      delete img.dataset.srcset;

      // Update classes
      img.classList.remove(this.options.loadingClass);
      img.classList.add(this.options.loadedClass);

      // Trigger custom event
      this.triggerEvent(img, 'lazyloaded');
    };

    tempImg.onerror = () => {
      img.classList.add(this.options.errorClass);
      this.triggerEvent(img, 'lazyerror');
    };

    // Start loading
    tempImg.src = src;
  }

  loadVideo(video) {
    const { src } = video.dataset;
    const { poster } = video.dataset;

    if (src) {
      video.src = src;
      delete video.dataset.src;
    }

    if (poster) {
      video.poster = poster;
      delete video.dataset.poster;
    }

    video.load();
    video.classList.add(this.options.loadedClass);
    this.triggerEvent(video, 'lazyloaded');
  }

  loadIframe(iframe) {
    const { src } = iframe.dataset;

    if (src) {
      iframe.src = src;
      delete iframe.dataset.src;
      iframe.classList.add(this.options.loadedClass);
      this.triggerEvent(iframe, 'lazyloaded');
    }
  }

  loadBackground(element) {
    const { bg } = element.dataset;

    if (bg) {
      const tempImg = new Image();

      tempImg.onload = () => {
        element.style.backgroundImage = `url(${bg})`;
        delete element.dataset.bg;
        element.classList.add(this.options.loadedClass);
        this.triggerEvent(element, 'lazyloaded');
      };

      tempImg.onerror = () => {
        element.classList.add(this.options.errorClass);
        this.triggerEvent(element, 'lazyerror');
      };

      tempImg.src = bg;
    }
  }

  addPlaceholder(element) {
    if (element.tagName === 'IMG' && !element.src) {
      // Add a low-quality placeholder or loading animation
      element.classList.add('lazy-placeholder');

      // If there's a data-placeholder attribute, use it
      const { placeholder } = element.dataset;
      if (placeholder) {
        element.src = placeholder;
      }
    }
  }

  triggerEvent(element, eventName) {
    const event = new CustomEvent(eventName, {
      detail: { element },
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(event);
  }

  // Fallback for browsers without Intersection Observer
  loadAllImages() {
    const elements = document.querySelectorAll(this.options.selector);

    elements.forEach((element) => {
      this.loadElement(element);
    });
  }

  // Public method to add new elements to observe
  observe(element) {
    if (this.observer && element) {
      this.addPlaceholder(element);
      this.observer.observe(element);
    }
  }

  // Public method to disconnect observer
  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

export default LazyLoader;
