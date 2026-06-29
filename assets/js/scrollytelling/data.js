/**
 * Scrollytelling — Data & Helpers
 * Pure data parsing and presentation helpers for the scrollytelling sidebar.
 * Reads the JSON data islands (#journey-sections, #blog-posts-data) and
 * provides stateless helpers for icons, related-post matching, and dates.
 */

/**
 * Parse the embedded sections JSON island (#journey-sections).
 * @returns {Array} array of section objects (empty if island missing)
 */
export function parseSections() {
  const sectionsScript = document.getElementById('journey-sections');
  if (sectionsScript) {
    return JSON.parse(sectionsScript.textContent);
  }
  return [];
}

/**
 * Parse the embedded blog posts JSON island (#blog-posts-data).
 * @returns {Array} array of post objects (empty if island missing)
 */
export function parseBlogPosts() {
  const postsScript = document.getElementById('blog-posts-data');
  if (postsScript) {
    const postsData = JSON.parse(postsScript.textContent);
    return postsData.posts || [];
  }
  return [];
}

/**
 * Map a section icon name to its Font Awesome class string.
 * @param {string} iconName
 * @returns {string} FA class string, or '' when no icon name given
 */
export function getIconClass(iconName) {
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

/**
 * Find blog posts related to a section, sorted most-recent-first.
 * @param {Object} section section object (uses section.tags)
 * @param {Array} blogPosts all blog posts
 * @returns {Array} matching posts sorted by date desc
 */
export function findRelatedPosts(section, blogPosts) {
  if (!section.tags || !blogPosts.length) {
    return [];
  }

  // Generic tags that shouldn't be used for matching alone
  const genericTags = ['personal', 'blog', 'milestone', 'general'];

  // Get specific tags from section
  const specificSectionTags = section.tags.filter(tag => !genericTags.includes(tag));

  const relatedPosts = blogPosts.filter(post => {
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

/**
 * Format an ISO/parseable date string for display (e.g. "Jan 5, 2024").
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}
