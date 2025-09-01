(function() {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Convert inline citations to clickable links
        convertCitationsToLinks();
    });

    function convertCitationsToLinks() {
        // Get all text nodes in the post content
        const postContent = document.querySelector('.post-content');
        if (!postContent) return;

        // Regular expression to match IEEE citations like [1], [2], [67], [100], etc.
        const citationRegex = /\[(\d+)\]/g;

        // Walk through all text nodes and replace citations with links
        walkTextNodes(postContent, function(textNode) {
            const text = textNode.nodeValue;
            const matches = text.match(citationRegex);
            
            if (matches) {
                // Create a document fragment to hold the new nodes
                const fragment = document.createDocumentFragment();
                let lastIndex = 0;
                let match;
                
                citationRegex.lastIndex = 0; // Reset regex
                
                while ((match = citationRegex.exec(text)) !== null) {
                    // Add text before the match
                    if (match.index > lastIndex) {
                        fragment.appendChild(
                            document.createTextNode(text.substring(lastIndex, match.index))
                        );
                    }
                    
                    // Create the link
                    const link = document.createElement('a');
                    link.href = '#ref-' + match[1];
                    link.className = 'citation-link';
                    link.textContent = match[0];
                    link.setAttribute('data-ref', match[1]);
                    link.setAttribute('title', 'Jump to reference ' + match[1]);
                    fragment.appendChild(link);
                    
                    lastIndex = match.index + match[0].length;
                }
                
                // Add any remaining text
                if (lastIndex < text.length) {
                    fragment.appendChild(
                        document.createTextNode(text.substring(lastIndex))
                    );
                }
                
                // Replace the text node with the fragment
                textNode.parentNode.replaceChild(fragment, textNode);
            }
        });
    }

    function walkTextNodes(node, callback) {
        if (node.nodeType === 3) { // Text node
            callback(node);
        } else if (node.nodeType === 1) { // Element node
            // Skip certain elements
            const skipTags = ['SCRIPT', 'STYLE', 'CODE', 'PRE', 'A'];
            if (!skipTags.includes(node.tagName)) {
                // Process child nodes (convert NodeList to array to avoid issues with modifications)
                const children = Array.from(node.childNodes);
                children.forEach(child => walkTextNodes(child, callback));
            }
        }
    }
})();