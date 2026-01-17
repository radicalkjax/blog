/**
 * Timeline System JavaScript
 * Interactive timeline for radicalkjax.com
 * Following design system patterns
 */

class TimelineSystem {
  constructor() {
    this.container = document.getElementById('timeline-container');
    this.markersContainer = document.getElementById('timeline-markers');
    this.contentArea = document.getElementById('timeline-content-cards');
    this.breadcrumbList = document.querySelector('.breadcrumb-list');
    this.breadcrumbNav = document.querySelector('.timeline-breadcrumb');
    this.backButton = document.querySelector('.breadcrumb-back');
    this.mobileToggle = document.querySelector('.timeline-mobile-toggle');

    this.data = null;
    this.blogPosts = [];
    this.currentTimeline = null;
    this.currentMarker = null;
    this.navigationHistory = [];

    this.init();
  }

  async init() {
    try {
      await this.loadData();
      await this.loadBlogPosts();
      this.renderTimeline(this.data.timeline);
      this.attachEventListeners();
      this.restoreStateFromURL();
    } catch (error) {
      console.error('Timeline initialization failed:', error);
      this.showError('Failed to load timeline data');
    }
  }

  async loadData() {
    try {
      // Load data from embedded JSON in the page
      const dataScript = document.getElementById('timeline-data');
      if (dataScript) {
        this.data = JSON.parse(dataScript.textContent);
      } else {
        throw new Error('Timeline data not found');
      }
    } catch (error) {
      console.error('Error loading timeline data:', error);
      throw error;
    }
  }

  async loadBlogPosts() {
    try {
      // Load blog posts from embedded JSON
      const postsScript = document.getElementById('blog-posts-data');
      if (postsScript) {
        const postsData = JSON.parse(postsScript.textContent);
        this.blogPosts = postsData.posts || [];
      }
    } catch (error) {
      console.error('Error loading blog posts data:', error);
      // Non-fatal error, continue without blog posts
    }
  }

  findRelatedPosts(marker) {
    if (!marker.tags || !this.blogPosts.length) {
      return [];
    }

    // Define generic/common tags that shouldn't be used for matching alone
    const genericTags = ['personal', 'blog', 'milestone'];

    // Find posts that match the marker's specific tags
    const relatedPosts = this.blogPosts.filter((post) => {
      if (!post.tags || !Array.isArray(post.tags)) return false;

      // Check if post explicitly references this marker
      const referencesMarker = post.timeline_marker === marker.id;
      if (referencesMarker) return true;

      // Filter out generic tags to get specific tags for matching
      const specificMarkerTags = marker.tags.filter((tag) => !genericTags.includes(tag));

      // If marker has no specific tags, fall back to matching any tag
      if (specificMarkerTags.length === 0) {
        const hasMatchingTags = marker.tags.some((tag) => post.tags.includes(tag));
        if (!hasMatchingTags) return false;
      } else {
        // Post must have at least one specific tag from the marker
        const hasSpecificTag = specificMarkerTags.some((markerTag) => {
          // Check for exact match
          if (post.tags.includes(markerTag)) return true;

          // Check for variations (e.g., "transgender" matches "trans")
          // Check if either tag contains the other
          return post.tags.some((postTag) => markerTag.includes(postTag) || postTag.includes(markerTag));
        });
        if (!hasSpecificTag) return false;
      }

      // Check if post's timeline_date falls within marker's date range
      if (marker.dateBegin && marker.dateEnd) {
        const postDate = new Date(post.timeline_date || post.date);
        const markerBegin = new Date(marker.dateBegin);
        const markerEnd = new Date(marker.dateEnd);

        // Post must be within the date range (inclusive)
        return postDate >= markerBegin && postDate <= markerEnd;
      }

      return true;
    });

    // Sort posts by timeline_date (most recent first)
    return relatedPosts.sort((a, b) => {
      const dateA = new Date(a.timeline_date || a.date);
      const dateB = new Date(b.timeline_date || b.date);
      return dateB - dateA;
    });
  }

  renderTimeline(timeline) {
    this.currentTimeline = timeline;
    this.markersContainer.innerHTML = '';

    if (!timeline.markers || timeline.markers.length === 0) {
      this.markersContainer.innerHTML = '<p class="timeline-empty">No markers to display</p>';
      return;
    }

    // Sort markers by date (newest first)
    const sortedMarkers = [...timeline.markers].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedMarkers.forEach((marker) => {
      // Set hasResources based on resources array length
      marker.hasResources = marker.resources && marker.resources.length > 0;
      const markerElement = this.createMarkerElement(marker);
      this.markersContainer.appendChild(markerElement);
    });
  }

  createMarkerElement(marker) {
    const markerDiv = document.createElement('div');
    markerDiv.className = 'timeline-marker';
    markerDiv.dataset.markerId = marker.id;
    markerDiv.dataset.hasBreakout = marker.hasBreakout || false;
    markerDiv.setAttribute('tabindex', '0');
    markerDiv.setAttribute('role', 'button');
    markerDiv.setAttribute('aria-label', `View ${marker.title}`);

    // Format date
    const date = marker.date ? this.formatDate(marker.date) : '';

    // Get icon
    const icon = this.getIconClass(marker.icon);

    markerDiv.innerHTML = `
      <div class="marker-dot-container">
        <div class="marker-dot" style="${marker.color ? `background-color: ${marker.color};` : ''}">
          ${icon ? `<i class="${icon}"></i>` : ''}
        </div>
        ${marker.hasResources ? '<div class="marker-resource-indicator" title="Has resources">R</div>' : ''}
      </div>
      <div class="marker-content">
        ${date ? `<time class="marker-date" datetime="${marker.date}">${date}</time>` : ''}
        <h3 class="marker-title">${marker.title}</h3>
        ${marker.description ? `<p class="marker-description">${marker.description}</p>` : ''}
        ${marker.hasBreakout ? `
          <button class="marker-expand" data-marker-id="${marker.id}">
            <span class="expand-text">View Journey</span>
            <i class="fas fa-chevron-right"></i>
          </button>
        ` : ''}
      </div>
    `;

    return markerDiv;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  getIconClass(iconName) {
    const iconMap = {
      star: 'fas fa-star',
      transgender: 'fas fa-transgender',
      rainbow: 'fas fa-rainbow',
      heart: 'fas fa-heart',
      users: 'fas fa-users',
      bullhorn: 'fas fa-bullhorn',
      hospital: 'fas fa-hospital',
      'check-circle': 'fas fa-check-circle',
      'user-md': 'fas fa-user-md',
      'calendar-check': 'fas fa-calendar-check',
      smile: 'fas fa-smile',
      search: 'fas fa-search',
      bookmark: 'fas fa-bookmark',
      'laptop-code': 'fas fa-laptop-code',
      'graduation-cap': 'fas fa-graduation-cap',
      home: 'fas fa-home',
    };
    return iconMap[iconName] || 'fas fa-circle';
  }

  attachEventListeners() {
    // Marker click handlers
    this.markersContainer.addEventListener('click', (e) => {
      const marker = e.target.closest('.timeline-marker');
      if (marker && !e.target.closest('.marker-expand')) {
        this.selectMarker(marker.dataset.markerId);
      }

      // Expand button click
      const expandBtn = e.target.closest('.marker-expand');
      if (expandBtn) {
        e.stopPropagation();
        this.expandBreakout(expandBtn.dataset.markerId);
      }
    });

    // Keyboard navigation for markers
    this.markersContainer.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const marker = e.target.closest('.timeline-marker');
        if (marker) {
          e.preventDefault();
          this.selectMarker(marker.dataset.markerId);
        }
      }
    });

    // Back button
    if (this.backButton) {
      this.backButton.addEventListener('click', () => {
        this.goBack();
      });
    }

    // Mobile toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => {
        this.toggleMobileTimeline();
      });
    }

    // Tab button clicks (event delegation on content area)
    this.contentArea.addEventListener('click', (e) => {
      const tabButton = e.target.closest('.tab-button');
      if (tabButton) {
        const { markerId } = tabButton.dataset;
        const { tabName } = tabButton.dataset;
        if (markerId && tabName) {
          this.switchTab(markerId, tabName, tabButton);
        }
      }
    });

    // Close mobile timeline when clicking outside
    document.addEventListener('click', (e) => {
      if (this.container.classList.contains('mobile-open')
          && !this.container.contains(e.target)
          && !this.mobileToggle.contains(e.target)) {
        this.closeMobileTimeline();
      }
    });
  }

  selectMarker(markerId) {
    // Find marker in current timeline
    const marker = this.findMarkerById(markerId, this.currentTimeline);
    if (!marker) {
      console.error('Marker not found:', markerId);
      return;
    }

    // Update active state
    this.updateActiveMarker(markerId);

    // Load content card
    this.loadContentCard(marker);

    // Update URL
    this.updateURL(markerId);

    // Close mobile timeline
    this.closeMobileTimeline();

    // Scroll content card into view
    setTimeout(() => {
      const contentCard = document.querySelector('.timeline-content-card');
      if (contentCard) {
        contentCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  findMarkerById(markerId, timeline = null) {
    const searchTimeline = timeline || this.currentTimeline;
    if (!searchTimeline || !searchTimeline.markers) return null;

    for (const marker of searchTimeline.markers) {
      if (marker.id === markerId) {
        return marker;
      }
    }
    return null;
  }

  updateActiveMarker(markerId) {
    // Remove active class from all markers
    const allMarkers = this.markersContainer.querySelectorAll('.timeline-marker');
    allMarkers.forEach((m) => m.classList.remove('active'));

    // Add active class to selected marker
    const selectedMarker = this.markersContainer.querySelector(`[data-marker-id="${markerId}"]`);
    if (selectedMarker) {
      selectedMarker.classList.add('active');
    }

    this.currentMarker = markerId;
  }

  loadContentCard(marker) {
    this.contentArea.innerHTML = '';

    const card = document.createElement('article');
    card.className = 'timeline-content-card';
    card.dataset.markerId = marker.id;
    card.setAttribute('role', 'article');

    // Card Header
    let headerHTML = '<header class="content-card-header">';
    if (marker.date) {
      headerHTML += `<time datetime="${marker.date}">${this.formatDate(marker.date)}</time>`;
    }
    headerHTML += `<h2>${marker.title}</h2>`;
    headerHTML += '</header>';

    // Card Body
    let bodyHTML = '<div class="content-card-body">';
    if (marker.description) {
      bodyHTML += `<p class="content-card-description">${marker.description}</p>`;
    }

    // Tabbed Interface for Related Posts, Links, and Resources
    const relatedPosts = this.findRelatedPosts(marker);
    const hasLinks = marker.links && Array.isArray(marker.links) && marker.links.length > 0;
    const hasResources = marker.hasResources && marker.resources && marker.resources.length > 0;

    if (relatedPosts.length > 0 || hasLinks || hasResources) {
      bodyHTML += '<div class="content-card-tabbed">';

      // Tab buttons
      bodyHTML += '<div class="tab-buttons">';
      if (relatedPosts.length > 0) {
        bodyHTML += `<button class="tab-button active" data-marker-id="${marker.id}" data-tab-name="posts">Related Blog Posts</button>`;
      }
      if (hasLinks) {
        const activeClass = relatedPosts.length === 0 ? 'active' : '';
        bodyHTML += `<button class="tab-button ${activeClass}" data-marker-id="${marker.id}" data-tab-name="links">Links</button>`;
      }
      if (hasResources) {
        const activeClass = (relatedPosts.length === 0 && !hasLinks) ? 'active' : '';
        bodyHTML += `<button class="tab-button ${activeClass}" data-marker-id="${marker.id}" data-tab-name="resources">Resources</button>`;
      }
      bodyHTML += '</div>';

      // Tab content
      bodyHTML += '<div class="tab-content">';

      // Related Posts Tab
      if (relatedPosts.length > 0) {
        bodyHTML += `<div id="tab-posts-${marker.id}" class="tab-pane active">`;
        bodyHTML += '<div class="post-previews">';
        relatedPosts.forEach((post) => {
          const displayDate = post.timeline_date || post.date;
          bodyHTML += `
            <article class="post-preview">
              <time datetime="${displayDate}">${this.formatDate(displayDate)}</time>
              <h4><a href="${post.url}">${post.title}</a></h4>
              <p>${post.excerpt}</p>
              <a href="${post.url}" class="read-more">Read more →</a>
            </article>
          `;
        });
        bodyHTML += '</div></div>';
      }

      // Links Tab
      if (hasLinks) {
        const activeClass = relatedPosts.length === 0 ? 'active' : '';
        bodyHTML += `<div id="tab-links-${marker.id}" class="tab-pane ${activeClass}">`;
        bodyHTML += '<div class="content-card-links"><ul>';
        marker.links.forEach((link) => {
          let icon = 'fa-link';
          if (link.type === 'blog') {
            icon = 'fa-blog';
          } else if (link.type === 'external') {
            icon = 'fa-external-link-alt';
          }
          const target = link.type === 'external' ? 'target="_blank" rel="noopener noreferrer"' : '';
          bodyHTML += `
            <li>
              <a href="${link.url}" ${target}>
                <i class="fas ${icon}"></i>
                ${link.title}
              </a>
            </li>
          `;
        });
        bodyHTML += '</ul></div></div>';
      }

      // Resources Tab
      if (hasResources) {
        const activeClass = (relatedPosts.length === 0 && !hasLinks) ? 'active' : '';
        bodyHTML += `<div id="tab-resources-${marker.id}" class="tab-pane ${activeClass}">`;
        bodyHTML += this.renderResources(marker.resources);
        bodyHTML += '</div>';
      }

      bodyHTML += '</div></div>';
    }

    bodyHTML += '</div>';

    // Card Footer (if has breakout)
    let footerHTML = '';
    if (marker.hasBreakout && marker.breakoutTimeline) {
      footerHTML = `
        <footer class="content-card-footer">
          <button class="btn-view-breakout" onclick="timeline.expandBreakout('${marker.id}')">
            <i class="fas fa-sitemap"></i>
            Explore ${marker.breakoutTimeline.title}
          </button>
        </footer>
      `;
    }

    card.innerHTML = headerHTML + bodyHTML + footerHTML;
    this.contentArea.appendChild(card);
  }

  expandBreakout(markerId) {
    const marker = this.findMarkerById(markerId, this.currentTimeline);
    if (!marker || !marker.hasBreakout || !marker.breakoutTimeline) {
      console.error('Cannot expand marker:', markerId);
      return;
    }

    // Save current state to history
    this.navigationHistory.push({
      timeline: this.currentTimeline,
      marker: this.currentMarker,
    });

    // Render breakout timeline
    this.renderTimeline(marker.breakoutTimeline);

    // Update breadcrumb
    this.updateBreadcrumb(marker.breakoutTimeline.title);

    // Show breadcrumb navigation
    if (this.breadcrumbNav) {
      this.breadcrumbNav.classList.add('has-navigation');
    }

    // Show back button
    if (this.backButton) {
      this.backButton.hidden = false;
    }

    // Clear content area
    this.contentArea.innerHTML = '';

    // Update URL
    this.updateURL(markerId, 'breakout');
  }

  goBack() {
    if (this.navigationHistory.length === 0) {
      return;
    }

    // Pop previous state
    const previousState = this.navigationHistory.pop();

    // Restore timeline
    this.renderTimeline(previousState.timeline);

    // Update breadcrumb
    this.updateBreadcrumb();

    // Hide breadcrumb and back button if at root
    if (this.navigationHistory.length === 0) {
      if (this.breadcrumbNav) {
        this.breadcrumbNav.classList.remove('has-navigation');
      }
      if (this.backButton) {
        this.backButton.hidden = true;
      }
    }

    // Restore marker selection if any
    if (previousState.marker) {
      this.selectMarker(previousState.marker);
    } else {
      this.contentArea.innerHTML = '';
    }
  }

  updateBreadcrumb(newTitle = null) {
    if (!this.breadcrumbList) return;

    if (newTitle) {
      // Add new breadcrumb item
      const li = document.createElement('li');
      li.className = 'breadcrumb-item active';
      li.textContent = newTitle;

      // Remove active from previous items and make them clickable
      const items = this.breadcrumbList.querySelectorAll('.breadcrumb-item');
      items.forEach((item, index) => {
        item.classList.remove('active');

        // Make non-active items clickable
        if (!item.classList.contains('breadcrumb-clickable')) {
          item.classList.add('breadcrumb-clickable');
          item.style.cursor = 'pointer';

          // Store the depth (how many levels to go back)
          const depthToGoBack = items.length - index;
          item.dataset.depth = depthToGoBack;

          // Add click handler
          item.addEventListener('click', () => {
            this.navigateToBreadcrumb(depthToGoBack);
          });
        }
      });

      this.breadcrumbList.appendChild(li);

      // Keep only the last 2 breadcrumb items visible
      this.trimBreadcrumbs();
    } else {
      // Remove last breadcrumb item
      const items = this.breadcrumbList.querySelectorAll('.breadcrumb-item');
      if (items.length > 1) {
        items[items.length - 1].remove();

        // Get updated list after removal
        const updatedItems = this.breadcrumbList.querySelectorAll('.breadcrumb-item');
        if (updatedItems.length > 0) {
          updatedItems[updatedItems.length - 1].classList.add('active');
        }

        // Re-trim breadcrumbs to show correct items
        this.trimBreadcrumbs();
      }
    }

    // Update back button visibility
    this.updateBackButtonState();
  }

  trimBreadcrumbs() {
    const items = this.breadcrumbList.querySelectorAll('.breadcrumb-item');

    // If more than 2 items, hide all but the last 2
    if (items.length > 2) {
      items.forEach((item, index) => {
        if (index < items.length - 2) {
          item.style.display = 'none';
        } else {
          item.style.display = 'flex';
        }
      });
    } else {
      // If 2 or fewer items, show all
      items.forEach((item) => {
        item.style.display = 'flex';
      });
    }
  }

  updateBackButtonState() {
    if (!this.backButton) return;

    const allItems = this.breadcrumbList.querySelectorAll('.breadcrumb-item');
    const hiddenItems = Array.from(allItems).filter((item) => item.style.display === 'none');

    // If there are hidden breadcrumbs, show an indicator on the back button
    if (hiddenItems.length > 0) {
      this.backButton.classList.add('has-more');
      this.backButton.title = `Back (${hiddenItems.length + 1} more level${hiddenItems.length > 0 ? 's' : ''})`;
    } else {
      this.backButton.classList.remove('has-more');
      this.backButton.title = 'Back to previous timeline';
    }
  }

  navigateToBreadcrumb(depth) {
    // Go back the specified number of levels
    for (let i = 0; i < depth; i++) {
      if (this.navigationHistory.length > 0) {
        this.goBack();
      }
    }
  }

  renderResources(resources) {
    let html = '<div class="resources-grid">';
    resources.forEach((resource, index) => {
      const iconClass = this.getResourceIcon(resource.extname);
      const extLower = resource.extname.toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(extLower);
      const isPDF = extLower === '.pdf';
      const isCalendar = extLower === '.ics';
      const isCSV = extLower === '.csv';
      const isSpreadsheet = ['.xlsx', '.xls'].includes(extLower);

      const itemId = `resource-${index}-${Date.now()}`;
      let previewHTML = '';

      if (isImage) {
        previewHTML = `<img src="${resource.url}" alt="${resource.name}" class="resource-thumbnail">`;
      } else if (isPDF) {
        previewHTML = `
          <iframe src="${resource.url}#page=1&view=FitH&toolbar=0"
                  class="resource-pdf-iframe"
                  title="${resource.name}"></iframe>
        `;
      } else if (isCalendar) {
        previewHTML = `
          <div class="resource-file-preview calendar-preview" id="${itemId}">
            <i class="${iconClass}"></i>
            <div class="preview-content">
              <div class="preview-label">Loading calendar...</div>
            </div>
          </div>
        `;
        // Fetch and parse calendar file
        setTimeout(() => this.loadCalendarPreview(resource.url, itemId), 100);
      } else if (isCSV) {
        previewHTML = `
          <div class="resource-file-preview spreadsheet-preview" id="${itemId}">
            <i class="${iconClass}"></i>
            <div class="preview-content">
              <div class="preview-label">Loading CSV...</div>
            </div>
          </div>
        `;
        // Fetch and parse CSV file
        setTimeout(() => this.loadCSVPreview(resource.url, itemId), 100);
      } else if (isSpreadsheet) {
        previewHTML = `
          <div class="resource-file-preview spreadsheet-preview" id="${itemId}">
            <i class="${iconClass}"></i>
            <div class="preview-content">
              <div class="preview-label">Loading Excel...</div>
            </div>
          </div>
        `;
        // Fetch and parse Excel file
        setTimeout(() => this.loadExcelPreview(resource.url, itemId), 100);
      } else {
        previewHTML = `<div class="resource-icon"><i class="${iconClass}"></i></div>`;
      }

      html += `
        <div class="resource-item">
          <a href="${resource.url}" target="_blank" class="resource-link">
            <div class="resource-preview">
              ${previewHTML}
            </div>
            <div class="resource-info">
              <div class="resource-name">${resource.name}</div>
              <div class="resource-type">${resource.extname.toUpperCase().replace('.', '')}</div>
            </div>
          </a>
        </div>
      `;
    });
    html += '</div>';
    return html;
  }

  async loadCalendarPreview(url, elementId) {
    try {
      const response = await fetch(url);
      const icsText = await response.text();

      // Simple ICS parser - extract first event
      const summaryMatch = icsText.match(/SUMMARY:(.*)/);
      const dtstartMatch = icsText.match(/DTSTART[^:]*:(.*)/);

      const summary = summaryMatch ? summaryMatch[1].trim() : 'Event';
      const dateStr = dtstartMatch ? dtstartMatch[1].trim() : '';

      // Parse date
      let monthName = '';
      let day = '';
      let year = '';
      if (dateStr) {
        year = dateStr.substr(0, 4);
        const monthNum = parseInt(dateStr.substr(4, 2), 10);
        day = dateStr.substr(6, 2);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthName = months[monthNum - 1] || '';
      }

      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="calendar-visual-preview">
            <div class="calendar-header">${monthName} ${year}</div>
            <div class="calendar-day">${day}</div>
            <div class="calendar-event">${summary}</div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Error loading calendar preview:', error);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="calendar-visual-preview">
            <div class="calendar-header">Calendar</div>
            <div class="calendar-day">--</div>
            <div class="calendar-event">Event</div>
          </div>
        `;
      }
    }
  }

  async loadCSVPreview(url, elementId) {
    try {
      const response = await fetch(url);
      const csvText = await response.text();

      // Simple CSV parser - get first 4 rows
      const lines = csvText.trim().split('\n').slice(0, 4);
      const rows = lines.map((line) => line.split(',').slice(0, 4)); // Basic CSV parsing (doesn't handle quoted commas)

      let tableHTML = '<div class="spreadsheet-visual-preview"><table class="csv-visual-table">';
      rows.forEach((row, i) => {
        tableHTML += '<tr>';
        row.forEach((cell) => {
          const tag = i === 0 ? 'th' : 'td';
          tableHTML += `<${tag}>${cell.trim()}</${tag}>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</table></div>';

      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = tableHTML;
      }
    } catch (error) {
      console.error('Error loading CSV preview:', error);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="spreadsheet-visual-preview">
            <table class="csv-visual-table">
              <tr><th>A</th><th>B</th><th>C</th></tr>
              <tr><td>1</td><td>2</td><td>3</td></tr>
              <tr><td>4</td><td>5</td><td>6</td></tr>
            </table>
          </div>
        `;
      }
    }
  }

  async loadExcelPreview(url, elementId) {
    try {
      // Check if SheetJS is available
      if (typeof XLSX === 'undefined') {
        throw new Error('SheetJS library not loaded');
      }

      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Parse the Excel file
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });

      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // Convert to array of arrays (get first 4 rows)
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      const rows = data.slice(0, 4);

      // Build HTML table
      let tableHTML = '<div class="spreadsheet-visual-preview"><table class="csv-visual-table">';
      rows.forEach((row, i) => {
        tableHTML += '<tr>';
        // Get first 4 columns
        const cells = row.slice(0, 4);
        cells.forEach((cell) => {
          const tag = i === 0 ? 'th' : 'td';
          const cellValue = cell !== null && cell !== undefined ? String(cell) : '';
          tableHTML += `<${tag}>${cellValue}</${tag}>`;
        });
        tableHTML += '</tr>';
      });
      tableHTML += '</table></div>';

      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = tableHTML;
      }
    } catch (error) {
      console.error('Error loading Excel preview:', error);
      const element = document.getElementById(elementId);
      if (element) {
        element.innerHTML = `
          <div class="spreadsheet-visual-preview">
            <div class="preview-content">
              <i class="fas fa-file-excel"></i>
              <div class="preview-label">Excel File</div>
              <div class="preview-text">Click to download</div>
            </div>
          </div>
        `;
      }
    }
  }

  getResourceIcon(extname) {
    const iconMap = {
      '.pdf': 'fas fa-file-pdf',
      '.doc': 'fas fa-file-word',
      '.docx': 'fas fa-file-word',
      '.xls': 'fas fa-file-excel',
      '.xlsx': 'fas fa-file-excel',
      '.ppt': 'fas fa-file-powerpoint',
      '.pptx': 'fas fa-file-powerpoint',
      '.jpg': 'fas fa-file-image',
      '.jpeg': 'fas fa-file-image',
      '.png': 'fas fa-file-image',
      '.gif': 'fas fa-file-image',
      '.ics': 'fas fa-calendar',
      '.txt': 'fas fa-file-alt',
      '.csv': 'fas fa-file-csv',
    };
    return iconMap[extname.toLowerCase()] || 'fas fa-file';
  }

  switchTab(markerId, tabName, clickedButton) {
    // Find the content card (not the marker) for this marker
    const card = document.querySelector(`.timeline-content-card[data-marker-id="${markerId}"]`);
    if (!card) {
      return;
    }

    // Hide all tab panes within this card
    const tabPanes = card.querySelectorAll('.tab-pane');
    tabPanes.forEach((pane) => {
      pane.classList.remove('active');
    });

    // Remove active class from all tab buttons within this card
    const tabButtons = card.querySelectorAll('.tab-button');
    tabButtons.forEach((button) => {
      button.classList.remove('active');
    });

    // Show the selected tab pane
    const selectedPane = document.getElementById(`tab-${tabName}-${markerId}`);
    if (selectedPane) {
      selectedPane.classList.add('active');
    }

    // Add active class to the clicked button
    if (clickedButton) {
      clickedButton.classList.add('active');
    }
  }

  toggleMobileTimeline() {
    if (this.container) {
      this.container.classList.toggle('mobile-open');
    }
  }

  closeMobileTimeline() {
    if (this.container) {
      this.container.classList.remove('mobile-open');
    }
  }

  updateURL(markerId, type = 'marker') {
    const url = new URL(window.location);
    url.hash = `${type}-${markerId}`;
    window.history.pushState({}, '', url);
  }

  restoreStateFromURL() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    const [type, markerId] = hash.split('-', 2);
    if (type === 'marker' && markerId) {
      this.selectMarker(markerId);
    }
  }

  showError(message) {
    this.markersContainer.innerHTML = `
      <div class="timeline-error" style="text-align: center; padding: 40px 20px; color: rgba(255, 255, 255, 0.6);">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #f84ef8; margin-bottom: 15px;"></i>
        <p>${message}</p>
      </div>
    `;
  }
}

// Initialize timeline when DOM is ready
let timeline;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    timeline = new TimelineSystem();
  });
} else {
  timeline = new TimelineSystem();
}

// Make timeline globally accessible for button onclick handlers
window.timeline = timeline;
