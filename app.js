document.addEventListener('DOMContentLoaded', () => {
    // --- 1. STATE AND DOM ELEMENTS ---
    let allPapers = [];
    let currentFilters = {
        subject: '',
        year: '',
        medium: ''
    };

    const selectors = {
        exam: document.getElementById('filter-exam'),
        subject: document.getElementById('filter-subject'),
        year: document.getElementById('filter-year'),
        medium: document.getElementById('filter-medium'),
        search: document.getElementById('search-bar'),
        results: document.getElementById('results-container'),
        message: document.getElementById('results-message'),
        spinner: document.getElementById('loading-spinner'),
        
        // --- UPDATED/NEW MODAL ELEMENTS ---
        modal: document.getElementById('pdf-modal'),
        iframe: document.getElementById('pdf-iframe'),
        pdfLoader: document.getElementById('pdf-loader'), // NEW: PDF Loader Spinner
        closeButton: document.querySelector('.close-button')
    };

    // --- 2. MAIN EVENT LISTENERS ---
    
    // This is the NEW starting point
    selectors.exam.addEventListener('change', handleExamChange);
    
    // These listeners filter the data *after* it's loaded
    selectors.subject.addEventListener('change', (e) => handleFilterChange('subject', e.target.value));
    selectors.year.addEventListener('change', (e) => handleFilterChange('year', e.target.value));
    selectors.medium.addEventListener('change', (e) => handleFilterChange('medium', e.target.value));
    selectors.search.addEventListener('keyup', renderResults);

    // --- 3. DATA LOADING (ON-DEMAND) ---

    async function handleExamChange(e) {
        const examName = e.target.value;
        
        // Reset everything
        allPapers = [];
        currentFilters = { subject: '', year: '', medium: '' };
        resetDropdown(selectors.subject, '-- Select Subject --');
        resetDropdown(selectors.year, '-- Select Year --');
        resetDropdown(selectors.medium, '-- Select Medium --');
        selectors.results.innerHTML = ''; // Clear old results

        if (!examName) {
            selectors.message.style.display = 'block'; // Show default message
            selectors.message.textContent = 'Please select an exam to load papers.';
            return;
        }

        // Show spinner, hide message
        selectors.message.style.display = 'none';
        selectors.spinner.style.display = 'block';

        try {
            const res = await fetch(`./data/${examName}.json`);
            if (!res.ok) {
                throw new Error(`File not found: ${examName}.json (Status: ${res.status})`);
            }
            allPapers = await res.json();
            
            // Successfully loaded! Populate the *next* dropdown
            const subjects = getUniqueValues(allPapers, 'subject');
            populateDropdown(selectors.subject, subjects, '');
            selectors.subject.disabled = false;
            
            renderResults(); // Show all papers for this exam

        } catch (e) {
            console.error("Failed to load papers:", e);
            selectors.message.style.display = 'block';
            selectors.message.textContent = `Error: Could not load papers for this exam. (File '${examName}.json' might be missing).`;
        } finally {
            selectors.spinner.style.display = 'none'; // Always hide spinner
        }
    }

    // --- 4. SUB-FILTERING ---
    // ... (handleFilterChange function remains unchanged) ...
    function handleFilterChange(filterKey, value) {
        currentFilters[filterKey] = value;

        // --- 1. Reset filters *below* the one that changed ---
        if (filterKey === 'subject') {
            currentFilters.year = '';
            currentFilters.medium = '';
            resetDropdown(selectors.medium, '-- Select Medium --');
        }
        if (filterKey === 'year') {
            currentFilters.medium = '';
        }

        // --- 2. Populate the *next* dropdown based on current filters ---
        let filteredData = allPapers;

        // Populate Years based on Subject
        if (currentFilters.subject) {
            filteredData = filteredData.filter(p => p.subject === currentFilters.subject);
            const years = getUniqueValues(filteredData, 'year');
            populateDropdown(selectors.year, years.sort((a,b) => b - a), currentFilters.year); 
            selectors.year.disabled = false;
        } else {
             resetDropdown(selectors.year, '-- Select Year --');
        }

        // Populate Mediums based on Year
        if (currentFilters.year) {
            filteredData = filteredData.filter(p => p.year.toString() === currentFilters.year);
            const mediums = getUniqueValues(filteredData, 'medium');
            populateDropdown(selectors.medium, mediums, currentFilters.medium);
            selectors.medium.disabled = false;
        } else {
            resetDropdown(selectors.medium, '-- Select Medium --');
        }

        // --- 3. Render the final results ---
        renderResults();
    }


    // --- 5. RENDERING RESULTS ---
    function renderResults() {
        let filteredPapers = allPapers;

        // Apply filters
        for (const key in currentFilters) {
            if (currentFilters[key]) {
                filteredPapers = filteredPapers.filter(paper => 
                    paper[key].toString().toLowerCase() === currentFilters[key].toLowerCase()
                );
            }
        }

        // Apply search
        const searchTerm = selectors.search.value.toLowerCase();
        if (searchTerm) {
            filteredPapers = filteredPapers.filter(paper => 
                paper.file_name.toLowerCase().includes(searchTerm) ||
                paper.subject.toLowerCase().includes(searchTerm) ||
                paper.year.toString().includes(searchTerm)
            );
        }
        
        // Display results
        selectors.results.innerHTML = ''; 
        if (filteredPapers.length === 0) {
            if(allPapers.length > 0) {
                 selectors.results.innerHTML = '<p>No papers found matching your criteria.</p>';
            } else {
                selectors.message.style.display = 'block';
                selectors.message.textContent = 'Please select an exam to load papers.';
            }
            return;
        }

        filteredPapers.forEach(paper => {
            let fileId = '';
            try {
                fileId = paper.drive_link.split('/')[5];
            } catch (e) {
                console.warn('Could not parse file ID for download link:', paper.drive_link);
            }
            const downloadLink = `https://drive.google.com/uc?export=download&id=${fileId}`;

            const paperElement = document.createElement('div');
            paperElement.className = 'paper-item';
            paperElement.innerHTML = `
                <div>
                    <h3>${paper.file_name}</h3>
                    <p><strong>Subject:</strong> ${paper.subject}</p>
                    <p><strong>Year:</strong> ${paper.year}</p>
                    <p><strong>Medium:</strong> ${paper.medium}</p>
                </div>
                <div class="button-group">
                    <button class="preview-btn" data-link="${paper.drive_link}">Preview</button>
                    ${fileId ? `<a href="${downloadLink}" class="download-btn" target="_blank" download>Download</a>` : ''}
                </div>
            `;
            selectors.results.appendChild(paperElement);
        });

        // Add event listeners to new preview buttons
        document.querySelectorAll('.preview-btn').forEach(button => {
            button.addEventListener('click', () => {
                const driveLink = button.getAttribute('data-link');
                // Pass the button element to modify its style/class (optional)
                openModal(driveLink, button); 
            });
        });
    }

    // --- 6. PDF PREVIEW MODAL (UPDATED) ---
    function openModal(driveLink, buttonElement) {
        const embedLink = driveLink.replace("/view?usp=sharing", "/preview");
        
        // 1. Set the initial state for the modal
        selectors.modal.style.display = 'block';
        selectors.iframe.style.display = 'none'; // Hide iframe content
        selectors.pdfLoader.style.display = 'block'; // Show the loading spinner
        
        if (buttonElement) {
            buttonElement.classList.add('loading'); // Add a class to the button (for styling/disabling)
            buttonElement.textContent = 'Loading...'; 
        }

        // 2. Set the source and wait for it to load
        selectors.iframe.src = embedLink;

        // Use a one-time event listener for the iframe load event
        selectors.iframe.onload = function() {
            // 3. Loading complete: hide spinner, show iframe
            selectors.pdfLoader.style.display = 'none';
            selectors.iframe.style.display = 'block';
            
            if (buttonElement) {
                buttonElement.classList.remove('loading');
                buttonElement.textContent = 'Preview';
            }

            // Clean up the onload handler
            selectors.iframe.onload = null;
        };
        
        // Handle potential errors/issues with loading the iframe
        selectors.iframe.onerror = function() {
            console.error("Failed to load PDF in iframe.");
            selectors.pdfLoader.style.display = 'none';
            selectors.iframe.style.display = 'none';
            // Optionally, display an error message in the modal content
            
            if (buttonElement) {
                buttonElement.classList.remove('loading');
                buttonElement.textContent = 'Preview';
            }
            selectors.iframe.onerror = null;
        };
    }

    function closeModal() {
        // Clean up the iframe and modal state
        selectors.iframe.src = '';
        selectors.modal.style.display = 'none';
        selectors.iframe.style.display = 'none';
        selectors.pdfLoader.style.display = 'none';
        
        // Resetting the onload and onerror handlers when closing is good practice
        selectors.iframe.onload = null;
        selectors.iframe.onerror = null;
    }

    selectors.closeButton.onclick = closeModal;
    window.onclick = function(event) {
        if (event.target == selectors.modal) {
            closeModal();
        }
    }

    // --- 7. UTILITY FUNCTIONS ---
    // ... (Utility functions remain unchanged) ...
    function getUniqueValues(arr, key) {
        return [...new Set(arr.map(item => item[key]))].sort();
    }

    function populateDropdown(selectElement, values, selectedValue) {
        selectElement.innerHTML = `<option value="">${selectElement.options[0].text}</option>`; 
        
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            selectElement.appendChild(option);
        });
        
        if (selectedValue && values.includes(selectedValue)) {
            selectElement.value = selectedValue;
        } else {
            selectElement.value = '';
        }
    }

    function resetDropdown(selectElement, defaultText) {
        selectElement.innerHTML = `<option value="">${defaultText}</option>`;
        selectElement.disabled = true;
    }
});