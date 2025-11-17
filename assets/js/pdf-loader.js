// pdf-loader.js

document.addEventListener('DOMContentLoaded', () => {
    const pdfIframe = document.getElementById('pdf-iframe');
    const spinnerContainer = document.getElementById('pdf-spinner-container');
    const pdfWrapper = document.getElementById('pdf-wrapper');

    if (pdfIframe) {
        // Listen for the iframe's load event
        pdfIframe.onload = function() {
            // Check if the content is successfully loaded (though this can be tricky with cross-origin content like Google Drive)
            
            // Hide the spinner
            if (spinnerContainer) {
                spinnerContainer.style.display = 'none';
            }

            // Show the PDF wrapper
            if (pdfWrapper) {
                pdfWrapper.classList.remove('pdf-hidden');
            }
        };

        // Fallback: If the iframe fails to load (due to permissions/blockers), 
        // you might want to hide the spinner after a timeout, but only do this if testing shows the onload event never fires.
        // For Google Drive embeds, onload usually fires even if the content is just a login prompt.
        
        // Example fallback (optional):
        setTimeout(() => {
            if (spinnerContainer && spinnerContainer.style.display !== 'none') {
                // If the spinner is still visible after 8 seconds, just show the iframe anyway
                // to let the user see any error message inside the iframe.
                spinnerContainer.style.display = 'none';
                pdfWrapper.classList.remove('pdf-hidden');
            }
        }, 8000); // 8 seconds timeout
    }
});