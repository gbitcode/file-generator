// Common utilities for all pages

// Logging and progress utilities
window.logToUI = function(message) {
    const logsContainer = document.getElementById('logs-container');
    if (!logsContainer) return;

    const timestamp = new Date().toLocaleTimeString();

    // Clear "No logs yet" message
    if (logsContainer.innerHTML.includes('No logs yet')) {
        logsContainer.innerHTML = '';
    }

    const logEntry = document.createElement('div');
    logEntry.className = 'mb-1';
    logEntry.innerHTML = `<span class="text-primary">[${timestamp}]</span> ${message}`;
    logsContainer.appendChild(logEntry);

    // Auto-scroll to bottom
    logsContainer.scrollTop = logsContainer.scrollHeight;

    // Also log to console
    console.log(message);
};

window.updateProgress = function(percent, text = null) {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    if (!progressContainer || !progressBar || !progressText) return;

    progressContainer.classList.remove('hidden');
    progressBar.value = percent;
    progressText.textContent = text || `${Math.round(percent)}%`;
};

window.hideProgress = function() {
    const progressContainer = document.getElementById('progress-container');
    if (!progressContainer) return;

    progressContainer.classList.add('hidden');
    document.getElementById('progress-bar').value = 0;
    document.getElementById('progress-text').textContent = '0%';
};

// Mobile device detection
function isMobileDevice() {
    // Multi-method detection for reliability:
    // 1. Touch capability
    // 2. Screen size (< 768px is mobile)
    // 3. User agent as fallback
    return (
        ('ontouchstart' in window || navigator.maxTouchPoints > 0) &&
        window.innerWidth < 768
    ) || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Check if Web Share API can share the file
function canUseWebShare(file) {
    // Check if Web Share API is supported
    if (!navigator.canShare) return false;

    // Check if the specific file can be shared
    return navigator.canShare({ files: [file] });
}

// Main download/share function
async function downloadOrShareFile(blob, filename, fileType = 'file') {
    const file = new File([blob], filename, { type: blob.type });

    // Determine if we should attempt to share
    const shouldShare = isMobileDevice() && canUseWebShare(file);

    if (shouldShare) {
        try {
            await navigator.share({
                files: [file],
                title: `Generated ${fileType}`,
                text: `Check out this generated ${filename}`
            });

            window.logToUI('✓ File shared successfully!');

            // Track share event in Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'share_file', {
                    event_category: 'file_sharing',
                    event_label: fileType,
                    method: 'web_share_api'
                });
            }

            return { method: 'share', success: true };

        } catch (error) {
            // User cancelled or share failed
            if (error.name === 'AbortError') {
                window.logToUI('Share cancelled');
                return { method: 'share', success: false, cancelled: true };
            }

            // Fall back to download on error
            window.logToUI('Share failed, falling back to download...');

            // Track fallback in Google Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'share_fallback', {
                    event_category: 'file_sharing',
                    event_label: fileType,
                    fallback_reason: 'share_failed'
                });
            }

            performDownload(blob, filename);
            return { method: 'download', success: true, fallback: true };
        }
    } else {
        // Desktop or Web Share not supported - use download
        performDownload(blob, filename);
        return { method: 'download', success: true };
    }
}

// Perform the actual download
function performDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Backward compatibility - keep downloadFile as alias
function downloadFile(blob, filename) {
    performDownload(blob, filename);
}

// Update submit button text based on device capability
function updateSubmitButtonText() {
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    const isMobile = isMobileDevice();

    submitButtons.forEach(button => {
        if (isMobile && navigator.canShare) {
            button.textContent = 'Generate & Share';
            button.setAttribute('data-action', 'share');
        } else {
            button.textContent = 'Generate & Download';
            button.setAttribute('data-action', 'download');
        }
    });
}

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showError(message) {
    alert(message);
}

// Initialize common elements
document.addEventListener('DOMContentLoaded', () => {
    // Clear logs button
    document.getElementById('clear-logs')?.addEventListener('click', () => {
        const logsContainer = document.getElementById('logs-container');
        logsContainer.innerHTML = '<div class="text-base-content/70">No logs yet...</div>';
    });

    // Update button text based on device
    updateSubmitButtonText();
});

// Update button text on window resize (for orientation changes)
window.addEventListener('resize', debounce(updateSubmitButtonText, 250));
