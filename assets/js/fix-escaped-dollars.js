(function() {
    // Fix escaped dollar signs after MathJax has processed
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for MathJax to finish processing
        if (window.MathJax && MathJax.startup) {
            MathJax.startup.promise.then(function() {
                fixEscapedDollars();
            });
        } else {
            // If MathJax isn't loaded or doesn't have startup.promise, wait a bit
            setTimeout(fixEscapedDollars, 1000);
        }
    });

    function fixEscapedDollars() {
        // Find all text nodes in the post content
        const postContent = document.querySelector('.post-content');
        if (!postContent) return;

        // Walk through text nodes and fix escaped dollar signs
        walkTextNodes(postContent, function(textNode) {
            if (textNode.nodeValue.includes('\\$')) {
                textNode.nodeValue = textNode.nodeValue.replace(/\\\$/g, '$');
            }
        });
    }

    function walkTextNodes(node, callback) {
        if (node.nodeType === 3) { // Text node
            callback(node);
        } else if (node.nodeType === 1) { // Element node
            // Skip MathJax elements and code blocks
            const skipTags = ['SCRIPT', 'STYLE', 'MJX-CONTAINER', 'MJX-MATH', 'MJX-ASSISTIVE-MML'];
            const skipClasses = ['MathJax', 'MathJax_Display', 'MathJax_Preview'];
            
            if (!skipTags.includes(node.tagName) && 
                !skipClasses.some(cls => node.classList && node.classList.contains(cls))) {
                // Process child nodes
                const children = Array.from(node.childNodes);
                children.forEach(child => walkTextNodes(child, callback));
            }
        }
    }
})();