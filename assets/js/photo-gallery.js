// Dynamic Photo Gallery functionality for photos.html
document.addEventListener('DOMContentLoaded', function() {
    // Make photo items clickable
    const photoItems = document.querySelectorAll('.photo-item');
    
    photoItems.forEach(item => {
        // Add cursor pointer to indicate clickability
        item.style.cursor = 'pointer';
        
        // Get the folder path from the data attribute we'll add
        const folderPath = item.getAttribute('data-folder');
        const categoryTitle = item.querySelector('.photo-title')?.textContent || 'Photos';
        
        if (!folderPath) return;
        
        // Add click handler
        item.addEventListener('click', function(e) {
            e.preventDefault();
            // We'll pass the photos as a JSON array in the data attribute
            const photosJson = item.getAttribute('data-photos');
            if (photosJson) {
                try {
                    const photos = JSON.parse(photosJson);
                    showPhotoGallery(categoryTitle, photos);
                } catch (err) {
                    console.error('Error parsing photos data:', err);
                }
            }
        });
        
        // Add hover effect to indicate clickability
        item.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
            this.style.borderColor = '#ff6b6b';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
            this.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        });
    });

    // Create gallery modal
    function showPhotoGallery(title, photos) {
        if (!photos || photos.length === 0) {
            console.log('No photos available for this category');
            return;
        }

        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'photo-gallery-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            z-index: 10000;
            overflow-y: auto;
            padding: 20px;
        `;

        // Create modal content
        const content = document.createElement('div');
        content.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        `;

        // Add header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            color: #ffffff;
        `;
        
        const titleElement = document.createElement('h2');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            font-size: 2rem;
            color: #ff00ff;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.type = 'button';
        closeBtn.style.cssText = `
            font-size: 3rem;
            background: none;
            border: none;
            color: #ffffff;
            cursor: pointer;
            padding: 0;
            width: 40px;
            height: 40px;
        `;
        closeBtn.onclick = () => modal.remove();
        
        header.appendChild(titleElement);
        header.appendChild(closeBtn);
        content.appendChild(header);

        // Add photo count
        const photoCount = document.createElement('p');
        photoCount.style.cssText = `
            color: #ffffff;
            margin-bottom: 20px;
            opacity: 0.8;
        `;
        photoCount.textContent = `${photos.length} photo${photos.length !== 1 ? 's' : ''}`;
        content.appendChild(photoCount);

        // Create photo grid
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 20px;
        `;

        // Add photos to grid
        photos.forEach(photoSrc => {
            const photoWrapper = document.createElement('div');
            photoWrapper.style.cssText = `
                background: rgba(122, 1, 119, 0.7);
                border: 1px solid rgba(255, 255, 255, 0.3);
                overflow: hidden;
                cursor: pointer;
                transition: transform 0.3s ease;
            `;
            
            const img = document.createElement('img');
            img.src = photoSrc;
            img.alt = title;
            img.loading = 'lazy';
            img.style.cssText = `
                width: 100%;
                height: 250px;
                object-fit: cover;
                display: block;
            `;
            
            // Add click handler for lightbox
            photoWrapper.addEventListener('click', function() {
                openLightbox(photoSrc, title);
            });
            
            // Add hover effect
            photoWrapper.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            
            photoWrapper.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
            
            photoWrapper.appendChild(img);
            grid.appendChild(photoWrapper);
        });

        content.appendChild(grid);
        modal.appendChild(content);
        document.body.appendChild(modal);

        // Close on ESC key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Close on background click
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Lightbox function for individual photos
    function openLightbox(src, alt) {
        const lightbox = document.createElement('div');
        lightbox.className = 'map-lightbox active';
        lightbox.style.zIndex = '10001'; // Higher than modal
        lightbox.innerHTML = `
            <span class="close">&times;</span>
            <img src="${src}" alt="${alt}" style="max-width: 90%; max-height: 90vh; object-fit: contain;">
            <div class="lightbox-caption">${alt}</div>
        `;
        
        document.body.appendChild(lightbox);
        
        // Close handlers
        const closeBtn = lightbox.querySelector('.close');
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            lightbox.remove();
        };
        
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.remove();
            }
        });
        
        // ESC key to close only the lightbox, not the modal
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                lightbox.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
});