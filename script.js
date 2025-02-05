// Add your JavaScript code here
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    const table = document.getElementById('dataTable');
    const addColumnBtn = document.getElementById('addColumn');
    const removeColumnBtn = document.getElementById('removeColumn');
    const columnCountDisplay = document.getElementById('columnCount');
    
    // Make cells editable
    function makeEditable(cell) {
        cell.addEventListener('dblclick', function() {
            if (cell.classList.contains('editing')) return;
            
            const currentText = cell.textContent;
            cell.classList.add('editing');
            
            const input = document.createElement('input');
            input.value = currentText;
            cell.textContent = '';
            cell.appendChild(input);
            input.focus();
            
            function saveEdit() {
                const newText = input.value.trim();
                cell.classList.remove('editing');
                cell.textContent = newText || ' '; // Use space if empty to maintain height
            }
            
            input.addEventListener('blur', saveEdit);
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    saveEdit();
                } else if (e.key === 'Escape') {
                    cell.classList.remove('editing');
                    cell.textContent = currentText;
                }
            });
        });
    }
    
    // Initialize existing cells
    table.querySelectorAll('th, td').forEach(cell => {
        makeEditable(cell);
        if (cell.tagName === 'TD' && !cell.textContent.trim()) {
            cell.textContent = ' '; // Add space to empty cells to maintain height
        }
    });
    
    // Modified Add column function
    addColumnBtn.addEventListener('click', function() {
        const rows = table.querySelectorAll('tr');
        const columnCount = rows[0].cells.length;
        
        if (columnCount < 10) {
            rows.forEach((row, index) => {
                const cell = document.createElement(index === 0 ? 'th' : 'td');
                if (index === 0) {
                    cell.textContent = `Column ${columnCount + 1}`;
                    cell.classList.add('editable');
                    cell.title = 'Double click to edit';
                } else {
                    cell.textContent = ' '; // Add space to maintain height
                }
                makeEditable(cell);
                row.appendChild(cell);
            });
        }
        
        updateButtonStates();
    });
    
    // Remove column function
    removeColumnBtn.addEventListener('click', function() {
        const rows = table.querySelectorAll('tr');
        const columnCount = rows[0].cells.length;
        
        if (columnCount > 1) {
            rows.forEach(row => {
                row.deleteCell(-1);
            });
        }
        
        updateButtonStates();
    });
    
    // Updated button states function
    function updateButtonStates() {
        const columnCount = table.rows[0].cells.length;
        removeColumnBtn.disabled = columnCount <= 1;
        addColumnBtn.disabled = columnCount >= 10;
        columnCountDisplay.textContent = columnCount;
    }
    
    // Initial button states
    updateButtonStates();
});

// Add chart recommendation functionality
document.getElementById('recommendChart').addEventListener('click', function() {
    // 获取表格数据
    const data = getTableData();
    if (!validateData(data)) {
        alert('Please enter some data in the table first!');
        return;
    }
    
    // 分析数据类型并推荐图表
    recommendChartType(data);
});

// Add chart picking functionality
document.getElementById('pickChart').addEventListener('click', function() {
    // 显示图表选择界面
    showChartPicker();
});

// Helper function to get table data
function getTableData() {
    const table = document.getElementById('dataTable');
    const headers = [];
    const data = [];
    
    // Get headers
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(cell => headers.push(cell.textContent.trim()));
    
    // Get data
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const rowData = [];
        row.querySelectorAll('td').forEach(cell => {
            rowData.push(cell.textContent.trim());
        });
        if (rowData.some(cell => cell !== '')) {
            data.push(rowData);
        }
    });
    
    return { headers, data };
}

// Helper function to validate data
function validateData(data) {
    return data.headers.length > 0 && data.data.length > 0;
}

// Function to generate dummy data based on sample data
function generateDummyData(sampleData) {
    const { headers, data } = sampleData;
    const dummyData = [];
    const columnTypes = analyzeColumnTypes(data);
    
    // Generate 100 rows of dummy data
    for (let i = 0; i < 100; i++) {
        const row = [];
        headers.forEach((header, index) => {
            const columnType = columnTypes[index];
            row.push(generateDummyValue(columnType, data.map(r => r[index])));
        });
        dummyData.push(row);
    }
    
    return { headers, data: dummyData };
}

// Function to analyze column types
function analyzeColumnTypes(data) {
    const columnTypes = [];
    if (data.length === 0) return columnTypes;
    
    for (let col = 0; col < data[0].length; col++) {
        const columnValues = data.map(row => row[col]).filter(val => val !== '');
        columnTypes.push(determineColumnType(columnValues));
    }
    
    return columnTypes;
}

// Function to determine column type
function determineColumnType(values) {
    const numericCount = values.filter(v => !isNaN(v) && v !== '').length;
    const dateCount = values.filter(v => !isNaN(Date.parse(v))).length;
    
    if (numericCount / values.length > 0.8) return 'numeric';
    if (dateCount / values.length > 0.8) return 'date';
    return 'categorical';
}

// Function to generate dummy value based on type and sample values
function generateDummyValue(type, sampleValues) {
    const validSamples = sampleValues.filter(v => v !== '');
    if (validSamples.length === 0) return '';
    
    switch (type) {
        case 'numeric':
            const numbers = validSamples.map(Number);
            const mean = numbers.reduce((a, b) => a + b) / numbers.length;
            const std = Math.sqrt(numbers.reduce((a, b) => a + Math.pow(b - mean, 2)) / numbers.length);
            return (mean + std * (Math.random() * 2 - 1)).toFixed(2);
            
        case 'date':
            const dates = validSamples.map(d => new Date(d));
            const minDate = Math.min(...dates);
            const maxDate = Math.max(...dates);
            const randomDate = new Date(minDate + Math.random() * (maxDate - minDate));
            return randomDate.toISOString().split('T')[0];
            
        case 'categorical':
            return validSamples[Math.floor(Math.random() * validSamples.length)];
    }
}

// Function to recommend chart type
function recommendChartType(data) {
    const columnTypes = analyzeColumnTypes(data.data);
    const numericColumns = columnTypes.filter(type => type === 'numeric').length;
    const categoricalColumns = columnTypes.filter(type => type === 'categorical').length;
    
    // Generate dummy data
    const fullData = generateDummyData(data);
    
    let chartType;
    let title;
    
    if (numericColumns >= 2) {
        chartType = 'scatter';
        title = 'Scatter Plot of Numeric Relationships';
    } else if (numericColumns === 1 && categoricalColumns === 1) {
        chartType = 'bar';
        title = 'Bar Chart of Categories vs Values';
    } else if (numericColumns === 1) {
        chartType = 'histogram';
        title = 'Distribution of Values';
    } else if (categoricalColumns >= 1) {
        chartType = 'pie';
        title = 'Distribution of Categories';
    }
    
    createChart(chartType, fullData, title);
}

// Global chart instance
let currentChart = null;

// Function to create chart
function createChart(chartType, data, title) {
    const chartArea = document.getElementById('chartArea');
    const chartTitle = document.getElementById('chartTitle');
    const codeBlock = document.getElementById('codeBlock');
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Destroy existing chart if any
    if (currentChart) {
        currentChart.destroy();
    }
    
    chartArea.style.display = 'block';
    chartTitle.textContent = title;
    
    // Create chart configuration
    const chartConfig = createChartConfig(chartType, data);
    
    // Create new chart
    currentChart = new Chart(ctx, chartConfig);
    
    // Generate and display Python code
    const pythonCode = generatePythonCode(chartType, data);
    codeBlock.textContent = pythonCode;
    
    // Initialize copy button
    initializeCopyButton();
}

// Function to create chart configuration
function createChartConfig(chartType, data) {
    const { headers, data: values } = data;
    
    switch (chartType) {
        case 'scatter':
            return {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Data Points',
                        data: values.map(row => ({
                            x: parseFloat(row[0]),
                            y: parseFloat(row[1])
                        })),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: headers[0]
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: headers[1]
                            }
                        }
                    }
                }
            };
            
        case 'bar':
            const aggregatedData = aggregateData(values, headers);
            return {
                type: 'bar',
                data: {
                    labels: aggregatedData.labels,
                    datasets: [{
                        label: headers[1],
                        data: aggregatedData.values,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
            
        case 'histogram':
            const binned = createHistogramBins(values.map(row => parseFloat(row[0])));
            return {
                type: 'bar',
                data: {
                    labels: binned.labels,
                    datasets: [{
                        label: 'Frequency',
                        data: binned.counts,
                        backgroundColor: 'rgba(54, 162, 235, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
            
        case 'pie':
            const pieData = aggregateData(values, headers);
            return {
                type: 'pie',
                data: {
                    labels: pieData.labels,
                    datasets: [{
                        data: pieData.values,
                        backgroundColor: generateColors(pieData.labels.length)
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
            
        case 'line':
            return {
                type: 'line',
                data: {
                    labels: values.map(row => row[0]),
                    datasets: [{
                        label: headers[1],
                        data: values.map(row => parseFloat(row[1])),
                        borderColor: 'rgba(54, 162, 235, 1)',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
            
        case 'box':
            const boxplotData = calculateBoxPlotData(values.map(row => parseFloat(row[0])));
            return {
                type: 'boxplot',
                data: {
                    labels: [headers[0]],
                    datasets: [{
                        data: [boxplotData]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            };
    }
}

// Helper function to aggregate data for bar and pie charts
function aggregateData(values, headers) {
    const aggregated = values.reduce((acc, row) => {
        const key = row[0];
        const value = parseFloat(row[1]) || 0;
        acc[key] = (acc[key] || 0) + value;
        return acc;
    }, {});
    
    return {
        labels: Object.keys(aggregated),
        values: Object.values(aggregated)
    };
}

// Helper function to create histogram bins
function createHistogramBins(values) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binCount = Math.ceil(Math.sqrt(values.length));
    const binWidth = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < binCount; i++) {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        binLabels.push(`${binStart.toFixed(2)} - ${binEnd.toFixed(2)}`);
    }
    
    values.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binWidth), binCount - 1);
        bins[binIndex]++;
    });
    
    return {
        labels: binLabels,
        counts: bins
    };
}

// Helper function to generate colors for pie chart
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const hue = (i * 360 / count) % 360;
        colors.push(`hsla(${hue}, 70%, 60%, 0.7)`);
    }
    return colors;
}

// Function to initialize copy button
function initializeCopyButton() {
    const copyBtn = document.getElementById('copyCode');
    copyBtn.addEventListener('click', function() {
        const code = document.getElementById('codeBlock').textContent;
        navigator.clipboard.writeText(code).then(() => {
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                this.innerHTML = originalText;
            }, 2000);
        });
    });
}

// Function to generate Python code
function generatePythonCode(chartType, data) {
    const { headers, data: values } = data;
    let code = 'import pandas as pd\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\n';
    code += '# Create DataFrame\n';
    code += `df = pd.DataFrame(${JSON.stringify(values)}, columns=${JSON.stringify(headers)})\n\n`;
    
    switch (chartType) {
        case 'scatter':
            code += '# Create scatter plot\n';
            code += `plt.figure(figsize=(10, 6))\n`;
            code += `sns.scatterplot(data=df, x='${headers[0]}', y='${headers[1]}')\n`;
            break;
            
        case 'bar':
            code += '# Create bar plot\n';
            code += `plt.figure(figsize=(10, 6))\n`;
            code += `sns.barplot(data=df, x='${headers[0]}', y='${headers[1]}')\n`;
            break;
            
        case 'histogram':
            code += '# Create histogram\n';
            code += `plt.figure(figsize=(10, 6))\n`;
            code += `sns.histplot(data=df, x='${headers[0]}')\n`;
            break;
            
        case 'pie':
            code += '# Create pie chart\n';
            code += `plt.figure(figsize=(10, 6))\n`;
            code += `df['${headers[0]}'].value_counts().plot(kind='pie')\n`;
            break;
    }
    
    code += '\nplt.title("Data Visualization")\n';
    code += 'plt.show()';
    
    return code;
}

// Function to show chart picker
function showChartPicker() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    const picker = document.getElementById('chartPicker');
    overlay.style.display = 'block';
    picker.style.display = 'block';
    
    const options = picker.querySelectorAll('.chart-option');
    options.forEach(option => {
        option.onclick = function() {
            const chartType = this.dataset.type;
            const data = getTableData();
            if (validateData(data)) {
                const fullData = generateDummyData(data);
                createChart(chartType, fullData, `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`);
                hideChartPicker();
            } else {
                alert('Please enter some data in the table first!');
            }
        };
    });
    
    overlay.onclick = hideChartPicker;
}

// Function to hide chart picker
function hideChartPicker() {
    const overlay = document.querySelector('.overlay');
    const picker = document.getElementById('chartPicker');
    if (overlay) {
        overlay.style.display = 'none';
        document.body.removeChild(overlay);
    }
    picker.style.display = 'none';
} 