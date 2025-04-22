/**
 * Main JavaScript file for Eris theme
 * Adds interactivity to the Jekyll site
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the site when the DOM is fully loaded
    initSite();
});

/**
 * Initialize site functionality
 */
function initSite() {
    // Add mobile navigation toggle
    setupMobileNav();
    
    // Add smooth scrolling for anchor links
    setupSmoothScrolling();
    
    // Initialize contact form if it exists
    if (document.querySelector('.contact-form')) {
        setupContactForm();
    }
    
    // Add animation to social icons
    animateSocialIcons();
    
    // Add active class to current navigation item
    highlightCurrentPage();
    
    // Setup dropdown menus
    setupDropdownMenus();
}

/**
 * Setup dropdown menus
 */
function setupDropdownMenus() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        // Add hover event listeners for desktop
        dropdown.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) {
                this.querySelector('.dropdown-menu').style.display = 'flex';
            }
        });
        
        dropdown.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) {
                this.querySelector('.dropdown-menu').style.display = 'none';
            }
        });
        
        // Add click event for mobile
        const dropdownToggle = dropdown.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('click', function(e) {
                // Only prevent default on mobile
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    e.stopPropagation(); // Stop event from bubbling up
                    
                    // Close all other dropdowns first
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        if (menu !== this.nextElementSibling) {
                            menu.style.display = 'none';
                        }
                    });
                    
                    const menu = this.nextElementSibling;
                    if (menu.style.display === 'flex') {
                        menu.style.display = 'none';
                    } else {
                        menu.style.display = 'flex';
                    }
                }
            });
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            // Check if the click was outside any dropdown
            if (!e.target.closest('.dropdown')) {
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.style.display = 'none';
                });
            }
        }
    });
}

/**
 * Setup mobile navigation toggle
 */
function setupMobileNav() {
    const header = document.querySelector('header');
    
    // Create mobile nav toggle button (hidden by default, shown in CSS for small screens)
    const mobileNavToggle = document.createElement('button');
    mobileNavToggle.className = 'mobile-nav-toggle';
    mobileNavToggle.setAttribute('aria-label', 'Toggle navigation menu');
    mobileNavToggle.innerHTML = '<i class="fas fa-bars"></i>';
    
    // Insert the button into the header
    if (header && header.querySelector('.header-content')) {
        header.querySelector('.header-content').appendChild(mobileNavToggle);
        
        // Add event listener
        mobileNavToggle.addEventListener('click', function() {
            document.body.classList.toggle('nav-open');
            
            // Change icon based on state
            const icon = this.querySelector('i');
            if (document.body.classList.contains('nav-open')) {
                icon.className = 'fas fa-times';
            } else {
                icon.className = 'fas fa-bars';
            }
        });
    }
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Only process if the href is not just "#"
            if (targetId !== '#') {
                e.preventDefault();
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

/**
 * Setup contact form submission
 */
function setupContactForm() {
    const form = document.querySelector('.contact-form');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real implementation, this would send the form data to a server
            // For this demo, we'll just show a success message
            
            // Get form data
            const name = form.querySelector('#name').value;
            const email = form.querySelector('#email').value;
            const subject = form.querySelector('#subject').value;
            const message = form.querySelector('#message').value;
            
            // Validate form data (simple validation)
            if (!name || !email || !subject || !message) {
                alert('Please fill in all fields');
                return;
            }
            
            // Show success message
            const formContainer = form.parentElement;
            form.style.display = 'none';
            
            const successMessage = document.createElement('div');
            successMessage.className = 'form-success';
            successMessage.innerHTML = `
                <h3>Message Sent!</h3>
                <p>Thank you for reaching out, ${name}. I'll get back to you as soon as possible.</p>
                <button class="form-button" id="send-another">Send Another Message</button>
            `;
            
            formContainer.appendChild(successMessage);
            
            // Add event listener to "Send Another Message" button
            document.getElementById('send-another').addEventListener('click', function() {
                form.reset();
                successMessage.remove();
                form.style.display = 'block';
            });
        });
    }
}

/**
 * Add animation to social icons
 */
function animateSocialIcons() {
    const socialIcons = document.querySelectorAll('.social-icons a');
    
    socialIcons.forEach((icon, index) => {
        // Add a slight delay to each icon for a staggered effect
        icon.style.animationDelay = `${index * 0.1}s`;
        icon.classList.add('animated');
    });
}

/**
 * Highlight current page in navigation
 */
function highlightCurrentPage() {
    // Get current page filename
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Find the matching navigation link and add active class
    document.querySelectorAll('nav ul li a').forEach(link => {
        const linkHref = link.getAttribute('href');
        
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });
}
