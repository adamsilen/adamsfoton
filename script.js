const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementById('close');
let currentIndex = 60;
let isLoading = false;
let hasReachedEnd = false;

const loadingSpinner = document.createElement('div');
loadingSpinner.id = 'loading-spinner';
loadingSpinner.innerHTML = '<div class="spinner"><div></div><div></div><div></div></div>';
document.body.appendChild(loadingSpinner);

document.addEventListener('DOMContentLoaded', function() {
    const heading = document.querySelector('h1');
    const paragraph = document.querySelector('p');
    
    setTimeout(() => {
        heading.classList.add('visible');
    }, 100);
    
    if (paragraph) {
        setTimeout(() => {
            paragraph.classList.add('visible');
        }, 3000); 
    }
});

function addEndingParagraph() {
    const paragraph = document.createElement('p');
    paragraph.textContent = "Du har nått slutet. Tack för att du tog dig tid och tittade på mina foton!";
    document.body.appendChild(paragraph);
    setTimeout(() => {
        paragraph.classList.add('visible');
    }, 100);
}

function isPageScrollable() {
    return document.documentElement.scrollHeight > window.innerHeight;
}

function calculateImagesToLoad() {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (viewportWidth <= 768) {
        const imageHeight = viewportHeight * 0.9;
        const rowsToFill = Math.ceil(viewportHeight / imageHeight) + 1; // Reduced rows to fill
        return rowsToFill;
    } else {
        const imageWidth = 300;
        const imageHeight = 312;
        const imagesPerRow = Math.floor(viewportWidth / imageWidth);
        const rowsToFill = Math.ceil(viewportHeight / imageHeight) + 1;
        return Math.max(imagesPerRow * rowsToFill, 2);
    }
}

function loadSingleImage(index) {
    return new Promise(resolve => {
        const imgElement = document.createElement('img');
        
        imgElement.onload = () => {
            gallery.appendChild(imgElement);
            setTimeout(() => {
                imgElement.classList.add('visible');
            }, 50);
            imgElement.addEventListener('click', () => openLightbox(imgElement.src));
            
            if (index === 1) {
                hasReachedEnd = true;
                if (isPageScrollable()) {
                    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
                        addEndingParagraph();
                    }
                }
            }
            
            resolve(true);
        };

        imgElement.onerror = () => {
            resolve(false);  // Just resolve immediately on error
        };

        imgElement.src = `images/${index}.jpeg`;
        imgElement.alt = `${index}.jpeg`;
    });
}

async function loadImages() {
    if (isLoading || currentIndex < 1) return;
    
    isLoading = true;
    loadingSpinner.style.display = 'block'; // Show loading spinner immediately
    const imagesToLoad = calculateImagesToLoad();
    let loadedInBatch = 0;
    let attempts = 0;
    const spinnerMinDisplayTime = 1000; // Minimum display time for the spinner
    const spinnerStartTime = Date.now();

    while (currentIndex >= 1 && loadedInBatch < imagesToLoad) {
        const loaded = await loadSingleImage(currentIndex);
        if (loaded) {
            loadedInBatch++;
        }
        currentIndex--;
        attempts++;
        if (attempts % 10 === 0) { // Reduced the number of attempts before yielding
            await new Promise(resolve => setTimeout(resolve, 20));
        }
    }

    const elapsedTime = Date.now() - spinnerStartTime;
    if (elapsedTime < spinnerMinDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, spinnerMinDisplayTime - elapsedTime));
    }

    isLoading = false;
    loadingSpinner.style.display = 'none'; // Hide loading spinner
}

function openLightbox(src) {
    lightboxImg.src = src;
    lightboxImg.onload = () => {
        setLightboxImageSize();
    };
    lightbox.style.display = 'flex';
}

function setLightboxImageSize() {
    const maxHeight = Math.min(1000, window.innerHeight * 0.9);
    const maxWidth = Math.min(window.innerWidth * 0.9, lightboxImg.naturalWidth);
    
    lightboxImg.style.maxHeight = `${maxHeight}px`;
    lightboxImg.style.maxWidth = `${maxWidth}px`;
}

function closeLightbox() {
    lightbox.style.display = 'none';
}

let scrollTimeout;
function onScroll() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
            loadImages();
            if (hasReachedEnd && !document.querySelector('p') && isPageScrollable()) {
                addEndingParagraph();
            }
        }
    }, 100);
}

let resizeTimeout;
function onResize() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 800) {
            loadImages();
        }
    }, 250);
}

loadImages();

window.addEventListener('scroll', onScroll);
window.addEventListener('resize', onResize);
closeBtn.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', closeLightbox);
window.addEventListener('resize', setLightboxImageSize);
