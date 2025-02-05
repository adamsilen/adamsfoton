const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const closeBtn = document.getElementById('close');
let currentIndex = 16;
let isLoading = false;
let hasReachedEnd = false;

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
    paragraph.textContent = "Du har nått slutet. Tack för att du tog dig tid och tittade på mina foton <3";
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
        const rowsToFill = Math.ceil(viewportHeight / imageHeight) + 2;
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
            resolve(false);
        };

        imgElement.src = `images/${index}.jpeg`;
        imgElement.alt = `${index}.jpeg`;
    });
}

async function loadImages() {
    if (isLoading || currentIndex < 1) return;
    
    isLoading = true;
    const imagesToLoad = calculateImagesToLoad();
    let loadedInBatch = 0;

    while (currentIndex >= 1 && loadedInBatch < imagesToLoad) {
        const loaded = await loadSingleImage(currentIndex);
        if (loaded) loadedInBatch++;
        currentIndex--;
    }

    isLoading = false;
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
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
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
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 200) {
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
