function toggleCollapsible(element) {
    element.classList.toggle('active');
    var content = element.nextElementSibling;
    content.classList.toggle('show');
}

function toggleMedia(element) {
    element.classList.toggle('expanded');
    element.classList.toggle('collapsed');
}

// Language colors for GitHub repos
const languageColors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C++': '#f34b7d',
    'C': '#555555',
    'C#': '#178600',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Shell': '#89e051',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'Vue': '#4fc08d',
    'React': '#61dafb',
    'PHP': '#4F5D95',
    'Dart': '#00B4AB'
};

// Fetch GitHub repositories
async function loadGitHubRepos() {
    const username = 'radicalkjax';
    const reposContainer = document.getElementById('github-repos-grid');
    const loadingDiv = document.getElementById('github-repos-loading');
    const containerDiv = document.getElementById('github-repos-container');
    const errorDiv = document.getElementById('github-repos-error');

    try {
        // Fetch user's own repos
        const userReposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);

        if (!userReposResponse.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const userRepos = await userReposResponse.json();

        // Fetch organization repos
        const orgReposResponse = await fetch(`https://api.github.com/orgs/goldenapplestudios/repos?sort=updated&per_page=100`);
        let orgRepos = [];

        if (orgReposResponse.ok) {
            orgRepos = await orgReposResponse.json();
        }

        // Combine all repos
        const allRepos = [...userRepos, ...orgRepos];

        // Filter out forked repos and sort by stars then by updated date
        const ownRepos = allRepos
            .filter(repo => !repo.fork)
            .sort((a, b) => {
                // First sort by stars
                if (b.stargazers_count !== a.stargazers_count) {
                    return b.stargazers_count - a.stargazers_count;
                }
                // Then by updated date
                return new Date(b.updated_at) - new Date(a.updated_at);
            });

        // Clear loading and show container
        loadingDiv.classList.add('is-hidden');
        containerDiv.classList.remove('is-hidden');

        // Create repo cards
        ownRepos.forEach(repo => {
            const repoCard = document.createElement('div');
            repoCard.className = 'repo-card';

            const languageHtml = repo.language ? `
                <div class="repo-language">
                    <span class="language-dot" style="background-color: ${languageColors[repo.language] || '#888'}"></span>
                    <span>${repo.language}</span>
                </div>
            ` : '';

            const description = repo.description || 'No description provided';

            // Add organization badge if it's from an org
            const orgBadge = repo.owner.type === 'Organization' ?
                `<span style="font-size: 0.8rem; opacity: 0.7; margin-left: 10px;">(${repo.owner.login})</span>` : '';

            repoCard.innerHTML = `
                <div class="repo-name">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>${orgBadge}
                </div>
                ${languageHtml}
                <div class="repo-description">${description}</div>
                <div class="repo-stats">
                    <span class="repo-stat">
                        <span>⭐</span>
                        <span>${repo.stargazers_count}</span>
                    </span>
                    <span class="repo-stat">
                        <span>🍴</span>
                        <span>${repo.forks_count}</span>
                    </span>
                    ${repo.open_issues_count > 0 ? `
                        <span class="repo-stat">
                            <span>📝</span>
                            <span>${repo.open_issues_count}</span>
                        </span>
                    ` : ''}
                </div>
            `;

            reposContainer.appendChild(repoCard);
        });

        // If no repos found
        if (ownRepos.length === 0) {
            reposContainer.innerHTML = '<p class="u-text-center u-dim">No public repositories found.</p>';
        }

    } catch (error) {
        loadingDiv.classList.add('is-hidden');
        errorDiv.classList.remove('is-hidden');
    }
}

// Removed automatic loading - repos now load when section is expanded

// Bind collapsible and media toggles (replaces inline on* handlers)
document.addEventListener('DOMContentLoaded', function() {
    // Collapsible section headers
    document.querySelectorAll('.collapsible-header').forEach(function(header) {
        header.addEventListener('click', function() {
            toggleCollapsible(this);
            // Lazy-load GitHub repos for the designated collapsible only
            if (this.dataset.loadsRepos === 'true' && !this.dataset.loaded) {
                loadGitHubRepos();
                this.dataset.loaded = 'true';
            }
        });
    });

    // Expandable media categories
    document.querySelectorAll('.media-category').forEach(function(category) {
        category.addEventListener('click', function() {
            toggleMedia(this);
        });
    });
});

// Document Navigator functionality (based on toc.js pattern)
document.addEventListener('DOMContentLoaded', function() {
    // Get all sections with IDs
    const aboutContainer = document.querySelector('.about-container');
    if (!aboutContainer) {
        return;
    }

    const sections = aboutContainer.querySelectorAll('section[id]');

    if (sections.length < 2) {
        return; // Only show Navigator if there are at least 2 sections
    }

    // Create the TOC container
    const tocContainer = document.createElement('div');
    tocContainer.id = 'floating-toc';

    // Create the TOC header
    const tocHeader = document.createElement('div');
    tocHeader.id = 'toc-header';
    tocHeader.textContent = 'Navigator';
    tocContainer.appendChild(tocHeader);

    // Create the TOC content (scrollable area)
    const tocContent = document.createElement('div');
    tocContent.id = 'toc-content';
    tocContainer.appendChild(tocContent);

    // Create mobile toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-toc-toggle';
    mobileToggle.innerHTML = '☰';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation');

    // Add the TOC container to the body
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

    // Process sections and create TOC items
    const navSections = [];

    sections.forEach(function(section, index) {
        // Get the section title
        let sectionTitle = '';
        const sectionId = section.id;

        // Special case for intro section
        if (sectionId === 'intro') {
            sectionTitle = 'Summary';
        } else {
            // Find the title element in the section
            const titleElement = section.querySelector('.section-title, .about-title, h2, h1');
            if (titleElement) {
                sectionTitle = titleElement.textContent.trim();
            } else {
                // Use a default title based on the ID
                sectionTitle = sectionId.charAt(0).toUpperCase() + sectionId.slice(1);
            }
        }

        const link = document.createElement('a');
        link.href = '#' + sectionId;
        link.textContent = sectionTitle;

        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Close mobile nav after clicking
                if (window.innerWidth <= 992) {
                    tocContainer.classList.remove('mobile-open');
                    document.body.classList.remove('mobile-toc-open');
                    mobileToggle.innerHTML = '☰';
                }
            }
        });

        tocContent.appendChild(link);

        // Store section info for scroll tracking
        navSections.push({
            id: sectionId,
            element: link,
            position: section.offsetTop
        });
    });

    // Highlight active section on scroll
    function highlightActiveSection() {
        const scrollPosition = window.scrollY + 100; // Offset for better UX

        // Update positions (they might change on resize)
        navSections.forEach(function(navSection) {
            const element = document.getElementById(navSection.id);
            if (element) {
                navSection.position = element.offsetTop;
            }
        });

        // Find the current section
        let currentSection = navSections[0];
        for (let i = 0; i < navSections.length; i++) {
            if (navSections[i].position <= scrollPosition) {
                currentSection = navSections[i];
            } else {
                break;
            }
        }

        // Remove active class from all links
        document.querySelectorAll('#toc-content a').forEach(function(link) {
            link.classList.remove('active');
        });

        // Add active class to current section
        if (currentSection) {
            currentSection.element.classList.add('active');

            // Scroll the TOC content to keep the active link visible
            const tocContent = document.getElementById('toc-content');
            const activeLink = currentSection.element;
            const tocContentRect = tocContent.getBoundingClientRect();
            const activeLinkRect = activeLink.getBoundingClientRect();

            if (activeLinkRect.top < tocContentRect.top ||
                activeLinkRect.bottom > tocContentRect.bottom) {
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

    // Update on resize (positions might change)
    window.addEventListener('resize', highlightActiveSection);
});
