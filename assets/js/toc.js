/**
 * Table of Contents functionality for blog posts
 * Creates a floating TOC that highlights the current section
 */

document.addEventListener('DOMContentLoaded', function() {
  
  // Only initialize TOC if we're on a blog post page with headings
  const postContent = document.querySelector('.post-content');
  if (!postContent) {
    return;
  }
  
  const headings = postContent.querySelectorAll('h2, h3, h4');
  
  if (headings.length < 2) {
    return; // Only show TOC if there are at least 2 headings
  }
  
  // Create the TOC container
  const tocContainer = document.createElement('div');
  tocContainer.id = 'floating-toc';
  
  // Create the TOC header
  const tocHeader = document.createElement('div');
  tocHeader.id = 'toc-header';
  tocHeader.textContent = 'Document Navigation';
  tocContainer.appendChild(tocHeader);
  
  // Create the TOC content (scrollable area)
  const tocContent = document.createElement('div');
  tocContent.id = 'toc-content';
  // Adjust the max-height to make room for key terms
  tocContent.style.maxHeight = 'calc(40vh - 45px)';
  tocContainer.appendChild(tocContent);
  
  // Create mobile toggle button
  const mobileToggle = document.createElement('button');
  mobileToggle.className = 'mobile-toc-toggle';
  mobileToggle.innerHTML = '☰';
  mobileToggle.setAttribute('aria-label', 'Toggle navigation');
  
  // Add the TOC container to the body (not inside post container)
  document.body.appendChild(tocContainer);
  document.body.appendChild(mobileToggle);
  
  // Mobile toggle functionality
  mobileToggle.addEventListener('click', function() {
    tocContainer.classList.toggle('mobile-open');
    document.body.classList.toggle('mobile-toc-open');
    mobileToggle.innerHTML = tocContainer.classList.contains('mobile-open') ? '×' : '☰';
  });
  
  // Close mobile TOC when clicking the header close button
  tocHeader.addEventListener('click', function(e) {
    if (window.innerWidth <= 992 && (e.target === tocHeader || e.offsetX > tocHeader.offsetWidth - 50)) {
      tocContainer.classList.remove('mobile-open');
      document.body.classList.remove('mobile-toc-open');
      mobileToggle.innerHTML = '☰';
    }
  });
  
  // Close mobile TOC when clicking outside
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 992 && 
        tocContainer.classList.contains('mobile-open') && 
        !tocContainer.contains(e.target) && 
        e.target !== mobileToggle) {
      tocContainer.classList.remove('mobile-open');
      document.body.classList.remove('mobile-toc-open');
      mobileToggle.innerHTML = '☰';
    }
  });
  
  // Process headings and create TOC items
  const sections = [];
  
  headings.forEach(function(heading, index) {
    // Create an ID for the heading if it doesn't have one
    if (!heading.id) {
      heading.id = 'section-' + index + '-' + heading.textContent.toLowerCase().replace(/[^\w]+/g, '-');
    }
    
    const level = heading.tagName.toLowerCase();
    const link = document.createElement('a');
    link.href = '#' + heading.id;
    link.textContent = heading.textContent;
    link.classList.add('toc-' + level);
    
    link.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
    
    tocContent.appendChild(link);
    
    // Store section info for scroll tracking
    sections.push({
      id: heading.id,
      element: link,
      position: heading.offsetTop
    });
  });
  
  // Highlight active section on scroll
  function highlightActiveSection() {
    const scrollPosition = window.scrollY + 100; // Offset for better UX
    
    // Find the current section
    let currentSection = sections[0];
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].position <= scrollPosition) {
        currentSection = sections[i];
      } else {
        break;
      }
    }
    
    if (!currentSection) {
      return;
    }
    
    // Remove active class from all links
    document.querySelectorAll('#toc-content a').forEach(function(link) {
      link.classList.remove('active');
    });
    
    // Add active class to current section
    if (currentSection) {
      currentSection.element.classList.add('active');
      
      // Scroll the TOC content (not the container) to keep the active link visible
      const tocContent = document.getElementById('toc-content');
      const activeLink = currentSection.element;
      const tocHeaderHeight = document.getElementById('toc-header').offsetHeight;
      const tocContentRect = tocContent.getBoundingClientRect();
      const activeLinkRect = activeLink.getBoundingClientRect();
      
      // Account for the header when determining if the active link is visible
      if (activeLinkRect.top < tocContentRect.top + tocHeaderHeight || 
          activeLinkRect.bottom > tocContentRect.bottom) {
        // Scroll within the content area, not the whole container
        activeLink.scrollIntoView({
          block: 'center',
          behavior: 'smooth'
        });
      }
    }
  }
  
  // Initial highlight
  highlightActiveSection();
  
  // Update on scroll
  window.addEventListener('scroll', highlightActiveSection);
});
