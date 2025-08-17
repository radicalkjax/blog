/**
 * Custom JavaScript for Mermaid diagrams
 * Ensures diagrams fit properly within post containers
 */

// Function to wrap mermaid diagrams in a container for better handling
function wrapMermaidDiagrams() {
    // Find all mermaid diagram containers
    const mermaidDivs = document.querySelectorAll('.mermaid');
    
    if (mermaidDivs.length === 0) return;
    
    mermaidDivs.forEach(div => {
        // Skip if already wrapped
        if (div.parentNode.classList.contains('mermaid-wrapper')) return;
        
        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'mermaid-wrapper';
        
        // Replace the mermaid div with the wrapper containing the mermaid div
        div.parentNode.insertBefore(wrapper, div);
        wrapper.appendChild(div);
    });
}

// Function to style mermaid diagrams for better responsiveness
function styleMermaidDiagrams() {
    // First ensure all diagrams are wrapped
    wrapMermaidDiagrams();
    
    // Find all mermaid diagram containers
    const mermaidDivs = document.querySelectorAll('.mermaid');
    
    if (mermaidDivs.length === 0) return;
    
    mermaidDivs.forEach(div => {
        // Find the SVG element inside the mermaid div
        const svg = div.querySelector('svg');
        if (!svg) return;
        
        // Mark as processed
        div.setAttribute('data-processed', 'true');
        
        // Ensure SVG has proper viewBox for scaling
        if (!svg.getAttribute('viewBox') && svg.getAttribute('width') && svg.getAttribute('height')) {
            const width = parseFloat(svg.getAttribute('width'));
            const height = parseFloat(svg.getAttribute('height'));
            svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        }
        
        // Make SVG responsive
        svg.style.width = 'auto';
        svg.style.height = 'auto';
        svg.style.maxWidth = '100%';
        svg.style.display = 'block';
        svg.style.margin = '0 auto';
        svg.style.overflow = 'visible';
        
        // Remove any fixed width/height attributes that might cause issues
        svg.removeAttribute('width');
        svg.removeAttribute('height');
        
        // Adjust container to fit content
        div.style.width = 'auto';
        div.style.maxWidth = '100%';
        div.style.overflowX = 'auto';
        div.style.margin = '30px auto';
        div.style.boxSizing = 'border-box';
        
        // Add padding for better visibility
        div.style.padding = '15px';
        
        // Add border and styling
        div.style.backgroundColor = '#1a1a1a';
        div.style.border = '2px solid #6d105a';
        div.style.borderRadius = '4px';
        div.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        
        // Make diagram clickable
        div.style.cursor = 'pointer';
        div.setAttribute('title', 'Click to view larger');
        div.style.transition = 'all 0.3s ease';
        
        // Ensure SVG doesn't block pointer events for hover
        svg.style.pointerEvents = 'none';
        
        // Add hover effect
        div.addEventListener('mouseenter', function() {
            this.style.borderColor = '#ff6b6b';
            this.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            this.style.transform = 'scale(1.02)';
        });
        div.addEventListener('mouseleave', function() {
            this.style.borderColor = '#6d105a';
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            this.style.transform = 'scale(1)';
        });
        
        // Ensure all text elements are readable with white text
        const textElements = svg.querySelectorAll('text, .label, .nodeLabel, .edgeLabel, .messageText, .loopText, .noteText, .titleText, .sectionTitle, .taskText, .actor, .classTitle, .stateLabel, .stateLabelText, .pieLabel, .pieTitleText');
        textElements.forEach(text => {
            text.style.fontFamily = "'DM Mono', monospace";
            text.style.fill = '#ffffff';
            text.style.color = '#ffffff';
        });
        
        // Style nodes - using original coloring
        const nodes = svg.querySelectorAll('.node rect, .node circle, .node ellipse, .node polygon, .node path');
        nodes.forEach(node => {
            node.style.fill = 'rgba(255, 255, 255, 0.1)';
            node.style.stroke = '#ffffff';
            node.style.strokeWidth = '2px';
        });
        
        // Style edges - using original coloring
        const edges = svg.querySelectorAll('.edgePath .path');
        edges.forEach(edge => {
            edge.style.stroke = '#ffffff';
            edge.style.strokeWidth = '2px';
        });
        
        // Style edge labels - using original coloring
        const edgeLabels = svg.querySelectorAll('.edgeLabel');
        edgeLabels.forEach(label => {
            label.style.color = '#ffffff';
            label.style.backgroundColor = 'rgba(109, 16, 90, 0.7)';
            label.style.fontFamily = "'DM Mono', monospace";
        });
        
        // Style clusters - using original coloring
        const clusters = svg.querySelectorAll('.cluster rect');
        clusters.forEach(cluster => {
            cluster.style.fill = 'rgba(255, 255, 255, 0.05)';
            cluster.style.stroke = '#ffffff';
            cluster.style.strokeWidth = '2px';
        });
        
        // No special handling for pie charts in this function
    });
}

// Function to handle mermaid initialization
function setupMermaidConfig() {
    if (typeof mermaid !== 'undefined') {
        // Set global mermaid configuration with original coloring
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            themeVariables: {
                primaryColor: 'rgba(255, 255, 255, 0.1)',
                primaryTextColor: '#ffffff',
                primaryBorderColor: '#ffffff',
                lineColor: '#ffffff',
                secondaryColor: 'rgba(109, 16, 90, 0.7)',
                tertiaryColor: 'rgba(255, 255, 255, 0.05)',
                // Ensure all text is white
                textColor: '#ffffff',
                mainBkg: '#1a1a1a',
                nodeBorder: '#ffffff',
                edgeLabelBackground: 'rgba(109, 16, 90, 0.7)',
                clusterBkg: 'rgba(255, 255, 255, 0.05)',
                clusterBorder: '#ffffff',
                titleColor: '#ffffff',
                nodeTextColor: '#ffffff',
                edgeTextColor: '#ffffff',
                actorTextColor: '#ffffff',
                actorBorder: '#ffffff',
                noteBkgColor: 'rgba(109, 16, 90, 0.7)',
                noteTextColor: '#ffffff',
                noteBorderColor: '#ffffff',
                labelColor: '#ffffff',
                loopTextColor: '#ffffff'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            },
            // Add specific settings for pie charts
            pie: {
                textPosition: 0.65,  // Default position for text
                useWidth: 0.5,       // Default width for the pie
                useMaxWidth: true,   // Ensure it fits in the container
                radius: 0.7,         // Default pie chart size
                textMargin: 5,       // Default text margin
                wrap: true           // Wrap long labels
            },
            securityLevel: 'loose'
        });
    }
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Setup mermaid configuration
    setupMermaidConfig();
    
    // Process any mermaid code blocks with init parameters
    processMermaidInitBlocks();
    
    // Apply initial styling
    styleMermaidDiagrams();
    
    // Wait for mermaid to initialize and render diagrams
    setTimeout(function() {
        // Only process diagrams that haven't been processed yet
        const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
        if (unprocessedDiagrams.length > 0) {
            styleMermaidDiagrams();
        }
    }, 1000);
    
    // Apply styling again after a longer delay to catch late-rendered diagrams
    setTimeout(function() {
        // Only process diagrams that haven't been processed yet
        const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
        if (unprocessedDiagrams.length > 0) {
            styleMermaidDiagrams();
        }
    }, 2500);
    
    // Handle window resize events - but don't reprocess diagrams
    window.addEventListener('resize', function() {
        // Just ensure SVGs are responsive without reprocessing
        document.querySelectorAll('.mermaid svg').forEach(svg => {
            svg.style.width = 'auto';
            svg.style.height = 'auto';
            svg.style.maxWidth = '100%';
        });
    });
    
    // Fix for diagrams in the post we're working on
    const specificPost = document.querySelector('.post-content');
    if (specificPost) {
        specificPost.style.overflowX = 'visible';
    }
    
    // Ensure all post containers can handle mermaid diagrams
    document.querySelectorAll('.post-content, .post-container').forEach(container => {
        container.style.overflowX = 'visible';
    });
    
    // Check for mermaid diagrams periodically in case they're loaded dynamically
    const checkInterval = setInterval(function() {
        // Only process diagrams that haven't been processed yet
        const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
        if (unprocessedDiagrams.length > 0) {
            styleMermaidDiagrams();
        } else {
            // If all diagrams are processed, stop checking
            clearInterval(checkInterval);
        }
    }, 1000);
    
    // Stop checking after 5 seconds to avoid infinite checking
    setTimeout(function() {
        clearInterval(checkInterval);
    }, 5000);
});

// Function to process mermaid code blocks with init parameters and transform them into mermaid divs
function processMermaidInitBlocks() {
    // Find all code blocks with language 'mermaid'
    document.querySelectorAll('pre code.language-mermaid').forEach(function(element) {
        // Create a div for mermaid
        var mermaidDiv = document.createElement('div');
        mermaidDiv.className = 'mermaid';
        mermaidDiv.innerHTML = element.textContent;
        
        // Replace the code block with the mermaid div
        var pre = element.parentNode;
        pre.parentNode.replaceChild(mermaidDiv, pre);
    });
    
    // Also handle code blocks inside divs (for our IEEE formatted posts)
    document.querySelectorAll('div pre code').forEach(function(element) {
        if (element.textContent.trim().startsWith('graph ') || 
            element.textContent.trim().startsWith('sequenceDiagram') || 
            element.textContent.trim().startsWith('classDiagram') || 
            element.textContent.trim().startsWith('gantt') || 
            element.textContent.trim().startsWith('pie') || 
            element.textContent.trim().startsWith('flowchart')) {
            
            // Create a div for mermaid
            var mermaidDiv = document.createElement('div');
            mermaidDiv.className = 'mermaid';
            mermaidDiv.innerHTML = element.textContent;
            
            // Replace the code block with the mermaid div
            var pre = element.parentNode;
            pre.parentNode.replaceChild(mermaidDiv, pre);
        }
    });
    
    // Process any mermaid blocks with init parameters
    document.querySelectorAll('.mermaid').forEach(function(mermaidDiv) {
        const content = mermaidDiv.innerHTML;
        
        // Check if it has init parameters
        if (content.includes('%%{init:')) {
            try {
                // Extract the init object
                const initMatch = content.match(/%%\{init:\s*(\{.*?\})\s*%%/s);
                if (initMatch && initMatch[1]) {
                    // Parse the init object, handling both single and double quotes
                    let initObj;
                    try {
                        // Try parsing with single quotes converted to double quotes
                        initObj = JSON.parse(initMatch[1].replace(/'/g, '"'));
                    } catch (e) {
                        // If that fails, try a more lenient approach
                        const cleanedInit = initMatch[1]
                            .replace(/'/g, '"')
                            .replace(/(\w+):/g, '"$1":')  // Convert property names to quoted strings
                            .replace(/,\s*}/g, '}');      // Remove trailing commas
                        
                        initObj = JSON.parse(cleanedInit);
                    }
                    
                    // Standardize the flowchart settings
                    if (initObj.flowchart) {
                        // Keep any width/height settings but ensure they're percentages
                        if (typeof initObj.flowchart.width === 'string' && 
                            !initObj.flowchart.width.endsWith('%')) {
                            initObj.flowchart.width = '100%';
                        }
                        
                        if (typeof initObj.flowchart.height === 'string' && 
                            !initObj.flowchart.height.endsWith('%')) {
                            initObj.flowchart.height = 'auto';
                        }
                        
                        // Always set useMaxWidth to true
                        initObj.flowchart.useMaxWidth = true;
                    }
                    
                    // Ensure theme is dark to match our site
                    initObj.theme = 'dark';
                    
                    // Special handling for pie charts
                    if (content.includes('pie') || content.includes('pie showData')) {
                        // Add pie chart specific settings
                        initObj.pie = {
                            ...initObj.pie,
                            textPosition: 0.65,  // Default position for text
                            useWidth: 0.5,       // Default width for the pie
                            useMaxWidth: true,   // Ensure it fits in the container
                            radius: 0.7,         // Default pie chart size
                            textMargin: 5,       // Default text margin
                            wrap: true           // Wrap long labels
                        };
                    }
                    
                    // Add our theme variables with original coloring
                    initObj.themeVariables = {
                        ...initObj.themeVariables,
                        primaryColor: 'rgba(255, 255, 255, 0.1)',
                        primaryTextColor: '#ffffff',
                        primaryBorderColor: '#ffffff',
                        lineColor: '#ffffff',
                        secondaryColor: 'rgba(109, 16, 90, 0.7)',
                        tertiaryColor: 'rgba(255, 255, 255, 0.05)',
                        // Ensure all text is white
                        textColor: '#ffffff',
                        mainBkg: '#1a1a1a',
                        nodeBorder: '#ffffff',
                        edgeLabelBackground: 'rgba(109, 16, 90, 0.7)',
                        clusterBkg: 'rgba(255, 255, 255, 0.05)',
                        clusterBorder: '#ffffff',
                        titleColor: '#ffffff',
                        nodeTextColor: '#ffffff',
                        edgeTextColor: '#ffffff',
                        actorTextColor: '#ffffff',
                        actorBorder: '#ffffff',
                        noteBkgColor: 'rgba(109, 16, 90, 0.7)',
                        noteTextColor: '#ffffff',
                        noteBorderColor: '#ffffff',
                        labelColor: '#ffffff',
                        loopTextColor: '#ffffff'
                    };
                    
                    // Replace the original init with our modified version
                    const newInit = JSON.stringify(initObj);
                    const newContent = content.replace(
                        initMatch[0], 
                        `%%{init: ${newInit}}%%`
                    );
                    
                    // Update the mermaid div
                    mermaidDiv.innerHTML = newContent;
                }
            } catch (e) {
                console.error('Error processing mermaid init:', e);
            }
        }
    });
    
    // Initialize mermaid after replacing elements
    if (typeof mermaid !== 'undefined') {
        mermaid.init(undefined, '.mermaid');
    }
}

// MutationObserver to watch for dynamically added mermaid diagrams
function setupMermaidObserver() {
    // Create a new observer
    const observer = new MutationObserver(function(mutations) {
        let needsProcessing = false;
        
        mutations.forEach(function(mutation) {
            // Check for added nodes
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(function(node) {
                    // Check if the added node is a mermaid diagram or contains one
                    if (node.classList && node.classList.contains('mermaid') || 
                        (node.querySelectorAll && node.querySelectorAll('.mermaid').length > 0)) {
                        needsProcessing = true;
                    }
                });
            }
        });
        
        // If we found new mermaid diagrams, process them
        if (needsProcessing) {
            // Only process diagrams that haven't been processed yet
            const unprocessedDiagrams = document.querySelectorAll('.mermaid:not([data-processed="true"])');
            if (unprocessedDiagrams.length > 0) {
                setTimeout(styleMermaidDiagrams, 500);
            }
        }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Function to create and show modal for mermaid diagrams
function createMermaidModal() {
    // Check if modal already exists
    if (document.getElementById('mermaid-modal')) return;
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'mermaid-modal';
    modalOverlay.style.cssText = `
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        z-index: 9999;
        cursor: pointer;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    // Create modal content container
    const modalContent = document.createElement('div');
    modalContent.id = 'mermaid-modal-content';
    modalContent.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        position: relative;
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 20px;
        font-size: 40px;
        font-weight: bold;
        color: #ffffff;
        background: none;
        border: none;
        cursor: pointer;
        z-index: 10001;
        line-height: 1;
        padding: 0;
        width: 40px;
        height: 40px;
    `;
    closeButton.onmouseover = function() { this.style.color = '#ff6b6b'; };
    closeButton.onmouseout = function() { this.style.color = '#ffffff'; };
    
    // Create zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.id = 'mermaid-zoom-controls';
    zoomControls.style.cssText = `
        position: absolute;
        bottom: 20px;
        right: 20px;
        display: flex;
        gap: 10px;
        z-index: 10001;
    `;
    
    const zoomInBtn = document.createElement('button');
    zoomInBtn.innerHTML = '+';
    zoomInBtn.style.cssText = `
        width: 40px;
        height: 40px;
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        background-color: #6d105a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.innerHTML = '−';
    zoomOutBtn.style.cssText = `
        width: 40px;
        height: 40px;
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        background-color: #6d105a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    
    const zoomResetBtn = document.createElement('button');
    zoomResetBtn.innerHTML = '⟲';
    zoomResetBtn.style.cssText = `
        width: 40px;
        height: 40px;
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
        background-color: #6d105a;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    `;
    
    // Add hover effects to zoom buttons
    [zoomInBtn, zoomOutBtn, zoomResetBtn].forEach(btn => {
        btn.onmouseover = function() { 
            this.style.backgroundColor = '#ff6b6b'; 
        };
        btn.onmouseout = function() { 
            this.style.backgroundColor = '#6d105a'; 
        };
    });
    
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomResetBtn);
    zoomControls.appendChild(zoomInBtn);
    
    // Create diagram container
    const diagramContainer = document.createElement('div');
    diagramContainer.id = 'mermaid-modal-diagram';
    diagramContainer.style.cssText = `
        width: 95vw;
        height: 90vh;
        overflow: auto;
        background-color: #1a1a1a;
        border: 2px solid #6d105a;
        border-radius: 8px;
        padding: 30px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Assemble modal
    modalContent.appendChild(closeButton);
    modalContent.appendChild(zoomControls);
    modalContent.appendChild(diagramContainer);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
    
    // Store zoom level
    let currentZoom = 1;
    
    // Zoom functions
    function applyZoom(zoom) {
        const svg = diagramContainer.querySelector('svg');
        if (svg) {
            svg.style.transform = `scale(${zoom})`;
            svg.style.transformOrigin = 'center';
        }
    }
    
    // Zoom controls functionality
    zoomInBtn.onclick = function(e) {
        e.stopPropagation();
        currentZoom = Math.min(currentZoom + 0.2, 3);
        applyZoom(currentZoom);
    };
    
    zoomOutBtn.onclick = function(e) {
        e.stopPropagation();
        currentZoom = Math.max(currentZoom - 0.2, 0.5);
        applyZoom(currentZoom);
    };
    
    zoomResetBtn.onclick = function(e) {
        e.stopPropagation();
        currentZoom = 1;
        applyZoom(currentZoom);
    };
    
    // Store functions on modal for access during display
    modalOverlay.setZoom = function(zoom) {
        currentZoom = zoom;
        applyZoom(currentZoom);
    };
    
    // Close modal on overlay click
    modalOverlay.onclick = function(e) {
        if (e.target === modalOverlay || e.target === modalContent) {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    };
    
    // Close modal on close button click
    closeButton.onclick = function(e) {
        e.stopPropagation();
        modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    };
    
    // Close modal on ESC key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modalOverlay.style.display === 'block') {
            modalOverlay.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
}

// Function to handle mermaid diagram and SVG image clicks
function setupMermaidClickHandlers() {
    document.addEventListener('click', function(e) {
        // Check if clicked element is within a mermaid diagram OR an SVG image
        const mermaidDiv = e.target.closest('.mermaid');
        const svgImage = e.target.closest('img[src$=".svg"]');
        
        if (!mermaidDiv && !svgImage) return;
        if (mermaidDiv && !mermaidDiv.hasAttribute('data-processed')) return;
        
        // Prevent default behavior
        e.preventDefault();
        e.stopPropagation();
        
        let elementToClone, svgContent;
        
        if (mermaidDiv) {
            // Handle mermaid diagram
            const svg = mermaidDiv.querySelector('svg');
            if (!svg) return;
            elementToClone = mermaidDiv;
            svgContent = svg;
        } else if (svgImage) {
            // Handle SVG image
            elementToClone = svgImage.parentElement;
            svgContent = svgImage;
        }
        
        // Show modal
        const modal = document.getElementById('mermaid-modal');
        const diagramContainer = document.getElementById('mermaid-modal-diagram');
        
        // Clear previous content
        diagramContainer.innerHTML = '';
        
        if (mermaidDiv) {
            // Clone the entire mermaid div to preserve all styling
            const mermaidClone = mermaidDiv.cloneNode(true);
            const svgClone = mermaidClone.querySelector('svg');
            
            // Add cloned mermaid div to modal
            diagramContainer.appendChild(mermaidClone);
            
            // Remove click functionality from clone
            mermaidClone.style.cursor = 'default';
            mermaidClone.removeAttribute('title');
            mermaidClone.removeAttribute('data-processed');
            mermaidClone.style.transform = 'none';
            mermaidClone.style.border = 'none';
            mermaidClone.style.boxShadow = 'none';
            mermaidClone.style.backgroundColor = 'transparent';
            mermaidClone.style.padding = '0';
            
            // Style the SVG for larger view
            handleSVGSizing(svgClone);
        } else if (svgImage) {
            // Clone the SVG image
            const imgClone = svgImage.cloneNode(true);
            
            // Remove any inline styles that might constrain size
            imgClone.style.maxWidth = 'none';
            imgClone.style.border = 'none';
            imgClone.style.boxShadow = 'none';
            imgClone.style.backgroundColor = 'transparent';
            imgClone.style.padding = '0';
            
            // Add to modal
            diagramContainer.appendChild(imgClone);
            
            // Style the SVG image for larger view
            handleSVGImageSizing(imgClone);
        }
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Reset zoom
        if (modal.setZoom) {
            modal.setZoom(1);
        }
    });
}

// Helper function to handle SVG sizing
function handleSVGSizing(svgElement) {
    if (svgElement) {
        // Get original dimensions
        const viewBox = svgElement.getAttribute('viewBox');
        if (viewBox) {
            const [, , width, height] = viewBox.split(' ').map(Number);
            const aspectRatio = width / height;
            
            // Calculate optimal size based on viewport
            const maxWidth = window.innerWidth * 0.9;
            const maxHeight = window.innerHeight * 0.85;
            
            let newWidth, newHeight;
            if (maxWidth / maxHeight > aspectRatio) {
                // Height is the limiting factor
                newHeight = maxHeight;
                newWidth = newHeight * aspectRatio;
            } else {
                // Width is the limiting factor
                newWidth = maxWidth;
                newHeight = newWidth / aspectRatio;
            }
            
            // Apply dimensions with minimum sizes
            svgElement.style.width = Math.max(newWidth, 1200) + 'px';
            svgElement.style.height = Math.max(newHeight, 600) + 'px';
        } else {
            // Fallback for SVGs without viewBox
            svgElement.style.width = '100%';
            svgElement.style.height = '100%';
            svgElement.style.minWidth = '1200px';
            svgElement.style.minHeight = '600px';
        }
        
        svgElement.style.maxWidth = 'none';
        svgElement.style.maxHeight = 'none';
        svgElement.style.pointerEvents = 'auto';
    }
}

// Helper function to handle SVG image sizing
function handleSVGImageSizing(imgElement) {
    if (imgElement) {
        // Calculate optimal size based on viewport
        const maxWidth = window.innerWidth * 0.9;
        const maxHeight = window.innerHeight * 0.85;
        
        // For images, we'll set max dimensions and let the browser maintain aspect ratio
        imgElement.style.width = 'auto';
        imgElement.style.height = 'auto';
        imgElement.style.maxWidth = maxWidth + 'px';
        imgElement.style.maxHeight = maxHeight + 'px';
        imgElement.style.minWidth = '800px';
        imgElement.style.display = 'block';
        imgElement.style.margin = '0 auto';
    }
}

// Run setup when the page loads
document.addEventListener('DOMContentLoaded', function() {
    processMermaidInitBlocks();
    setupMermaidObserver();
    createMermaidModal();
    setupMermaidClickHandlers();
});
