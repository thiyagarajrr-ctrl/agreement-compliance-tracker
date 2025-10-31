// ▼▼▼ YOUR GOOGLE SHEET URL IS ADDED ▼▼▼
const googleSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8Ria-F3ylgE_a_CTsP1UaAsvo8wcVm3x97OzvHPhYgmhKwFYsU-mICuBlHYH0uhbH5baBb66SPpc2/pub?gid=0&single=true&output=csv';
// ▲▲▲ YOUR GOOGLE SHEET URL IS ADDED ▲▲▲

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
        if (!googleSheetUrl) {
             loader.innerHTML = `<div class="text-center p-8">
                <h2 class="mt-4 text-2xl font-semibold text-red-700">Project Not Configured</h2>
                <p class="text-gray-600 mt-2">Please paste your Google Sheet URL into the script.js file.</p>
            </div>`;
            return;
        }
        
        try {
            const response = await fetch(googleSheetUrl);
            
            // Check for network errors (404, 403, etc.)
            if (!response.ok) {
                throw new Error(`Network Error: ${response.status} (${response.statusText}). Please check your Google Sheet URL.`);
            }
            
            const csvText = await response.text();
            
            // Check for empty or HTML response (like a Google login page)
            if (!csvText || csvText.trim().startsWith('<')) {
                throw new Error('Fetch Error: The URL did not return a valid CSV file. It might be an HTML login page. Please re-publish your sheet.');
            }

            const jsonData = parseCSV(csvText);
            
            loadDataFromSheet(jsonData); 
            
            loader.classList.add('hidden');
            dashboardContent.classList.remove('hidden');
            dashboardContent.style.opacity = 1;

        } catch (error) {
            console.error('Error fetching or parsing data:', error); // Keep this for future
            
            // --- THIS IS THE NEW PART ---
            // Display the error message directly on the page
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

    function parseCSV(text) {
        const lines = text.split(/\r?\n/);
        if (lines.length === 0) return [];
        
        const headers = lines[0].split(',').map(header => header.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line) {
                const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                let entry = {};
                headers.forEach((header, index) => {
                    let value = values[index] ? values[index].trim() : '';
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.substring(1, value.length - 1);
                    }
                    entry[header] = value;
                });
                data.push(entry);
            }
        }
        return data;
    }

    fetchData();
    // --- END: Live Data Fetching Logic ---

    // --- ▼▼▼ THIS FUNCTION IS UPDATED WITH HEADER VALIDATION ▼▼▼ ---
    function loadDataFromSheet(sheetData) {
        if (!sheetData || sheetData.length === 0) {
            throw new Error('Data Load Error: The CSV file was parsed, but it contains no data.');
        }

        // Check for the critical headers
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
            throw new Error(`Header Mismatch Error: The script could not find these required columns: ${missingHeaders.join(', ')}. Please check your Google Sheet.`);
        }

        // If all checks pass, proceed with mapping
        masterData = sheetData.map(row => {
            return {
                email: row["Name of Employee"] || "N/A",           // FD Column
                city: row["CITY"] || "N/A",                         // P Column
                team: row["TEAM"] || "N/A",                         // Q Column
                status: row["Agreement Status Final"] || "N/A",   // FA Column
                remarksBucket: row["Bucket of Issues"] || "N/A",  // FC Column
                societyName: row["Society Name"] || "N/A",        // D Column
                product: row["Product"] || "N/A",                   // FB Column
                refId: row["Ref Id"] || "N/A",                      // M Column
                transactionDate: row["Transaction Date"] || "N/A",// N Column
                receivedAmount: row["Received Amount"] || "N/A",  // O Column
                kibanaId: row["Kibana Id"] || "N/A"                // AC Column
            };
        });
        
        initializeDashboard(); 
    }
    // --- ▲▲▲ THIS FUNCTION IS UPDATED ▲▲▲ ---

    // --- AI FUNCTIONS - YOUR KEY IS ALREADY ADDED ---
    async function callGemini(userQuery, outputElement, buttonElement) {
        buttonElement.disabled = true;
        outputElement.innerHTML = `<div class="flex items-center justify-center"><div class="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-blue-500"></div><p class="ml-3 text-gray-600">Generating... a moment please.</p></div>`;

        // ▼▼▼ YOUR API KEY IS ADDED HERE ▼▼▼
        const apiKey = "AIzaSyAIosznCFtzPI5YGlmgZWkj9ttIURVWaJU";
        // ▲▲▲ YOUR API KEY IS ADDED HERE ▲▲▲
        
        if (!apiKey) {
            outputElement.innerHTML = `<p class="text-red-500">AI feature is disabled. Please add your API key to <strong>script.js</strong>.</p>`;
            buttonElement.disabled = false;
            return null;
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
        const payload = { contents: [{ parts: [{ text: userQuery }] }] };
        
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error(`API call failed: ${response.status}`);
            
            const result = await response.json();
            const candidate = result.candidates?.[0];
            const text = candidate?.content?.parts?.[0]?.text;
            
            if (text) {
                return text;
            } else {
                throw new Error("Invalid response structure from API.");
            }
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            outputElement.innerHTML = `<p class="text-red-500">An error occurred. Please check the console.</p>`;
            return null;
        } finally {
            buttonElement.disabled = false;
        }
    }

    async function getAInsights() {
        const summaryOutput = document.getElementById('ai-summary-output');
        const emailContainer = document.getElementById('ai-email-container');
        emailContainer.classList.add('hidden');
        
        const dataSample = currentFilteredData.slice(0, 25).map(d => ({
            status: d.status, city: d.city, team: d.team, remarksBucket: d.remarksBucket, email: d.email
        }));

        const userQuery = `You are an expert compliance analyst reviewing agreement data. The following is a sample of the currently filtered data in JSON format: ${JSON.stringify(dataSample, null, 2)}\n\nBased on this data, provide a concise summary. Your summary must include: 1. An overall executive summary. 2. A bulleted list of the top 3 compliance issues from the 'remarksBucket' column. 3. A bulleted list identifying teams, cities, or employees with the most non-compliant agreements. 4. One or two actionable recommendations. Format in simple HTML using <p>, <h3>, <ul>, and <li> tags. Make headings bold.`;
        
        const summary = await callGemini(userQuery, summaryOutput, document.getElementById('generate-summary-btn'));
        if (summary) summaryOutput.innerHTML = summary;
    }

    async function draftEmail() {
        const summaryOutput = document.getElementById('ai-summary-output');
        const emailContainer = document.getElementById('ai-email-container');
        const emailOutput = document.getElementById('ai-email-output');
        summaryOutput.innerHTML = '<p>Click a button to generate AI insights based on the current filters.</p>';

        const dataSample = currentFilteredData.slice(0, 25).map(d => ({
            status: d.status, city: d.city, team: d.team, remarksBucket: d.remarksBucket, email: d.email
        }));

        const userQuery = `You are a compliance manager drafting a follow-up email about non-compliant agreements based on a filtered report. Here is a sample of the filtered data: ${JSON.stringify(dataSample, null, 2)}\n\nDraft a professional and clear email. The email should: 1. Have a clear subject line. 2. Address the relevant team(s) or a general "All Teams". 3. State the total number of non-compliant agreements found in the current view. 4. List the most common reasons for non-compliance (the top 'remarksBucket' values). 5. Politely request a review of these agreements and a corrective action plan. Do not use any HTML tags, just plain text suitable for an email body.`;
        
        const emailText = await callGemini(userQuery, summaryOutput, document.getElementById('draft-email-btn'));
        if (emailText) {
            summaryOutput.innerHTML = '<p>Email draft generated below.</p>';
            emailOutput.value = emailText;
            emailContainer.classList.remove('hidden');
        }
    }
    
    function populateFilters() {
        const cityFilter = document.getElementById('city-filter');
        const teamFilter = document.getElementById('team-filter');
        const employeeFilter = document.getElementById('employee-filter'); 
        const statusFilter = document.getElementById('status-filter');
        const remarksBucketFilter = document.getElementById('remarks-bucket-filter');

        cityFilter.innerHTML = '<option value="All">All Cities</option>';
        teamFilter.innerHTML = '<option value="All">All Teams</option>';
        employeeFilter.innerHTML = '<option value="All">All Employees</option>'; 
        statusFilter.innerHTML = '<option value="All">All Statuses</option>';
        remarksBucketFilter.innerHTML = '<option value="All">All Buckets</option>';

        const cities = [...new Set(masterData.map(item => item.city).filter(Boolean))].sort();
        const teams = [...new Set(masterData.map(item => item.team).filter(Boolean))].sort();
        const employees = [...new Set(masterData.map(item => item.email).filter(Boolean))].sort();
        const statuses = [...new Set(masterData.map(item => item.status).filter(Boolean))].sort();
        const remarksBuckets = [...new Set(masterData.map(item => item.remarksBucket).filter(b => b && b.trim() !== 'N/A' && b.trim() !== ''))].sort();

        cities.forEach(city => cityFilter.innerHTML += `<option value="${city}">${city}</option>`);
        teams.forEach(team => teamFilter.innerHTML += `<option value="${team}">${team}</option>`);
        employees.forEach(emp => employeeFilter.innerHTML += `<option value="${emp}">${emp}</option>`); 
        statuses.forEach(status => statusFilter.innerHTML += `<option value="${status}">${status}</option>`);
        remarksBuckets.forEach(bucket => remarksBucketFilter.innerHTML += `<option value="${bucket}">${bucket}</option>`);
    }

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
    
    function createOrUpdateChart(chartId, type, data, options) {
        const ctx = document.getElementById(chartId).getContext('2d');
        if (chartInstances[chartId]) {
            chartInstances[chartId].destroy();
        }
        chartInstances[chartId] = new Chart(ctx, { type, data, options });
    }

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

    function updateTeamChart(data) {
        createGroupedBarChart('teamChart', data, 'team');
    }

    function updateCityChart(data) {
        createGroupedBarChart('cityChart', data, 'city');
    }
    
    let currentTableData = [];
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
