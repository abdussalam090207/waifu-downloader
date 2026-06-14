// DOM Elements
const waifuImage = document.getElementById('waifu-image');
const nextBtn = document.getElementById('next-btn');
const downloadBtn = document.getElementById('download-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const errorMessage = document.getElementById('error-message');
const placeholder = document.getElementById('placeholder');
const imageStats = document.getElementById('image-stats');
const imageSize = document.getElementById('image-size');
const imageDimensions = document.getElementById('image-dimensions');
const currentYear = document.getElementById('current-year');

// API Endpoint
const API_ENDPOINT = 'https://api.waifu.im/images';

// Current image state
let currentImageUrl = '';
let currentImageData = null;

// Set current year in footer
currentYear.textContent = new Date().getFullYear();

// Function to fetch a new waifu image
async function fetchWaifu() {
  try {
    // Show loading overlay and hide error message
    loadingOverlay.classList.add('active');
    errorMessage.classList.remove('active');
    placeholder.style.display = 'none';

    // Disable buttons during fetch
    nextBtn.disabled = true;
    downloadBtn.disabled = true;

    // Fetch from API
    const response = await fetch(API_ENDPOINT);

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error('No image found');
    }

    const image = data.items[0];
    currentImageData = image;

    // Set image source
    waifuImage.src = image.url;
    currentImageUrl = image.url;

    // Wait for image to load
    await new Promise((resolve, reject) => {
      waifuImage.onload = resolve;
      waifuImage.onerror = reject;

      // Set timeout in case image takes too long
      setTimeout(() => {
        if (!waifuImage.complete) reject(new Error('Image loading timeout'));
      }, 10000);
    });

    // Hide loading overlay
    loadingOverlay.classList.remove('active');

    // Show image with fade-in effect
    waifuImage.classList.add('loaded');

    // Enable buttons
    nextBtn.disabled = false;
    downloadBtn.disabled = false;

    // Setup download handler
    downloadBtn.onclick = downloadImage;

    // Update image stats
    updateImageStats();

  } catch (error) {
    console.error('Error fetching waifu:', error);

    // Hide loading overlay
    loadingOverlay.classList.remove('active');

    // Show error message
    errorMessage.classList.add('active');

    // Re-enable next button for retry
    nextBtn.disabled = false;

    // Reset image
    waifuImage.classList.remove('loaded');
    placeholder.style.display = 'block';
  }
}

// Function to download the current image
async function downloadImage() {
  if (!currentImageUrl) return;

  downloadBtn.disabled = true;
  const ext = (currentImageData && currentImageData.extension) || '.jpg';

  try {
    // Fetch the image as a blob so the browser actually downloads it
    // instead of just opening it (download attribute is ignored for
    // cross-origin URLs by most browsers)
    const response = await fetch(currentImageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `waifu_${Date.now()}${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.warn('Blob download failed, opening image in a new tab instead:', error);
    // Fallback: open the image directly so the user can save it manually
    window.open(currentImageUrl, '_blank');
  }

  // Add download feedback effect
  downloadBtn.innerHTML = '<span class="btn-icon">✓</span><span>Downloaded!</span>';
  setTimeout(() => {
    downloadBtn.innerHTML = '<span class="btn-icon">↓</span><span>Download Image</span>';
    downloadBtn.disabled = false;
  }, 1500);
}

// Function to update image stats
function updateImageStats() {
  // Show stats container
  imageStats.classList.add('active');

  // Prefer real data from the API response
  const width = (currentImageData && currentImageData.width) || waifuImage.naturalWidth;
  const height = (currentImageData && currentImageData.height) || waifuImage.naturalHeight;
  imageDimensions.textContent = `Dimensions: ${width} × ${height}`;

  if (currentImageData && currentImageData.byteSize) {
    const sizeKB = currentImageData.byteSize / 1024;
    imageSize.textContent = sizeKB > 1024
      ? `Size: ${(sizeKB / 1024).toFixed(2)} MB`
      : `Size: ${sizeKB.toFixed(0)} KB`;
  } else {
    imageSize.textContent = 'Size: --';
  }
}

// Event Listeners
nextBtn.addEventListener('click', fetchWaifu);

// Initial fetch on page load
window.addEventListener('DOMContentLoaded', () => {
  // Start with a small delay for better UX
  setTimeout(fetchWaifu, 500);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Space or Right Arrow for next image
  if (e.code === 'Space' || e.code === 'ArrowRight') {
    e.preventDefault();
    if (!nextBtn.disabled) {
      nextBtn.click();
      // Add visual feedback
      nextBtn.style.transform = 'scale(0.95)';
      setTimeout(() => {
        nextBtn.style.transform = '';
      }, 200);
    }
  }

  // 'D' key for download
  if (e.code === 'KeyD' && !downloadBtn.disabled) {
    e.preventDefault();
    downloadBtn.click();
    // Add visual feedback
    downloadBtn.style.transform = 'scale(0.95)';
    setTimeout(() => {
      downloadBtn.style.transform = '';
    }, 200);
  }
});

// Add some visual effects for buttons on hover
const buttons = document.querySelectorAll('.btn');
buttons.forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-3px)';
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});