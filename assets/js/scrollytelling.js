/**
 * Scrollytelling Sidebar System
 * Interactive reading guide for long-form content
 * For radicalkjax.com trans-journey page
 */

class ScrollytellingSidebar {
  constructor() {
    this.sidebar = document.getElementById('scrolly-sidebar');
    this.currentSectionTitle = document.getElementById('current-section-title');
    this.relatedPostsList = document.querySelector('.related-posts-list');
    this.sectionNavList = document.getElementById('section-nav-list');
    this.progressBar = document.querySelector('.scrolly-progress-bar');
    this.progressText = document.querySelector('.scrolly-progress-text');
    this.mobileToggle = document.querySelector('.scrolly-mobile-toggle');
    this.collapseBtn = document.querySelector('.scrolly-collapse-btn');
    this.contentArea = document.querySelector('.scrolly-content-area');

    this.sections = [];
    this.blogPosts = [];
    this.sectionElements = [];
    this.currentSection = null;
    this.visitedSections = new Set();
    this.observer = null;

    // Check if we have CSS scroll-driven animation support
    this.hasScrollTimeline = CSS.supports('animation-timeline', 'scroll()');

    this.init();
  }

  async init() {
    try {
      this.loadData();
      this.findSectionMarkers();
      this.renderSectionNav();
      this.setupIntersectionObserver();
      this.setupEventListeners();
      this.setupProgressBar();
      this.checkReturnParam();
    } catch (error) {
      console.error('Scrollytelling initialization failed:', error);
    }
  }

  loadData() {
    // Load sections from embedded JSON
    const sectionsScript = document.getElementById('journey-sections');
    if (sectionsScript) {
      this.sections = JSON.parse(sectionsScript.textContent);
    }

    // Load blog posts from embedded JSON
    const postsScript = document.getElementById('blog-posts-data');
    if (postsScript) {
      const postsData = JSON.parse(postsScript.textContent);
      this.blogPosts = postsData.posts || [];
    }
  }

  findSectionMarkers() {
    if (!this.contentArea || !this.sections.length) return;

    const contentHTML = this.contentArea.innerHTML;
    const contentText = this.contentArea.textContent;

    // Find each section's start position in the content
    this.sections.forEach((section, index) => {
      const marker = section.start_marker;
      if (!marker) return;

      // Find the paragraph or element containing the marker text
      const paragraphs = this.contentArea.querySelectorAll('p');
      let foundElement = null;

      for (const p of paragraphs) {
        if (p.textContent.includes(marker)) {
          foundElement = p;
          break;
        }
      }

      if (foundElement) {
        // Wrap this paragraph and following content in a section marker
        // Create a wrapper div as an invisible anchor
        const sectionAnchor = document.createElement('div');
        sectionAnchor.id = `section-${section.id}`;
        sectionAnchor.className = 'journey-section';
        sectionAnchor.dataset.sectionId = section.id;
        sectionAnchor.dataset.sectionIndex = index;

        // Insert the anchor before the found element
        foundElement.parentNode.insertBefore(sectionAnchor, foundElement);

        this.sectionElements.push({
          section,
          element: sectionAnchor,
          contentElement: foundElement
        });
      }
    });
  }

  renderSectionNav() {
    if (!this.sectionNavList) return;

    this.sectionNavList.innerHTML = this.sections.map((section, index) => {
      const iconClass = this.getIconClass(section.icon);
      return `
        <li class="section-nav-item" data-section-id="${section.id}">
          <a href="#section-${section.id}" class="section-nav-link" data-section-index="${index}">
            ${iconClass ? `<i class="${iconClass} section-nav-icon"></i>` : ''}
            <span>${section.title}</span>
          </a>
        </li>
      `;
    }).join('');
  }

  getIconClass(iconName) {
    if (!iconName) return '';

    const iconMap = {
      'book-open': 'fas fa-book-open',
      'child': 'fas fa-child',
      'tractor': 'fas fa-tractor',
      'lightbulb': 'fas fa-lightbulb',
      'house-chimney-crack': 'fas fa-house-chimney-crack',
      'user-secret': 'fas fa-user-secret',
      'graduation-cap': 'fas fa-graduation-cap',
      'door-open': 'fas fa-door-open',
      'pills': 'fas fa-pills',
      'heart-crack': 'fas fa-heart-crack',
      'people-arrows': 'fas fa-people-arrows',
      'clipboard-check': 'fas fa-clipboard-check',
      'hospital': 'fas fa-hospital',
      'rocket': 'fas fa-rocket',
      'heart': 'fas fa-heart',
      'face-smile': 'fas fa-face-smile',
      'star': 'fas fa-star'
    };

    return iconMap[iconName] || `fas fa-${iconName}`;
  }

  setupIntersectionObserver() {
    if (!this.sectionElements.length) return;

    const options = {
      root: null, // viewport
      rootMargin: '-20% 0px -60% 0px', // trigger when section is in upper portion
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.dataset.sectionId;
          this.setActiveSection(sectionId);
        }
      });
    }, options);

    // Observe all section elements
    this.sectionElements.forEach(({ element }) => {
      this.observer.observe(element);
    });
  }

  setActiveSection(sectionId) {
    const section = this.sections.find(s => s.id === sectionId);
    if (!section || this.currentSection === sectionId) return;

    this.currentSection = sectionId;
    this.visitedSections.add(sectionId);

    // Update current section display
    this.updateCurrentSectionDisplay(section);

    // Update related posts
    this.updateRelatedPosts(section);

    // Update navigation
    this.updateSectionNav(sectionId);

    // Update URL hash (without scrolling)
    if (history.replaceState) {
      history.replaceState(null, null, `#section-${sectionId}`);
    }
  }

  updateCurrentSectionDisplay(section) {
    if (!this.currentSectionTitle) return;

    const iconClass = this.getIconClass(section.icon);
    this.currentSectionTitle.innerHTML = `
      ${iconClass ? `<i class="${iconClass} current-section-icon"></i>` : ''}
      ${section.title}
    `;
  }

  updateRelatedPosts(section) {
    if (!this.relatedPostsList) return;

    const relatedPosts = this.findRelatedPosts(section);

    if (relatedPosts.length === 0) {
      this.relatedPostsList.innerHTML = `
        <p class="related-posts-empty">No related posts for this section yet.</p>
      `;
      return;
    }

    this.relatedPostsList.innerHTML = relatedPosts.map(post => {
      // Build return URL with section param
      const returnUrl = encodeURIComponent(`${window.location.pathname}#section-${section.id}`);
      const postUrl = `${post.url}?return=${returnUrl}`;

      return `
        <a href="${postUrl}" class="related-post-card">
          <h5 class="related-post-title">${post.title}</h5>
          <p class="related-post-excerpt">${post.excerpt || ''}</p>
          <div class="related-post-meta">
            <span>${this.formatDate(post.date)}</span>
            <span class="related-post-arrow">→</span>
          </div>
        </a>
      `;
    }).join('');
  }

  findRelatedPosts(section) {
    if (!section.tags || !this.blogPosts.length) {
      return [];
    }

    // Generic tags that shouldn't be used for matching alone
    const genericTags = ['personal', 'blog', 'milestone', 'general'];

    // Get specific tags from section
    const specificSectionTags = section.tags.filter(tag => !genericTags.includes(tag));

    const relatedPosts = this.blogPosts.filter(post => {
      if (!post.tags || !Array.isArray(post.tags)) return false;

      // If section has no specific tags, match any tag
      if (specificSectionTags.length === 0) {
        return section.tags.some(tag => post.tags.includes(tag));
      }

      // Post must have at least one specific tag from the section
      return specificSectionTags.some(sectionTag => {
        // Check for exact match
        if (post.tags.includes(sectionTag)) return true;

        // Check for variations (e.g., "transgender" matches "trans")
        return post.tags.some(postTag =>
          sectionTag.includes(postTag) || postTag.includes(sectionTag)
        );
      });
    });

    // Sort by date (most recent first)
    return relatedPosts.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  updateSectionNav(activeSectionId) {
    if (!this.sectionNavList) return;

    const items = this.sectionNavList.querySelectorAll('.section-nav-item');
    items.forEach(item => {
      const sectionId = item.dataset.sectionId;

      // Remove active class from all
      item.classList.remove('active');

      // Add visited class
      if (this.visitedSections.has(sectionId)) {
        item.classList.add('visited');
      }

      // Set active
      if (sectionId === activeSectionId) {
        item.classList.add('active');
        // Scroll the nav item into view within the sidebar
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }

  setupProgressBar() {
    // If browser supports CSS scroll-driven animations, CSS handles it
    if (this.hasScrollTimeline) {
      // Just update the text
      window.addEventListener('scroll', () => this.updateProgressText(), { passive: true });
    } else {
      // JS fallback for progress bar
      window.addEventListener('scroll', () => {
        this.updateProgressBar();
        this.updateProgressText();
      }, { passive: true });
    }

    // Initial update
    this.updateProgressText();
  }

  updateProgressBar() {
    if (!this.progressBar || this.hasScrollTimeline) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrollTop / docHeight) * 100, 100);

    this.progressBar.style.width = `${progress}%`;
  }

  updateProgressText() {
    if (!this.progressText) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.round((scrollTop / docHeight) * 100), 100);

    this.progressText.textContent = `${progress}% read`;
  }

  setupEventListeners() {
    // Collapse button
    if (this.collapseBtn) {
      this.collapseBtn.addEventListener('click', () => this.toggleCollapse());
    }

    // Mobile toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => this.toggleMobile());
    }

    // Section navigation clicks
    if (this.sectionNavList) {
      this.sectionNavList.addEventListener('click', (e) => {
        const link = e.target.closest('.section-nav-link');
        if (link) {
          e.preventDefault();
          const href = link.getAttribute('href');
          const targetId = href.replace('#', '');
          const target = document.getElementById(targetId);

          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close mobile sidebar
            this.closeMobile();
          }
        }
      });
    }

    // Close mobile sidebar when clicking outside
    document.addEventListener('click', (e) => {
      if (this.sidebar && this.sidebar.classList.contains('mobile-open')) {
        if (!this.sidebar.contains(e.target) && !this.mobileToggle.contains(e.target)) {
          this.closeMobile();
        }
      }
    });

    // Handle hash on page load
    if (window.location.hash.startsWith('#section-')) {
      const sectionId = window.location.hash.replace('#section-', '');
      setTimeout(() => {
        const target = document.getElementById(`section-${sectionId}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      // Escape closes mobile sidebar
      if (e.key === 'Escape' && this.sidebar.classList.contains('mobile-open')) {
        this.closeMobile();
      }
    });
  }

  toggleCollapse() {
    if (!this.sidebar) return;
    this.sidebar.classList.toggle('collapsed');
  }

  toggleMobile() {
    if (!this.sidebar) return;
    this.sidebar.classList.toggle('mobile-open');

    // Toggle backdrop
    let backdrop = document.querySelector('.scrolly-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'scrolly-backdrop';
      document.body.appendChild(backdrop);
      backdrop.addEventListener('click', () => this.closeMobile());
    }
    backdrop.classList.toggle('visible', this.sidebar.classList.contains('mobile-open'));
  }

  closeMobile() {
    if (!this.sidebar) return;
    this.sidebar.classList.remove('mobile-open');

    const backdrop = document.querySelector('.scrolly-backdrop');
    if (backdrop) {
      backdrop.classList.remove('visible');
    }
  }

  checkReturnParam() {
    // Check if user is returning from a blog post
    const urlParams = new URLSearchParams(window.location.search);
    const returnSection = urlParams.get('section');

    if (returnSection) {
      // Scroll to the section they were reading
      setTimeout(() => {
        const target = document.getElementById(`section-${returnSection}`);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);

      // Clean up URL
      const cleanUrl = window.location.pathname + window.location.hash;
      history.replaceState(null, null, cleanUrl);
    }
  }
}

/**
 * Return Banner for Blog Posts
 * Shows a banner to return to the journey page when coming from there
 */
class ReturnToBanner {
  constructor() {
    this.init();
  }

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const returnUrl = urlParams.get('return');

    if (returnUrl) {
      this.createBanner(decodeURIComponent(returnUrl));
    }
  }

  createBanner(returnUrl) {
    const banner = document.createElement('div');
    banner.className = 'return-to-journey';
    banner.innerHTML = `
      <span class="return-to-journey-text">Continue reading "My Trans Journey"</span>
      <div>
        <a href="${returnUrl}" class="return-to-journey-link">
          <i class="fas fa-arrow-left"></i>
          Return to where you left off
        </a>
        <button class="return-to-journey-close" aria-label="Dismiss">×</button>
      </div>
    `;

    document.body.prepend(banner);

    // Show banner with animation
    requestAnimationFrame(() => {
      banner.classList.add('visible');
    });

    // Close button
    banner.querySelector('.return-to-journey-close').addEventListener('click', () => {
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 300);
    });

    // Add padding to body to account for banner
    document.body.style.paddingTop = '60px';
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the journey page (has scrolly-sidebar)
    if (document.getElementById('scrolly-sidebar')) {
      new ScrollytellingSidebar();
    }
    // Check if we should show return banner (any page with return param)
    if (new URLSearchParams(window.location.search).has('return')) {
      new ReturnToBanner();
    }
  });
} else {
  if (document.getElementById('scrolly-sidebar')) {
    new ScrollytellingSidebar();
  }
  if (new URLSearchParams(window.location.search).has('return')) {
    new ReturnToBanner();
  }
}
