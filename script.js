// ▼▼▼ This script now reads data from the Google Sheets API URL ▼▼▼
const googleSheetUrl = 'AKfycbzLE8wLm0l0CaaXCkcB3BuIILVwOlB4toDGKUzSIuE'; // Replace with your actual Google Apps Script URL
// ▲▲▲ This script now reads data from the Google Sheets API URL ▲▲▲

document.addEventListener('DOMContentLoaded', () => {
    // --- START: Global variables ---
    const CHART_COLORS = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };
    const chartInstances = {};
    let masterData = [];
    let currentFilteredData = [];
    let previousComplianceRate = 0;

    const loader = document.getElementById('loader');
    const dashboardContent = document.getElementById('dashboard-content');
    // --- END: Global variables ---

    // --- ▼▼▼ THIS FUNCTION IS UPDATED WITH ON-SCREEN ERROR REPORTING ▼▼▼ ---
    async function fetchData() {
        try {
            // This now fetches the data from Google Sheets (or another online source like GitHub Pages)
            const response = await fetch(googleSheetUrl);
            
            if (!response.ok) {
                throw new Error(`Network Error: ${response.status} (${response.statusText}). Could not fetch the data.`);
            }
            
            const jsonData = await response.json();
            
            if (!jsonData || jsonData.length === 0) {
                throw new Error('File Error: The data is empty or invalid.');
            }
            
            loadDataFromSheet(jsonData);  // Load the data into your dashboard

            loader.classList.add('hidden');
            dashboardContent.classList.remove('hidden');
            dashboardContent.style.opacity = 1;

        } catch (error) {
            console.error('Error fetching or parsing data:', error); 
            
            loader.innerHTML = `<div class="text-center p-8">
                <h2 class="mt-4 text-2xl font-semibold text-red-700">A JavaScript Error Occurred</h2>
                <p class="text-gray-600 mt-2">The dashboard cannot load. Please send a screenshot of this error.</p>
                <div class="text-left bg-red-50 p-4 mt-4 rounded-md border border-red-300" style="font-family: monospace;">
                    <strong class="text-red-800">Error Message:</strong>
                    <pre class="text-red-700 whitespace-pre-wrap">${error.message}</pre>
                </div>
            </div>`;
        }
    }
    // --- ▲▲▲ THIS FUNCTION IS UPDATED ▲▲▲ ---

    // Function to parse the JSON data and process it into a usable format
    function loadDataFromSheet(sheetData) {
        if (!sheetData || sheetData.length === 0) {
            throw new Error('Data Load Error: The data is empty.');
        }

        const headers = Object.keys(sheetData[0]);
        const requiredHeaders = [
            "Name of Employee",
            "CITY",
            "TEAM",
            "Agreement Status Final",
            "Bucket of Issues",
            "Society Name"
        ];
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
            throw new Error(`Header Mismatch Error: The script could not find these required columns: ${missingHeaders.join(', ')}. Please check your data.`);
        }

        // If all checks pass, proceed with mapping
        masterData = sheetData.map(row => {
            return {
                email: row["Name of Employee"] || "N/A",
                city: row["CITY"] || "N/A",
                team: row["TEAM"] || "N/A",
                status: row["Agreement Status Final"] || "N/A",
                remarksBucket: row["Bucket of Issues"] || "N/A",
                societyName: row["Society Name"] || "N/A",
                product: row["Product"] || "N/A",
                refId: row["Ref Id"] || "N/A",
                transactionDate: row["Transaction Date"] || "N/A",
                receivedAmount: row["Received Amount"] || "N/A",
                kibanaId: row["Kibana Id"] || "N/A"
            };
        });

        initializeDashboard(); // Update the dashboard with the fetched data
    }

    // Function to initialize the dashboard with the fetched data
    function initializeDashboard() {
        populateFilters();
        
        document.getElementById('generate-summary-btn').addEventListener('click', getAInsights);
        document.getElementById('draft-email-btn').addEventListener('click', draftEmail);
        document.getElementById('copy-email-btn').addEventListener('click', () => {
            document.getElementById('ai-email-output').select();
            document.execCommand('copy');
        });
        document.getElementById('export-csv-btn').addEventListener('click', exportTableToCSV);

        document.getElementById('city-filter').addEventListener('change', updateDashboard);
        document.getElementById('team-filter').addEventListener('change', updateDashboard);
        document.getElementById('employee-filter').addEventListener('change', updateDashboard); 
        document.getElementById('status-filter').addEventListener('change', updateDashboard);
        document.getElementById('remarks-bucket-filter').addEventListener('change', updateDashboard);
        document.getElementById('table-search').addEventListener('input', (e) => updateTable(null, e.target.value));

        updateDashboard();
    }

    // Function to update the dashboard based on filters
    function updateDashboard() {
        const city = document.getElementById('city-filter').value;
        const team = document.getElementById('team-filter').value;
        const employee = document.getElementById('employee-filter').value; 
        const status = document.getElementById('status-filter').value;
        const remarksBucket = document.getElementById('remarks-bucket-filter').value;

        currentFilteredData = masterData.filter(item => {
            return (city === 'All' || item.city === city) &&
                   (team === 'All' || item.team === team) &&
                   (employee === 'All' || item.email === employee) && 
                   (status === 'All' || item.status === status) &&
                   (remarksBucket === 'All' || item.remarksBucket === remarksBucket);
        });

        document.getElementById('ai-summary-output').innerHTML = '<p>Click a button to generate AI insights based on the current filters.</p>';
        document.getElementById('ai-email-container').classList.add('hidden');

        updateKPIs(currentFilteredData);
        updateStatusChart(currentFilteredData);
        updateRemarksChart(currentFilteredData);
        updateTeamChart(currentFilteredData);
        updateCityChart(currentFilteredData);
        updateTable(currentFilteredData);
    }

    // Function to update KPIs (Key Performance Indicators)
    function updateKPIs(data) {
        const total = data.length;
        const valid = data.filter(item => item.status && item.status.toLowerCase() === 'valid').length;
        const invalid = total - valid;
        const currentRate = total > 0 ? ((valid / total) * 100) : 0;
        
        const trendArrow = document.getElementById('trend-arrow');
        if (currentRate > previousComplianceRate) {
            trendArrow.textContent = '📈';
            trendArrow.classList.remove('text-red-500');
            trendArrow.classList.add('text-green-500');
        } else if (currentRate < previousComplianceRate) {
            trendArrow.textContent = '📉';
            trendArrow.classList.remove('text-green-500');
            trendArrow.classList.add('text-red-500');
        } else {
            trendArrow.textContent = '';
        }
        previousComplianceRate = currentRate;

        document.getElementById('total-agreements').textContent = total;
        document.getElementById('compliance-rate').textContent = `${currentRate.toFixed(1)}%`;
        document.getElementById('valid-agreements').textContent = valid;
        document.getElementById('invalid-agreements').textContent = invalid;
    }

    // Helper function to create or update charts
    function createOrUpdateChart(chartId, type, data, options) {
        const ctx = document.getElementById(chartId).getContext('2d');
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
        }
        chartInstances[chartId] = new Chart(ctx, { type, data, options });
    }

    // Function to update the status chart
    function updateStatusChart(data) {
        const statusCounts = data.reduce((acc, item) => {
            const status = item.status || 'N/A';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        const labels = Object.keys(statusCounts);
        const chartData = {
            labels: labels,
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [CHART_COLORS.green, CHART_COLORS.red, CHART_COLORS.blue, CHART_COLORS.orange, CHART_COLORS.purple, CHART_COLORS.yellow, CHART_COLORS.grey],
            }]
        };
        const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };
        createOrUpdateChart('statusChart', 'doughnut', chartData, options);
    }

    // Function to update the remarks chart
    function updateRemarksChart(data) {
        const remarksData = data
            .filter(item => item.remarksBucket && item.remarksBucket !== 'N/A' && item.remarksBucket.trim() !== '')
            .reduce((acc, item) => {
                acc[item.remarksBucket] = (acc[item.remarksBucket] || 0) + 1;
                return acc;
            }, {});
        const sortedRemarks = Object.entries(remarksData).sort((a, b) => b[1] - a[1]);
        const labels = sortedRemarks.map(entry => entry[0]);
        const values = sortedRemarks.map(entry => entry[1]);
        const chartData = {
            labels: labels,
            datasets: [{
                label: 'Issue Count',
                data: values,
                backgroundColor: CHART_COLORS.orange,
                borderColor: 'white',
                borderWidth: 1
            }]
        };
        const options = { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } };
        createOrUpdateChart('remarksChart', 'bar', chartData, options);
    }

    // Function to create a grouped bar chart (for team or city)
    function createGroupedBarChart(chartId, data, categoryKey) {
        const categories = [...new Set(data.map(item => item[categoryKey]).filter(cat => cat && cat.trim() !== 'N/A' && cat.trim() !== ''))].sort();
        const validData = [];
        const invalidData = [];
        const labels = categories.filter(cat => data.some(item => item[categoryKey] === cat));
        labels.forEach(cat => {
            const validCount = data.filter(item => item[categoryKey] === cat && item.status.toLowerCase() === 'valid').length;
            const invalidCount = data.filter(item => item[categoryKey] === cat && item.status.toLowerCase() !== 'valid').length;
            validData.push(validCount);
            invalidData.push(invalidCount);
        });
        const chartData = {
            labels: labels,
            datasets: [{
                label: 'Valid',
                data: validData,
                backgroundColor: CHART_COLORS.green,
            }, {
                label: 'Non-Compliant',
                data: invalidData,
                backgroundColor: CHART_COLORS.red,
            }]
        };
        const options = { indexAxis: 'y', responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true, beginAtZero: true }, y: { stacked: true } }, plugins: { legend: { position: 'bottom' } } };
        createOrUpdateChart(chartId, 'bar', chartData, options);
    }

    // Function to update the team chart
    function updateTeamChart(data) {
        createGroupedBarChart('teamChart', data, 'team');
    }

    // Function to update the city chart
    function updateCityChart(data) {
        createGroupedBarChart('cityChart', data, 'city');
    }
    
    let currentTableData = [];
    // Function to update the table
    function updateTable(data, searchTerm = '') {
        if (data) {
            currentTableData = data;
        }
        
        const tableBody = document.getElementById('details-table-body');
        const noDataMsg = document.getElementById('no-data-message');
        tableBody.innerHTML = '';
        
        const lowerCaseSearch = searchTerm.toLowerCase();

        const dataToRender = currentTableData.filter(item => {
            return Object.values(item).some(val => 
                String(val).toLowerCase().includes(lowerCaseSearch)
            );
        });

        if (dataToRender.length === 0) {
            noDataMsg.classList.remove('hidden');
        } else {
            noDataMsg.classList.add('hidden');
            dataToRender.slice(0, 100).forEach(item => {
                const row = `
                    <tr class="bg-white border-b hover:bg-gray-50">
                        <td class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">${item.email || 'N/A'}</td>
                        <td class="px-6 py-4">${item.societyName || 'N/A'}</td>
                        <td class="px-6 py-4">${item.city || 'N/A'}</td>
                        <td class="px-6 py-4">${item.team || 'N/A'}</td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 text-xs font-medium rounded-full ${item.status && item.status.toLowerCase() === 'valid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${item.status || 'N/A'}
                            </span>
                        </td>
                        <td class="px-6 py-4">${item.remarksBucket || 'N/A'}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        }
    }
    
    // Function to export the table data to CSV
    function exportTableToCSV() {
        const headers = ["Name of Employee", "Society Name", "City", "Team", "Status", "Bucket of Issues"];
        const rows = currentFilteredData.map(item => [
            item.email,
            `"${String(item.societyName).replace(/"/g, '""')}"`,
            item.city,
            item.team,
            item.status,
            `"${String(item.remarksBucket).replace(/"/g, '""')}"`
        ]);

        let csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "compliance_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});
