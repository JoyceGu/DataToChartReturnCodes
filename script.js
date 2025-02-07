// Add your JavaScript code here
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

function updateButtonStates() {
    const table = document.getElementById('dataTable');
    const columnCount = table.rows[0].cells.length;
    const removeColumnBtn = document.getElementById('removeColumn');
    const addColumnBtn = document.getElementById('addColumn');
    const columnCountDisplay = document.getElementById('columnCount');
    
    removeColumnBtn.disabled = columnCount <= 1;
    addColumnBtn.disabled = columnCount >= 10;
    columnCountDisplay.textContent = columnCount;
}

function parseCSV(csvData) {
    const lines = csvData.trim().split(/\r?\n/);
    if (lines.length < 2) {
        throw new Error('Data must contain at least headers and one row');
    }

    // 检测分隔符
    const firstLine = lines[0];
    let separator;
    if (firstLine.includes('\t')) {
        separator = '\t';
    } else if (firstLine.includes(',')) {
        separator = ',';
    } else {
        separator = /\s+/;
    }

    // 解析表头和数据
    const headers = lines[0].split(separator).filter(h => h.trim());
    const result = [];

    // 处理每一行数据
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // 跳过空行

        const values = line.split(separator).map(v => v.trim());
        if (values.length !== headers.length) {
            console.warn(`Skipping line ${i + 1}: column count mismatch`);
            continue;
        }

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index];
        });
        result.push(row);
    }

    if (result.length === 0) {
        throw new Error('No valid data rows found');
    }

    return result;
}

function updateTable(data) {
    if (!Array.isArray(data) || data.length === 0) {
        alert('Invalid data format');
        return;
    }

    const table = document.getElementById('dataTable');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // 清空现有内容
    thead.innerHTML = '';
    tbody.innerHTML = '';
    
    // 添加表头
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.classList.add('editable');
        makeEditable(th);
        thead.appendChild(th);
    });
    
    // 添加数据行
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header] || ' ';
            td.classList.add('editable');
            makeEditable(td);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    // 更新列计数
    updateButtonStates();
}

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    const table = document.getElementById('dataTable');
    const addColumnBtn = document.getElementById('addColumn');
    const removeColumnBtn = document.getElementById('removeColumn');
    
    // 初始化文本框的placeholder
    const pasteArea = document.getElementById('pasteArea');
    pasteArea.placeholder = 
`Please paste your user growth data in the following format:
Date        Users
2024-01     1000
2024-02     1200
2024-03     1500
...`;
    
    // Initialize existing cells
    table.querySelectorAll('th, td').forEach(cell => {
        makeEditable(cell);
        if (cell.tagName === 'TD' && !cell.textContent.trim()) {
            cell.textContent = ' ';
        }
    });
    
    // Add column button
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
                    cell.textContent = ' ';
                }
                makeEditable(cell);
                row.appendChild(cell);
            });
        }
        
        updateButtonStates();
    });
    
    // Remove column button
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
    
    // Initial button states
    updateButtonStates();
});

// Process Data button
document.getElementById('processData').addEventListener('click', function() {
    const pastedData = document.getElementById('pasteArea').value;
    if (!pastedData.trim()) {
        alert('Please paste data first');
        return;
    }

    try {
        const data = parseCSV(pastedData);
        if (data && data.length > 0) {
            updateTable(data);
        } else {
            alert('Invalid data format');
        }
    } catch (error) {
        alert(error.message);
        console.error('Error:', error);
    }
});

// Analysis method change
document.getElementById('analysisMethod').addEventListener('change', function(e) {
    const pasteArea = document.getElementById('pasteArea');
    
    // 根据选择的分析方法更新提示文本
    switch(e.target.value) {
        case 'linear_chart':
            pasteArea.placeholder = 
`Please paste your user growth data in the following format:
Date        Users
2024-01     1000
2024-02     1200
2024-03     1500
...`;
            break;
        case 'linear_regression':
            pasteArea.placeholder = 
`Please paste your historical data for prediction:
Month       Users
1           1000
2           1200
3           1500
...`;
            break;
        case 'funnel_chart':
            pasteArea.placeholder = 
`Please paste your conversion data:
Stage       Users
Visit       10000
Register    5000
Purchase    1000
...`;
            break;
        case 'distribution_heatmap':
            pasteArea.placeholder = 
`Please paste your user demographics data:
Location    Device      Users
US          Mobile      5000
US          Desktop     3000
EU          Mobile      4000
...`;
            break;
        case 'ab_test':
            pasteArea.placeholder = 
`Please paste your A/B test results:
Group       Conversions Total
Control     500         10000
Test        550         10000
...`;
            break;
        // 可以继续添加其他分析方法的示例数据格式
        default:
            pasteArea.placeholder = "Paste your data here...";
    }
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
    const selectedMethod = document.getElementById('analysisMethod').value;
    
    if (selectedMethod === 'linear_chart') {
        createChart('line', data, 'User Growth Trend');
        return;
    }
    
    const columnTypes = analyzeColumnTypes(data.data);
    const numericColumns = columnTypes.filter(type => type === 'numeric').length;
    const categoricalColumns = columnTypes.filter(type => type === 'categorical').length;
    
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
    
    // 直接使用实际数据
    createChart(chartType, data, title);
}

// Global chart instance
let currentChart = null;

// 修改 COLOR_PALETTES 对象，添加两个新的主题
const COLOR_PALETTES = {
    colorblind: {
        name: 'Colorblind Friendly',
        colors: [
            '#1f77b4',  // 蓝色
            '#ff7f0e',  // 橙色
            '#2ca02c',  // 绿色
            '#d62728',  // 红色
            '#9467bd',  // 紫色
            '#8c564b',  // 棕色
            '#e377c2',  // 粉色
            '#7f7f7f',  // 灰色
            '#bcbd22',  // 黄绿色
            '#17becf'   // 青色
        ],
        getColor: function(index) {
            return this.colors[index % this.colors.length];
        },
        getColorWithOpacity: function(index, opacity = 0.7) {
            const color = this.colors[index % this.colors.length];
            return color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        },
        getColors: function(count) {
            return Array.from({length: count}, (_, i) => this.getColor(i));
        }
    },
    vibrant: {
        name: 'Vibrant Theme',
        colors: [
            '#FF6B6B',  // 鲜红
            '#4ECDC4',  // 青绿
            '#45B7D1',  // 天蓝
            '#96CEB4',  // 薄荷
            '#FFEEAD',  // 米黄
            '#FFD93D',  // 金黄
            '#6C5B7B',  // 深紫
            '#F7A072',  // 橙粉
            '#C06C84',  // 玫瑰
            '#35477D'   // 靛蓝
        ],
        getColor: function(index) {
            return this.colors[index % this.colors.length];
        },
        getColorWithOpacity: function(index, opacity = 0.7) {
            const color = this.colors[index % this.colors.length];
            return color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        },
        getColors: function(count) {
            return Array.from({length: count}, (_, i) => this.getColor(i));
        }
    },
    pastel: {
        name: 'Soft Pastel',
        colors: [
            '#FFB5B5',  // 粉红
            '#B5D8FF',  // 淡蓝
            '#B5FFB5',  // 淡绿
            '#FFE5B5',  // 杏色
            '#E5B5FF',  // 淡紫
            '#B5FFE5',  // 薄荷
            '#FFB5E5',  // 浅粉
            '#D1D1D1',  // 浅灰
            '#E5FFB5',  // 淡黄
            '#B5FFF6'   // 浅青
        ],
        getColor: function(index) {
            return this.colors[index % this.colors.length];
        },
        getColorWithOpacity: function(index, opacity = 0.7) {
            const color = this.colors[index % this.colors.length];
            return color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        },
        getColors: function(count) {
            return Array.from({length: count}, (_, i) => this.getColor(i));
        }
    },
    dark: {
        name: 'Dark Theme',
        colors: [
            '#2C3E50',  // 深蓝灰
            '#E74C3C',  // 深红
            '#27AE60',  // 深绿
            '#8E44AD',  // 深紫
            '#F39C12',  // 深橙
            '#16A085',  // 深青
            '#D35400',  // 赤褐
            '#7F8C8D',  // 深灰
            '#2980B9',  // 深蓝
            '#C0392B'   // 暗红
        ],
        getColor: function(index) {
            return this.colors[index % this.colors.length];
        },
        getColorWithOpacity: function(index, opacity = 0.7) {
            const color = this.colors[index % this.colors.length];
            return color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
        },
        getColors: function(count) {
            return Array.from({length: count}, (_, i) => this.getColor(i));
        }
    }
};

// 当前使用的颜色主题
let currentPalette = COLOR_PALETTES.colorblind;

// Function to create chart
function createChart(chartType, data, title) {
    const chartArea = document.getElementById('chartArea');
    const chartTitle = document.getElementById('chartTitle');
    const pythonCode = document.getElementById('pythonCode');
    const copyBtn = document.getElementById('copyCode');
    const ctx = document.getElementById('myChart').getContext('2d');
    
    // Destroy existing chart if any
    if (currentChart) {
        currentChart.destroy();
    }
    
    chartArea.style.display = 'block';
    pythonCode.style.display = 'block';
    chartTitle.textContent = title;
    
    // Create chart configuration
    const chartConfig = createChartConfig(chartType, data);
    
    // Create new chart
    currentChart = new Chart(ctx, chartConfig);
    
    // Reset code block
    document.getElementById('codeBlock').textContent = '';
    copyBtn.style.display = 'none';
    
    // Initialize generate code button
    initializeGenerateButton(chartType, data);
}

// Function to create chart configuration
function createChartConfig(chartType, data) {
    const { headers, data: values } = data;
    
    // 基础配置
    const baseOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            annotation: {
                annotations: {}  // 初始化空的注释对象
            }
        }
    };
    
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
                        backgroundColor: currentPalette.getColorWithOpacity(0),
                        borderColor: currentPalette.getColor(0)
                    }]
                },
                options: {
                    ...baseOptions,
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
                        backgroundColor: aggregatedData.labels.map((_, i) => 
                            currentPalette.getColorWithOpacity(i)
                        ),
                        borderColor: aggregatedData.labels.map((_, i) => 
                            currentPalette.getColor(i)
                        )
                    }]
                },
                options: {
                    ...baseOptions,
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
                    ...baseOptions,
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
            
        case 'pie':
            const pieData = aggregateData(values, headers);
            return {
                type: 'pie',
                data: {
                    labels: pieData.labels,
                    datasets: [{
                        data: pieData.values,
                        backgroundColor: currentPalette.getColors(pieData.labels.length),
                        borderColor: 'white',
                        borderWidth: 1
                    }]
                },
                options: {
                    ...baseOptions,
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
            
        case 'line':
            return {
                type: 'line',
                data: {
                    labels: values.map(row => row[0]),
                    datasets: [{
                        label: headers[1],
                        data: values.map(row => parseFloat(row[1])),
                        borderColor: currentPalette.getColor(0),
                        backgroundColor: currentPalette.getColorWithOpacity(0, 0.2),
                        fill: true
                    }]
                },
                options: {
                    ...baseOptions,
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
                    ...baseOptions,
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
    
    // 添加数据部分
    code += '# Create DataFrame\n';
    code += `df = pd.DataFrame(${JSON.stringify(values)}, columns=${JSON.stringify(headers)})\n\n`;
    
    // 添加颜色主题部分
    code += '# Set color theme\n';
    code += `colors = ${JSON.stringify(currentPalette.colors)}\n`;
    code += 'plt.style.use("seaborn")\n\n';
    
    // 创建图表
    code += '# Create figure and axis\n';
    code += 'fig, ax = plt.subplots(figsize=(10, 6))\n\n';
    
    // 根据图表类型生成代码
    switch (chartType) {
        case 'scatter':
            code += '# Create scatter plot\n';
            code += `sns.scatterplot(data=df, x='${headers[0]}', y='${headers[1]}', color='${currentPalette.getColor(0)}')\n`;
            break;
            
        case 'bar':
            code += '# Create bar plot\n';
            code += `sns.barplot(data=df, x='${headers[0]}', y='${headers[1]}', palette=colors)\n`;
            break;
            
        case 'line':
            code += '# Create line plot\n';
            code += `ax.plot(df['${headers[0]}'], df['${headers[1]}'], color='${currentPalette.getColor(0)}', linewidth=2)\n`;
            code += `ax.fill_between(df['${headers[0]}'], df['${headers[1]}'], alpha=0.2, color='${currentPalette.getColor(0)}')\n`;
            break;
            
        case 'pie':
            code += '# Create pie chart\n';
            code += `plt.pie(df['${headers[1]}'], labels=df['${headers[0]}'], colors=colors, autopct='%1.1f%%')\n`;
            break;
    }
    
    // 添加注释
    if (currentChart && currentChart.options.plugins.annotation && 
        currentChart.options.plugins.annotation.annotations) {
        const annotations = currentChart.options.plugins.annotation.annotations;
        if (Object.keys(annotations).length > 0) {
            code += '\n# Add annotations\n';
            Object.values(annotations).forEach(annotation => {
                if (annotation.type === 'line') {
                    code += `ax.axvline(x=${annotation.xMin}, color='black', linestyle='--', alpha=0.5)\n`;
                } else if (annotation.type === 'label') {
                    code += `ax.annotate('${annotation.content}', xy=(${annotation.xValue}, ${annotation.yValue}),` +
                           ` xytext=(5, 5), textcoords='offset points', bbox=dict(facecolor='white', alpha=0.8))\n`;
                }
            });
        }
    }
    
    // 添加标题和标签
    code += '\n# Customize plot\n';
    code += `plt.title("${currentChart ? currentChart.options.plugins.title.text || 'Data Visualization' : 'Data Visualization'}")\n`;
    code += `plt.xlabel("${headers[0]}")\n`;
    code += `plt.ylabel("${headers[1]}")\n\n`;
    
    // 显示图表
    code += '# Show plot\n';
    code += 'plt.tight_layout()\n';
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
                // 直接使用实际数据，不再生成虚拟数据
                createChart(chartType, data, `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`);
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

// 修改颜色主题选择器的事件处理部分
document.getElementById('pickPalette').addEventListener('click', function() {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    const picker = document.createElement('div');
    picker.className = 'palette-picker';
    picker.innerHTML = `
        <h3>Select Color Theme</h3>
        <div class="palette-grid">
            ${Object.entries(COLOR_PALETTES).map(([key, palette]) => `
                <div class="palette-option ${currentPalette === palette ? 'active' : ''}" data-palette="${key}">
                    <div class="color-preview">
                        ${palette.colors.slice(0, 5).map(color => 
                            `<span style="background-color: ${color}"></span>`
                        ).join('')}
                    </div>
                    <span class="palette-name">${palette.name}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    document.body.appendChild(picker);
    
    // 修改选择事件
    picker.querySelectorAll('.palette-option').forEach(option => {
        option.onclick = function() {
            const paletteKey = this.dataset.palette;
            currentPalette = COLOR_PALETTES[paletteKey];
            // 如果有当前图表，使用新的颜色主题重新渲染
            if (currentChart) {
                const chartType = currentChart.config.type;
                const data = getTableData();
                // 直接使用实际数据重新渲染图表
                createChart(chartType, data, chartTitle.textContent);
            }
            hidePalettePicker();
        };
    });
    
    overlay.onclick = hidePalettePicker;
    
    function hidePalettePicker() {
        if (overlay) {
            overlay.style.display = 'none';
            document.body.removeChild(overlay);
        }
        document.body.removeChild(picker);
    }
});

// 添加注释功能
document.getElementById('addAnnotation').addEventListener('click', function() {
    if (!currentChart) {
        alert('Please create a chart first!');
        return;
    }

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    
    const annotationPicker = document.createElement('div');
    annotationPicker.className = 'annotation-picker';
    annotationPicker.innerHTML = `
        <div class="annotation-header">
            <h3>Add Annotation</h3>
            <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="annotation-types">
            <button class="annotation-type-btn" data-type="line">
                <i class="fas fa-grip-lines-vertical"></i>
                Vertical Line
            </button>
            <button class="annotation-type-btn" data-type="text">
                <i class="fas fa-font"></i>
                Text Label
            </button>
            <button class="annotation-type-btn" data-type="manage">
                <i class="fas fa-list"></i>
                Manage
            </button>
        </div>
        <div class="annotation-form" style="display: none;">
            <div class="form-group">
                <label for="x-value">X Value:</label>
                <input type="text" id="x-value" placeholder="Enter X coordinate">
            </div>
            <div class="form-group y-input">
                <label for="y-value">Y Value:</label>
                <input type="text" id="y-value" placeholder="Enter Y coordinate">
            </div>
            <div class="form-group text-input" style="display: none;">
                <label for="annotation-text">Text:</label>
                <input type="text" id="annotation-text" placeholder="Enter annotation text">
            </div>
            <button class="add-btn">Add</button>
        </div>
        <div class="annotation-list" style="display: none;">
            <div class="annotation-items"></div>
        </div>
    `;
    
    document.body.appendChild(annotationPicker);
    
    let annotationType = '';
    
    // 选择注释类型
    annotationPicker.querySelectorAll('.annotation-type-btn').forEach(btn => {
        btn.onclick = function() {
            annotationType = this.dataset.type;
            if (annotationType === 'manage') {
                showAnnotationList();
            } else {
                annotationPicker.querySelector('.annotation-form').style.display = 'block';
                annotationPicker.querySelector('.annotation-list').style.display = 'none';
                annotationPicker.querySelector('.text-input').style.display = 
                    annotationType === 'text' ? 'block' : 'none';
                annotationPicker.querySelector('.y-input').style.display = 
                    annotationType === 'text' ? 'block' : 'none';
            }
        };
    });
    
    // 添加注释
    annotationPicker.querySelector('.add-btn').onclick = function() {
        const xValue = parseFloat(document.getElementById('x-value').value);
        const yValue = parseFloat(document.getElementById('y-value').value);
        const text = document.getElementById('annotation-text').value;
        
        if (isNaN(xValue)) {
            alert('Please enter a valid X value');
            return;
        }
        
        if (annotationType === 'line') {
            addVerticalLine(xValue);
        } else if (annotationType === 'text') {
            if (isNaN(yValue)) {
                alert('Please enter a valid Y value');
                return;
            }
            if (!text) {
                alert('Please enter annotation text');
                return;
            }
            addTextAnnotation(xValue, yValue, text);
        }
        
        hideAnnotationPicker();
    };
    
    // 添加关闭按钮的事件监听
    annotationPicker.querySelector('.close-btn').onclick = hideAnnotationPicker;
    
    function hideAnnotationPicker() {
        overlay.style.display = 'none';
        document.body.removeChild(overlay);
        document.body.removeChild(annotationPicker);
    }
    
    function addVerticalLine(x) {
        const annotation = {
            type: 'line',
            xMin: x,
            xMax: x,
            yMin: 'bottom',
            yMax: 'top',
            borderColor: 'rgba(0, 0, 0, 0.5)',
            borderWidth: 2,
            borderDash: [5, 5],
        };
        
        if (!currentChart.options.plugins.annotation) {
            currentChart.options.plugins.annotation = {
                annotations: {}
            };
        }
        
        const annotationKey = `vline${Date.now()}`;
        currentChart.options.plugins.annotation.annotations[annotationKey] = annotation;
        currentChart.update('none');
    }
    
    function addTextAnnotation(x, y, text) {
        const annotation = {
            type: 'label',
            xValue: x,
            yValue: y,
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            content: text,
            font: {
                size: 12
            },
            padding: 4
        };
        
        if (!currentChart.options.plugins.annotation) {
            currentChart.options.plugins.annotation = {
                annotations: {}
            };
        }
        
        const annotationKey = `text${Date.now()}`;
        currentChart.options.plugins.annotation.annotations[annotationKey] = annotation;
        currentChart.update('none'); // 使用 'none' 来避免动画
    }

    // 修改 showAnnotationList 函数定义，将其移到内部
    function showAnnotationList() {
        const listContainer = annotationPicker.querySelector('.annotation-items');
        const annotations = currentChart.options.plugins.annotation.annotations || {};
        annotationPicker.querySelector('.annotation-form').style.display = 'none';
        annotationPicker.querySelector('.annotation-list').style.display = 'block';
        
        listContainer.innerHTML = '';
        
        if (Object.keys(annotations).length === 0) {
            listContainer.innerHTML = '<p class="no-annotations">No annotations yet</p>';
            return;
        }
        
        Object.entries(annotations).forEach(([key, annotation]) => {
            const item = document.createElement('div');
            item.className = 'annotation-item';
            
            let description;
            if (annotation.type === 'line') {
                description = `Vertical line at x = ${annotation.xMin}`;
            } else if (annotation.type === 'label') {
                description = `Text "${annotation.content}" at (${annotation.xValue}, ${annotation.yValue})`;
            }
            
            item.innerHTML = `
                <span class="annotation-desc">${description}</span>
                <button class="delete-btn" data-key="${key}">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            
            listContainer.appendChild(item);
        });
        
        // 添加删除按钮的事件监听
        listContainer.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = function() {
                const key = this.dataset.key;
                delete currentChart.options.plugins.annotation.annotations[key];
                currentChart.update('none');
                showAnnotationList(); // 刷新列表
            };
        });
    }
});

// Function to initialize generate code button
function initializeGenerateButton(chartType, data) {
    const generateBtn = document.getElementById('generateCode');
    const copyBtn = document.getElementById('copyCode');
    const codeBlock = document.getElementById('codeBlock');
    
    generateBtn.onclick = function() {
        // Generate and display Python code
        const pythonCode = generatePythonCode(chartType, data);
        codeBlock.textContent = pythonCode;
        
        // Show copy button
        copyBtn.style.display = 'flex';
        
        // Initialize copy button
        initializeCopyButton();
    };
} 