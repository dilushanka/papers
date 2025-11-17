document.addEventListener('DOMContentLoaded', () => {
    // Select the main map container and the text display area
    const map = document.getElementById('sri-lanka-map');
    const provinceNameDisplay = document.getElementById('province-name-display');
    const defaultDisplayMessage = 'Hover over a province'; 
    const defaultDisplayColor = 'var(--primary-color)';

    if (map && provinceNameDisplay) {
        // Select all province paths which have the required 'data-province' attribute
        const provinces = map.querySelectorAll('path[data-province]');
        
        // Set the initial text
        provinceNameDisplay.textContent = defaultDisplayMessage;
        provinceNameDisplay.style.backgroundColor = defaultDisplayColor;

        console.log(`Found ${provinces.length} province paths for interactivity.`);

        provinces.forEach((path, index) => {
            
            // --- Logging for Debugging ---
            const pathID = path.id || `unnamed_path_${index}`;
            const dataProvince = path.getAttribute('data-province');
            const titleAttribute = path.getAttribute('title');

            if (!titleAttribute) {
                 console.warn(`Path ID: ${pathID} (data-province: ${dataProvince}) is MISSING the 'title' attribute. Hover names will use fallback.`);
            }
            // --- End Logging ---
            
            // --- 1. Click Event (Redirection) ---
            path.addEventListener('click', (event) => {
                const provinceName = event.target.getAttribute('data-province');
                
                if (provinceName) {
                    const redirectURL = `index.html?province=${provinceName}`;
                    window.location.href = redirectURL;
                }
            });

            // --- 2. Mouseover (Hover In) Event ---
            path.addEventListener('mouseover', (event) => {
                // Try to get the descriptive name from the 'title' attribute
                let fullProvinceName = event.target.getAttribute('title'); 
                
                // If the title is empty (common issue with imported SVGs), use the data-province as a fallback
                if (!fullProvinceName) {
                    const dataName = event.target.dataset.province;
                    if (dataName) {
                        // Capitalize and format the data-province name (e.g., 'north_western' -> 'NORTH WESTERN')
                        fullProvinceName = dataName.replace(/_/g, ' ').toUpperCase() + " (Fallback)";
                    }
                }
                
                if (fullProvinceName) {
                    provinceNameDisplay.textContent = fullProvinceName;
                    provinceNameDisplay.style.backgroundColor = '#0080ff'; // Brighter blue hover color
                }
            });

            // --- 3. Mouseout (Hover Out) Event ---
            path.addEventListener('mouseout', () => {
                // Reset display text and color
                provinceNameDisplay.textContent = defaultDisplayMessage; 
                provinceNameDisplay.style.backgroundColor = defaultDisplayColor; 
            });
        });
    } else {
        console.error("Critical error: Map SVG (#sri-lanka-map) or the display element (#province-name-display) not found in the HTML.");
    }
});