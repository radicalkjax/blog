/**
 * Table of Contents functionality for blog posts
 * Creates a floating TOC that highlights the current section
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('TOC script loaded');
  
  // Only initialize TOC if we're on a blog post page with headings
  const postContent = document.querySelector('.post-content');
  if (!postContent) {
    console.log('No .post-content element found');
    return;
  }
  
  const headings = postContent.querySelectorAll('h2, h3, h4');
  console.log('Found ' + headings.length + ' headings');
  
  if (headings.length < 2) {
    console.log('Not enough headings to create TOC');
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
  
  // Add the TOC container to the post container (before the post)
  const postContainer = document.querySelector('.post-container');
  if (postContainer) {
    postContainer.insertBefore(tocContainer, postContainer.firstChild);
    console.log('TOC container added to post container');
  } else {
    console.log('No .post-container element found');
    // Fallback: add to body if post container not found
    document.body.appendChild(tocContainer);
    console.log('TOC container added to body as fallback');
  }
  
  // Process headings and create TOC items
  const sections = [];
  
  headings.forEach(function(heading, index) {
    // Create an ID for the heading if it doesn't have one
    if (!heading.id) {
      heading.id = 'section-' + index + '-' + heading.textContent.toLowerCase().replace(/[^\w]+/g, '-');
      console.log('Created ID for heading: ' + heading.id);
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
      console.log('No current section found');
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
