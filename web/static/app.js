// Global state
let currentPage = 1;
let totalPages = 1;
let pageSize = 20;
let currentData = [];
let selectedImageIndex = -1;
let isLoading = false;
let allDataLoaded = false;
let currentSearchTerm = '';

// DOM elements
const imageList = document.getElementById('image-list');
const currentImage = document.getElementById('current-image');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const searchInput = document.getElementById('search');
const searchBtn = document.getElementById('search-btn');
const namesList = document.getElementById('names-list');
const paginationContainer = document.querySelector('.pagination');
const scrollInfo = document.getElementById('scroll-info');

// Metadata fields
const metaName = document.getElementById('meta-name');
const metaGender = document.getElementById('meta-gender');
const metaAge = document.getElementById('meta-age');
const metaDob = document.getElementById('meta-dob');
const metaPhotoTaken = document.getElementById('meta-photo-taken');
const metaFaceLocation = document.getElementById('meta-face-location');
const metaCelebId = document.getElementById('meta-celeb-id');
const metaPath = document.getElementById('meta-path');

// Global name list
let uniqueNames = [];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Load both data sets independently
    loadUniqueNames();
    loadData();
    
    // Event listeners
    prevBtn.addEventListener('click', goToPrevPage);
    nextBtn.addEventListener('click', goToNextPage);
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    // Add scroll event listener for infinite scroll
    window.addEventListener('scroll', checkForInfiniteScroll);
});

// Check if we need to load more data based on scroll position
function checkForInfiniteScroll() {
    // If we're already loading, or all data has been loaded, don't do anything
    if (isLoading || allDataLoaded) return;
    
    // If we're near the bottom of the page (200px margin)
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight = document.documentElement.clientHeight;
    
    if (scrollTop + clientHeight + 200 >= scrollHeight) {
        if (currentPage < totalPages) {
            loadMoreData();
        } else {
            allDataLoaded = true;
            showEndOfResultsMessage();
        }
    }
}

// Show a message when all results are loaded
function showEndOfResultsMessage() {
    // Only show the message if we don't already have one
    if (!document.querySelector('.end-of-results')) {
        const messageElem = document.createElement('div');
        messageElem.className = 'end-of-results';
        messageElem.textContent = 'All images loaded';
        imageList.appendChild(messageElem);
    }
}

// Load unique names for the sidebar
function loadUniqueNames() {
    namesList.innerHTML = '<div class="loading">Loading names...</div>';
    
    fetch('/api/unique-names')
        .then(response => response.json())
        .then(data => {
            uniqueNames = data.names || [];
            renderNamesList();
        })
        .catch(error => {
            console.error('Error loading unique names:', error);
            namesList.innerHTML = '<div class="error">Error loading names</div>';
        });
}

// Helper function to highlight the active name in the sidebar
function highlightActiveName(searchTerm) {
    if (!searchTerm) return;
    
    // Remove active class from all items
    const allItems = namesList.querySelectorAll('.name-item');
    allItems.forEach(item => item.classList.remove('active'));
    
    // Add active class to matching item
    allItems.forEach(item => {
        if (item.textContent.toLowerCase() === searchTerm.toLowerCase()) {
            item.classList.add('active');
            // Optionally scroll to the item to make it visible
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// Render the names list in the sidebar
function renderNamesList() {
    namesList.innerHTML = '';
    
    uniqueNames.forEach(name => {
        const nameItem = document.createElement('div');
        nameItem.className = 'name-item';
        nameItem.textContent = name;
        nameItem.addEventListener('click', () => {
            searchInput.value = name;
            handleSearch();
        });
        
        namesList.appendChild(nameItem);
    });
    
    // If we have a current search term, highlight it
    const searchTerm = searchInput.value.trim();
    if (searchTerm) {
        highlightActiveName(searchTerm);
    }
}

// Load data from API (initial load)
function loadData() {
    const searchTerm = searchInput.value.trim();
    currentSearchTerm = searchTerm; // Store the current search term
    const url = `/api/data?page=${currentPage}&limit=${pageSize}${searchTerm ? `&search=${searchTerm}` : ''}`;
    
    isLoading = true;
    allDataLoaded = false;
    
    // Show a loading state
    imageList.innerHTML = '<div class="loading">Loading...</div>';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            currentData = data.data;
            totalPages = Math.ceil(data.total / pageSize);
            
            updatePagination();
            renderImageList(true); // true = replace existing content
            
            // Show search results message
            const resultCount = data.total;
            if (searchTerm) {
                const resultMessage = `Found ${resultCount} results for "${searchTerm}"`;
                console.log(resultMessage);
                
                // Display the message in the UI
                const messageElem = document.createElement('div');
                messageElem.className = 'search-results-message';
                messageElem.textContent = resultMessage;
                imageList.prepend(messageElem);
                
                // If we're in infinite scroll mode for a name search, hide the regular pagination controls
                if (searchTerm && totalPages > 1) {
                    // Update UI for infinite scroll mode
                    prevBtn.style.display = 'none';
                    nextBtn.style.display = 'none';
                    pageInfo.style.display = 'none';
                    scrollInfo.style.display = 'inline';
                    paginationContainer.style.display = 'flex';
                    
                    // Mark the corresponding name in the sidebar as active
                    highlightActiveName(searchTerm);
                } else {
                    // Standard pagination mode
                    prevBtn.style.display = 'inline-block';
                    nextBtn.style.display = 'inline-block';
                    pageInfo.style.display = 'inline';
                    scrollInfo.style.display = 'none';
                    paginationContainer.style.display = 'flex';
                }
            } else {
                paginationContainer.style.display = 'flex';
            }
            
            // Select first image if available
            if (currentData.length > 0) {
                selectImage(0);
            } else {
                clearImageDetails();
                imageList.innerHTML = '<div class="no-results">No images found</div>';
            }
            
            isLoading = false;
        })
        .catch(error => {
            console.error('Error loading data:', error);
            imageList.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            
            // Clear current data
            currentData = [];
            updatePagination();
            clearImageDetails();
            isLoading = false;
        });
}

// Load more data for infinite scroll
function loadMoreData() {
    if (isLoading || currentPage >= totalPages) return;
    
    isLoading = true;
    currentPage++;
    
    // Add a loading indicator at the bottom
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-more';
    loadingIndicator.textContent = 'Loading more...';
    imageList.appendChild(loadingIndicator);
    
    const url = `/api/data?page=${currentPage}&limit=${pageSize}${currentSearchTerm ? `&search=${currentSearchTerm}` : ''}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            
            // Remove the loading indicator
            const loadingElem = document.querySelector('.loading-more');
            if (loadingElem) {
                loadingElem.remove();
            }
            
            // Append new data to existing data
            const newData = data.data;
            if (newData.length > 0) {
                const startIndex = currentData.length;
                currentData = [...currentData, ...newData];
                
                // Render only the new images
                renderAdditionalImages(newData, startIndex);
                updatePagination();
            } else {
                // If no more data, mark as all loaded
                allDataLoaded = true;
                showEndOfResultsMessage();
            }
            
            isLoading = false;
        })
        .catch(error => {
            console.error('Error loading more data:', error);
            
            // Remove the loading indicator
            const loadingElem = document.querySelector('.loading-more');
            if (loadingElem) {
                loadingElem.innerHTML = `<div class="error">Error: ${error.message}</div>`;
            }
            
            isLoading = false;
            currentPage--; // Revert page change since it failed
        });
}

// Render image list
function renderImageList(replaceExisting = true) {
    if (replaceExisting) {
        imageList.innerHTML = '';
    }
    
    currentData.forEach((item, index) => {
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = `/images/${item.path}`; // Use the image serving endpoint
        img.alt = item.name || 'Unknown';
        img.onerror = function() {
            this.src = '/static/placeholder.jpg'; // Fallback image
        };
        
        imageItem.appendChild(img);
        imageItem.addEventListener('click', () => selectImage(index));
        
        imageList.appendChild(imageItem);
    });
}

// Render additional images for infinite scroll
function renderAdditionalImages(newData, startIndex) {
    newData.forEach((item, relativeIndex) => {
        const index = startIndex + relativeIndex;
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = `/images/${item.path}`;
        img.alt = item.name || 'Unknown';
        img.onerror = function() {
            this.src = '/static/placeholder.jpg'; // Fallback image
        };
        
        imageItem.appendChild(img);
        imageItem.addEventListener('click', () => selectImage(index));
        
        imageList.appendChild(imageItem);
    });
}

// Select an image and display its metadata
function selectImage(index) {
    selectedImageIndex = index;
    const item = currentData[index];
    
    // Update active class
    document.querySelectorAll('.image-item').forEach(el => {
        el.classList.remove('active');
    });
    
    const selectedEl = document.querySelector(`.image-item[data-index="${index}"]`);
    if (selectedEl) {
        selectedEl.classList.add('active');
    }
    
    // Update main image
    currentImage.src = `/images/${item.path}`;
    currentImage.alt = item.name || 'Unknown';
    currentImage.onerror = function() {
        this.src = '/static/placeholder.jpg'; // Fallback image
    };
    
    // Update metadata
    metaName.textContent = item.name || 'Unknown';
    metaGender.textContent = item.gender || 'Unknown';
    metaAge.textContent = (item.age !== null && item.age > 0) ? item.age : 'Unknown';
    metaDob.textContent = item.dob || 'Unknown';
    metaPhotoTaken.textContent = item.photo_taken || 'Unknown';
    metaFaceLocation.textContent = item.face_location || 'Unknown';
    metaCelebId.textContent = (item.celeb_id !== null && item.celeb_id > 0) ? item.celeb_id : 'Unknown';
    metaPath.textContent = item.path || 'Unknown';
}

// Clear image details when no image is selected
function clearImageDetails() {
    currentImage.src = '';
    currentImage.alt = 'No image selected';
    
    // Clear metadata
    metaName.textContent = '-';
    metaGender.textContent = '-';
    metaAge.textContent = '-';
    metaDob.textContent = '-';
    metaPhotoTaken.textContent = '-';
    metaFaceLocation.textContent = '-';
    metaCelebId.textContent = '-';
    metaPath.textContent = '-';
}

// Update pagination UI
function updatePagination() {
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
}

// Pagination: Go to previous page
function goToPrevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadData();
    }
}

// Pagination: Go to next page
function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        loadData();
    }
}

// Handle search
function handleSearch() {
    currentPage = 1; // Reset to first page
    allDataLoaded = false; // Reset all data loaded flag
    loadData();
}
