// paper-filter.js

document.addEventListener('DOMContentLoaded', () => {
    const yearFilter = document.getElementById('filter-year');
    const termFilter = document.getElementById('filter-term');
    const provinceFilter = document.getElementById('filter-province');
    const resetButton = document.getElementById('reset-filters');
    const tableBody = document.querySelector('#papers-table tbody');
    const rows = tableBody ? tableBody.querySelectorAll('tr') : [];

    // Attach the filter function to all select inputs
    [yearFilter, termFilter, provinceFilter].forEach(filter => {
        if (filter) {
            filter.addEventListener('change', applyFilters);
        }
    });

    // Attach reset function to the button
    if (resetButton) {
        resetButton.addEventListener('click', resetFilters);
    }

    function applyFilters() {
        const selectedYear = yearFilter ? yearFilter.value : 'all';
        const selectedTerm = termFilter ? termFilter.value : 'all';
        const selectedProvince = provinceFilter ? provinceFilter.value : 'all';

        rows.forEach(row => {
            const rowYear = row.getAttribute('data-year');
            const rowTerm = row.getAttribute('data-term');
            const rowProvince = row.getAttribute('data-province');
            
            // Check if the row matches ALL active filters
            const matchesYear = (selectedYear === 'all' || rowYear === selectedYear);
            const matchesTerm = (selectedTerm === 'all' || rowTerm === selectedTerm);
            const matchesProvince = (selectedProvince === 'all' || rowProvince === selectedProvince);

            // Show or hide the row
            if (matchesYear && matchesTerm && matchesProvince) {
                row.style.display = ''; // Show the row
            } else {
                row.style.display = 'none'; // Hide the row
            }
        });
    }

    function resetFilters() {
        // Reset all select elements to their default ('all') value
        if (yearFilter) yearFilter.value = 'all';
        if (termFilter) termFilter.value = 'all';
        if (provinceFilter) provinceFilter.value = 'all';
        
        // Apply the reset filters (which will show all rows)
        applyFilters();
    }
});