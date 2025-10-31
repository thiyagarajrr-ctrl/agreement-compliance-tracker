async function fetchData() {
    const apiUrl = 'AKfycbzLE8wLm0l0CaaXCkcB3BuIILVwOlB4toDGKUzSIuE'; // Replace with your Google Apps Script URL

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('Fetched Data:', data);

        // Process and display the data on your dashboard (e.g., populate tables, charts)
        displayData(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Function to display the data on the page (for example, display it in a table)
function displayData(data) {
    const tableBody = document.getElementById('table-body'); // Ensure you have a <tbody> with this ID in your HTML

    // Clear existing data in the table
    tableBody.innerHTML = '';

    // Loop through each row of data and display it in the table
    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tableBody.appendChild(tr);
    });
}

// Call fetchData when the page loads
window.onload = fetchData;
