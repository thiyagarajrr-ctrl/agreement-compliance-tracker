body {
    font-family: 'Inter', sans-serif;
    background-color: #f0f2f5;
}
.chart-container {
    position: relative;
    width: 100%;
    height: 350px;
    max-height: 400px;
}
.kpi-card {
    background-color: white;
    border-radius: 0.75rem;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    transition: all 0.3s ease;
}
.kpi-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
.filter-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}
#ai-summary-output ul, #ai-email-output ul {
    list-style-position: inside;
    list-style-type: disc;
    padding-left: 1rem;
}
#ai-summary-output li, #ai-email-output li {
    margin-bottom: 0.5rem;
}
