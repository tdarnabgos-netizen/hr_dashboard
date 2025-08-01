// Global variables
let charts = {};
let candidatesData = []; // Store candidates data for filtering
const magentaColors = {
    primary: '#ec4899',
    secondary: '#db2777',
    tertiary: '#be185d',
    light: '#fce7f3',
    red: '#dc2626',
    darkRed: '#b91c1c'
};

// Utility Functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading"></div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

async function loadCSV(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`Failed to load ${path}`);
        const text = await response.text();
        const result = Papa.parse(text, { header: true, skipEmptyLines: true });
        return result.data;
    } catch (error) {
        console.error(`Error loading CSV ${path}:`, error);
        return [];
    }
}

function destroyChart(id) {
    if (charts[id]) {
        charts[id].destroy();
        delete charts[id];
    }
}

// Tab Functionality
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            
            // Remove active class from all tabs and buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Chart Creation Functions
function createBarChart(canvasId, labels, data, label, colors = null) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const backgroundColor = colors || magentaColors.primary;
    const borderColor = colors || magentaColors.secondary;
    
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: magentaColors.light
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createBarChartWithRedFirst(canvasId, labels, data, label) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    const backgroundColor = data.map((_, index) => 
        index === 0 ? magentaColors.red : magentaColors.primary
    );
    const borderColor = data.map((_, index) => 
        index === 0 ? magentaColors.darkRed : magentaColors.secondary
    );
    
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: magentaColors.light
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function createHorizontalBarChart(canvasId, labels, data, label) {
    destroyChart(canvasId);
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;
    
    charts[canvasId] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: data,
                backgroundColor: [magentaColors.primary, magentaColors.secondary, magentaColors.tertiary],
                borderColor: [magentaColors.secondary, magentaColors.tertiary, '#9d174d'],
                borderWidth: 1,
                borderRadius: 20,
                borderSkipped: false,
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: magentaColors.light
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// Enhanced Word Cloud Functions
function createWordCloud(containerId, words) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort words by weight for better visual hierarchy
    const sortedWords = words.sort((a, b) => b.size - a.size);
    
    // Create word cloud with improved sizing and colors
    sortedWords.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'word-item';
        span.textContent = word.text;
        
        // Dynamic font sizing based on weight and position
        const maxSize = 28;
        const minSize = 14;
        const normalizedSize = ((word.size - 548) / (1883 - 548)) * (maxSize - minSize) + minSize;
        span.style.fontSize = `${Math.max(minSize, Math.min(maxSize, normalizedSize))}px`;
        
        // Add priority class for top words
        if (index < 3) {
            span.classList.add('word-priority-high');
        } else if (index < 6) {
            span.classList.add('word-priority-medium');
        } else {
            span.classList.add('word-priority-low');
        }
        
        // Add click interaction
        span.addEventListener('click', () => {
            span.classList.toggle('word-highlighted');
            // Optional: Show more details about this sentiment
            showSentimentDetails(word);
        });
        
        // Add hover effect with weight display
        span.title = `${word.text}: ${word.size} mentions`;
        
        container.appendChild(span);
    });
}

function showSentimentDetails(word) {
    // This could be expanded to show more detailed analytics
    console.log(`Sentiment: ${word.text}, Weight: ${word.size}`);
}

// Data Loading Functions
async function loadEmployee360Data() {
    try {
        // Load metrics for cards
        const metricsData = [
            { metric: 'Total Employees', value: '1,247' },
            { metric: 'Total New Employees', value: '89', growth: '+12% from last month' },
            { metric: 'Average Time to Hire', value: '23 days' },
            { metric: 'Total Positions', value: '156' }
        ];
        
        // Update cards
        document.getElementById('totalEmployees').textContent = metricsData[0].value;
        document.getElementById('newEmployees').textContent = metricsData[1].value;
        document.getElementById('newEmployeesGrowth').textContent = metricsData[1].growth;
        document.getElementById('avgTimeToHire').textContent = metricsData[2].value;
        document.getElementById('totalPositions').textContent = metricsData[3].value;
        
        // Sample data for charts
        const deptEmployeesData = await loadCSV('data/employee360/department_employees.csv');
        if (deptEmployeesData.length > 0) {
            createBarChart('deptEmployeesChart', 
                deptEmployeesData.map(d => d.department),
                deptEmployeesData.map(d => parseInt(d.total_employees)),
                'Total Employees'
            );
        }
        
        const deptNewEmployeesData = await loadCSV('data/employee360/department_new_employees.csv');
        if (deptNewEmployeesData.length > 0) {
            createBarChart('deptNewEmployeesChart',
                deptNewEmployeesData.map(d => d.department),
                deptNewEmployeesData.map(d => parseInt(d.new_employees)),
                'New Employees'
            );
        }
        
        const timeToHireData = await loadCSV('data/employee360/time_to_hire.csv');
        if (timeToHireData.length > 0) {
            createBarChart('deptTimeToHireChart',
                timeToHireData.map(d => d.department),
                timeToHireData.map(d => parseInt(d.days_to_hire)),
                'Days to Hire'
            );
        }
        
    } catch (error) {
        console.error('Error loading Employee 360 data:', error);
    }
}

async function loadAttritionData() {
    try {
        // Load metrics data for Employees at Risk of Attrition card
        const metricsData = await loadCSV('data/attrition/metrics.csv');
        if (metricsData.length > 0) {
            document.getElementById('attritionRisk').textContent = metricsData[0].value;
        }
        
        // Load word cloud data from sentiment.csv for sentiment analysis
        const sentimentData = await loadCSV('data/attrition/sentiment.csv');
        if (sentimentData.length > 0) {
            const sentimentReasons = sentimentData.map(item => ({
                text: item.sentiment,
                size: Math.max(12, Math.min(26, parseInt(item.weight)))
            }));
            createWordCloud('sentimentWordcloud', sentimentReasons);
        }
        
        // Load CSV data for charts
        const chartConfigs = [
            { file: 'department_risk.csv', chartId: 'deptAttritionChart', labelKey: 'department', dataKey: 'risk_percentage' },
            { file: 'gender.csv', chartId: 'genderAttritionChart', labelKey: 'gender', dataKey: 'attrition_count' },
            { file: 'grade.csv', chartId: 'gradeAttritionChart', labelKey: 'grade', dataKey: 'attrition_count' },
            { file: 'designation.csv', chartId: 'designationAttritionChart', labelKey: 'designation', dataKey: 'attrition_count' },
            { file: 'tenure.csv', chartId: 'tenureAttritionChart', labelKey: 'tenure', dataKey: 'attrition_count' },
            { file: 'business_unit.csv', chartId: 'businessUnitAttritionChart', labelKey: 'business_unit', dataKey: 'attrition_count' },
            { file: 'manager.csv', chartId: 'managerAttritionChart', labelKey: 'manager', dataKey: 'attrition_count' },
            { file: 'hometown.csv', chartId: 'hometownAttritionChart', labelKey: 'hometown_tier', dataKey: 'attrition_count' },
            { file: 'age.csv', chartId: 'ageAttritionChart', labelKey: 'age_group', dataKey: 'attrition_count' },
            { file: 'distance.csv', chartId: 'distanceAttritionChart', labelKey: 'distance_range', dataKey: 'attrition_count' },
            { file: 'rating.csv', chartId: 'ratingAttritionChart', labelKey: 'rating', dataKey: 'attrition_count' },
            { file: 'education.csv', chartId: 'qualificationAttritionChart', labelKey: 'Educational Qualification/Degree', dataKey: 'count' }
        ];
        
        for (const config of chartConfigs) {
            const data = await loadCSV(`data/attrition/${config.file}`);
            if (data.length > 0) {
                if (config.chartId === 'deptAttritionChart') {
                    createBarChart(config.chartId,
                        data.map(d => d[config.labelKey]),
                        data.map(d => parseFloat(d[config.dataKey])),
                        '#Employees at Risk'
                    );
                } else {
                    createBarChartWithRedFirst(config.chartId,
                        data.map(d => d[config.labelKey]),
                        data.map(d => parseInt(d[config.dataKey])),
                        'Expected Attrition Count'
                    );
                }
            }
        }
        
    } catch (error) {
        console.error('Error loading Attrition data:', error);
    }
}

async function loadTalentData() {
    try {
        // Load joining probability chart
        const joiningData = await loadCSV('data/talent/joining_probability.csv');
        if (joiningData.length > 0) {
            createHorizontalBarChart('joiningChancesChart',
                joiningData.map(d => d.category),
                joiningData.map(d => parseFloat(d.percentage)),
                'Joining Probability %'
            );
        }
        
        // Load candidate table data
        candidatesData = await loadCSV('data/talent/candidates.csv');
        
        if (candidatesData.length > 0) {
            renderCandidateTable(candidatesData);
        }
        
    } catch (error) {
        console.error('Error loading Talent data:', error);
    }
}

// Candidate table rendering function
function renderCandidateTable(data) {
    const tableBody = document.getElementById('candidateTableBody');
    
    tableBody.innerHTML = data.map(candidate => {
        const probability = parseFloat(candidate.join_probability);
        let probabilityClass = 'probability-low';
        if (probability >= 80) probabilityClass = 'probability-high';
        else if (probability >= 60) probabilityClass = 'probability-medium';
        
        let categoryClass = 'category-low';
        if (candidate.join_probability_category === 'High') categoryClass = 'category-high';
        else if (candidate.join_probability_category === 'Medium') categoryClass = 'category-medium';
        
        return `
            <tr>
                <td>${candidate.Candidate}</td>
                <td>${candidate['Candidate Email']}</td>
                <td>
                    <span class="probability-badge ${probabilityClass}">
                        ${candidate.join_probability}
                    </span>
                </td>
                <td>
                    <span class="category-badge ${categoryClass}">
                        ${candidate.join_probability_category}
                    </span>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter candidates by type
function filterCandidatesByType() {
    const filterValue = document.getElementById('typeFilter').value;
    
    if (filterValue === 'all') {
        renderCandidateTable(candidatesData);
    } else {
        const filteredData = candidatesData.filter(candidate => 
            candidate.join_probability_category === filterValue
        );
        renderCandidateTable(filteredData);
    }
}

// Remove filter function
function removeFilter() {
    document.getElementById('typeFilter').value = 'all';
    renderCandidateTable(candidatesData);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    loadEmployee360Data();
    loadAttritionData();
    loadTalentData();
});