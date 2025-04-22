/**
 * Social media links for Eris theme
 * This script provides a central place to manage all social media links
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get social media links from site config
    const socialLinks = {
        bluesky: document.querySelector('meta[name="social:bluesky"]')?.getAttribute('content'),
        linkedin: document.querySelector('meta[name="social:linkedin"]')?.getAttribute('content'),
        instagram: document.querySelector('meta[name="social:instagram"]')?.getAttribute('content'),
        github: document.querySelector('meta[name="social:github"]')?.getAttribute('content')
    };

    // Update header social icons
    const headerIcons = document.querySelectorAll('.social-icons a');
    headerIcons.forEach(function(link) {
        const label = link.getAttribute('aria-label');
        if (label) {
            const labelLower = label.toLowerCase();
            if (labelLower === 'bluesky' && socialLinks.bluesky) {
                link.href = socialLinks.bluesky;
            } else if (labelLower === 'linkedin' && socialLinks.linkedin) {
                link.href = socialLinks.linkedin;
            } else if (labelLower === 'instagram' && socialLinks.instagram) {
                link.href = socialLinks.instagram;
            } else if (labelLower === 'github' && socialLinks.github) {
                link.href = socialLinks.github;
            }
        }
    });

    // Update connections page social items
    const socialItems = document.querySelectorAll('.social-item');
    socialItems.forEach(function(link) {
        const socialNameElement = link.querySelector('.social-name');
        if (socialNameElement) {
            const name = socialNameElement.textContent;
            if (name) {
                const nameLower = name.toLowerCase();
                if (nameLower === 'bluesky' && socialLinks.bluesky) {
                    link.href = socialLinks.bluesky;
                } else if (nameLower === 'linkedin' && socialLinks.linkedin) {
                    link.href = socialLinks.linkedin;
                } else if (nameLower === 'instagram' && socialLinks.instagram) {
                    link.href = socialLinks.instagram;
                } else if (nameLower === 'github' && socialLinks.github) {
                    link.href = socialLinks.github;
                }
            }
        }
    });
});
