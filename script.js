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
const API_ENDPOINT = 'https://api.waifu.pics/sfw/waifu';

// Current image URL
let currentImageUrl = '';

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

    // Set image source
    waifuImage.src = data.url;
    currentImageUrl = data.url;

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

    // Setup download link
    downloadBtn.onclick = () => {
      const link = document.createElement('a');
      link.href = currentImageUrl;
      link.download = `waifu_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Add download feedback effect
      downloadBtn.innerHTML = '<span class="btn-icon">✓</span><span>Downloaded!</span>';
      setTimeout(() => {
        downloadBtn.innerHTML = '<span class="btn-icon">↓</span><span>Download Image</span>';
      }, 1500);
    };

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

// Function to update image stats
function updateImageStats() {
  // Show stats container
  imageStats.classList.add('active');

  // Get natural dimensions
  const width = waifuImage.naturalWidth;
  const height = waifuImage.naturalHeight;
  imageDimensions.textContent = `Dimensions: ${width} × ${height}`;

  // Estimate file size (this is approximate since we can't get actual size without HEAD request)
  const megapixels = (width * height) / 1000000;
  let estimatedSize;

  if (megapixels < 1) {
    estimatedSize = '100-300 KB';
  } else if (megapixels < 2) {
    estimatedSize = '300-600 KB';
  } else if (megapixels < 5) {
    estimatedSize = '600 KB - 1.5 MB';
  } else {
    estimatedSize = '1.5+ MB';
  }

  imageSize.textContent = `Size: ${estimatedSize}`;
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