/**
 * Navigation Module - Handles all navigation functionality
 * ES6+ Module
 */

export class Navigation {
  constructor() {
    this.mobileBreakpoint = 768;
    this.navOpen = false;
    this.dropdowns = [];
    this.init();
  }

  init() {
    this.setupMobileNav();
    this.setupDropdowns();
    this.highlightCurrentPage();
    this.setupSmoothScrolling();
  }

  setupMobileNav() {
    const header = document.querySelector('header');
    if (!header) return;

    const headerContent = header.querySelector('.header-content');
    if (!headerContent) return;

    // Create mobile nav toggle button
    const toggle = document.createElement('button');
    toggle.className = 'mobile-nav-toggle';
    toggle.setAttribute('aria-label', 'Toggle navigation menu');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    headerContent.appendChild(toggle);
    
    toggle.addEventListener('click', () => this.toggleMobileNav(toggle));
  }

  toggleMobileNav(button) {
    this.navOpen = !this.navOpen;
    document.body.classList.toggle('nav-open', this.navOpen);
    button.setAttribute('aria-expanded', this.navOpen.toString());
    
    const icon = button.querySelector('i');
    icon.className = this.navOpen ? 'fas fa-times' : 'fas fa-bars';
  }

  setupDropdowns() {
    this.dropdowns = Array.from(document.querySelectorAll('.dropdown'));
    
    this.dropdowns.forEach(dropdown => {
      const toggle = dropdown.querySelector('.dropdown-toggle');
      const menu = dropdown.querySelector('.dropdown-menu');
      
      if (!toggle || !menu) return;
      
      // Desktop hover events
      dropdown.addEventListener('mouseenter', () => {
        if (window.innerWidth > this.mobileBreakpoint) {
          this.showDropdown(menu);
        }
      });
      
      dropdown.addEventListener('mouseleave', () => {
        if (window.innerWidth > this.mobileBreakpoint) {
          this.hideDropdown(menu);
        }
      });
      
      // Mobile click events
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= this.mobileBreakpoint) {
          e.preventDefault();
          this.toggleDropdown(menu);
        }
      });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        this.closeAllDropdowns();
      }
    });
  }

  showDropdown(menu) {
    menu.classList.add('show');
  }

  hideDropdown(menu) {
    menu.classList.remove('show');
  }

  toggleDropdown(menu) {
    const isOpen = menu.classList.contains('show');
    this.closeAllDropdowns();
    
    if (!isOpen) {
      this.showDropdown(menu);
    }
  }

  closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      this.hideDropdown(menu);
    });
  }

  highlightCurrentPage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;
      
      if (linkPath === currentPath || 
          (currentPath === '/' && linkPath.endsWith('/index.html'))) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  setupSmoothScrolling() {
    const anchors = document.querySelectorAll('a[href^="#"]:not([href="#"])');
    
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        
        if (target) {
          e.preventDefault();
          
          const offset = 80; // Account for fixed header
          const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update URL without triggering scroll
          history.pushState(null, null, targetId);
        }
      });
    });
  }
}

export default Navigation;