document.addEventListener('DOMContentLoaded', function() {
    fetchAndRenderEnglandStats();
    // Call functions to fetch and render data
// fetchAndRenderHistoricalData();
// Or, use this line to fetch from local file
    fetchAndRenderLocalData();

   

    
});

function fetchAndRenderEnglandStats() {
    const stats = {
        dailyTested: 888781,
        dailyDeceasedWithin28Days: 234,
        dailyConfirmed: 46186,
        infected: 18393951,
        tested: 464167208,
        deceased: 181424,
        country: "UK",
        historyData: "https://api.apify.com/v2/datasets/K1mXdufnpvr53AFk6/items?format=json&clean=1",
        sourceUrl: "https://coronavirus.data.gov.uk/",
        lastUpdatedAtApify: "2022-02-16T12:01:00.000Z",
        lastUpdatedAtSource: "2022-02-15T16:00:00.985757Z",
        readMe: "https://apify.com/katerinahronik/covid-uk"
    };

    const statsHtml = `
        <ul>
            <li>Daily Tested: ${stats.dailyTested.toLocaleString()}</li>
            <li>Daily Deceased (Within 28 Days): ${stats.dailyDeceasedWithin28Days.toLocaleString()}</li>
            <li>Daily Confirmed: ${stats.dailyConfirmed.toLocaleString()}</li>
            <li>Total Infected: ${stats.infected.toLocaleString()}</li>
            <li>Total Tested: ${stats.tested.toLocaleString()}</li>
            <li>Total Deceased: ${stats.deceased.toLocaleString()}</li>
            <li>Source: <a href="${stats.sourceUrl}" target="_blank">${stats.sourceUrl}</a></li>
            <li>Last Updated at Source: ${new Date(stats.lastUpdatedAtSource).toLocaleString()}</li>
        </ul>
    `;
    document.getElementById('england-stats').innerHTML = statsHtml;
}



function fetchAndRenderHistoricalData() {
    const historyDataUrl = "https://api.apify.com/v2/datasets/K1mXdufnpvr53AFk6/items?format=json&clean=1";

    axios.get(historyDataUrl)
        .then(response => {
            const data = response.data;
            const parseDate = d3.timeParse("%Y-%m-%d");

            data.forEach(d => {
                if (d.lastUpdatedAtApify) {
                    const dateStr = d.lastUpdatedAtApify.split("T")[0];
                    d.date = parseDate(dateStr);
                } else {
                    d.date = null;
                }
                d.dailyConfirmed = +d.dailyConfirmed || 0;
            });

            const validData = data.filter(d => d.date !== null);

            renderLineChart(validData);
        })
        .catch(error => console.error('Error fetching historical data:', error));
}

function fetchAndRenderLocalData() {
    fetch('./data/uk_data.json')
        .then(response => response.json())
        .then(data => {
            const parseDate = d3.timeParse("%Y-%m-%d");

            data.forEach(d => {
                if (d.lastUpdatedAtApify) {
                    const dateStr = d.lastUpdatedAtApify.split("T")[0];
                    d.date = parseDate(dateStr);
                } else {
                    d.date = null;
                }
                d.dailyConfirmed = +d.dailyConfirmed || 0;
            });

            const validData = data.filter(d => d.date !== null);

            renderLineChart(validData);
            renderLineChartInfectedCases(validData);
           
        })
        .catch(error => console.error('Error fetching local data:', error));
}


function renderLineChart(data) {
    const margin = { top: 20, right: 30, bottom: 80, left: 60 };

    function updateChart() {
        // Clear previous SVG content
        d3.select("#line-chart").selectAll("*").remove();

        const containerWidth = document.getElementById('line-chart').clientWidth;
        const width = containerWidth - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#line-chart").append("svg")
            .attr("width", containerWidth)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const xAxis = d3.axisBottom(x)
            .ticks(d3.timeMonth.every(1))
            .tickFormat(d3.timeFormat("%B %Y"));

        const yAxis = d3.axisLeft(y);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.dailyConfirmed));

        x.domain(d3.extent(data, d => d.date));
        y.domain([0, d3.max(data, d => d.dailyConfirmed)]);

        const isMobile = window.innerWidth <= 768;

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .attr("transform", isMobile ? "rotate(-90)" : "rotate(-45)")
            .style("text-anchor", isMobile ? "middle" : "end")
            .attr("dy", isMobile ? "-0.5em" : "1.5em")
            .attr("dx", isMobile ? "-3.5em" : "0.0em")
            .attr("x", isMobile ? -10 : 0)
            .attr("y", isMobile ? 10 : 0);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }

    // Initial chart rendering
    updateChart();

    // Handle window resize
    window.addEventListener("resize", updateChart);
}


function renderLineChartInfectedCases(data) {
    const margin = { top: 20, right: 30, bottom: 80, left: 70 };

    function updateChart() {
        // Clear previous SVG content
        d3.select("#line-chart2").selectAll("*").remove();

        const containerWidth = document.getElementById('line-chart2').clientWidth;
        const width = containerWidth - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        const svg = d3.select("#line-chart2").append("svg")
            .attr("width", containerWidth)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const xAxis = d3.axisBottom(x)
            .ticks(d3.timeMonth.every(1))
            .tickFormat(d3.timeFormat("%B %Y"));

        const yAxis = d3.axisLeft(y);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.totalInfected !== undefined ? d.totalInfected : (d.infected !== undefined ? d.infected : 0))); // Handle both fields

        // Check if data is defined and is an array
        if (Array.isArray(data)) {
            // Clean and filter data
            const cleanedData = data.filter(d => d.date && (d.totalInfected !== null && d.totalInfected !== undefined) || (d.infected !== null && d.infected !== undefined));

            // Set domains
            x.domain(d3.extent(cleanedData, d => d.date));
            y.domain([0, d3.max(cleanedData, d => Math.max(d.totalInfected || 0, d.infected || 0))]);

            const isMobile = window.innerWidth <= 768;

            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .selectAll("text")
                .attr("transform", isMobile ? "rotate(-90)" : "rotate(-45)")
                .style("text-anchor", isMobile ? "middle" : "end")
                .attr("dy", isMobile ? "-0.5em" : "1.5em")
                .attr("dx", isMobile ? "-3.5em" : "0.0em")
                .attr("x", isMobile ? -10 : 0)
                .attr("y", isMobile ? 10 : 0);

            svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

            svg.append("path")
                .datum(cleanedData) // Use cleaned data
                .attr("class", "line")
                .attr("d", line);
        } else {
            console.error("Data is not an array or is undefined");
        }
    }

    // Initial chart rendering
    updateChart();

    // Handle window resize
    window.addEventListener("resize", updateChart);
}


function drawBarChart() {
    // Set up chart dimensions and margin
    const margin = { top: 20, right: 30, bottom: 80, left: 40 };
    const width = document.getElementById('bar-chart').clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select('#bar-chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Load the JSON data
    d3.json('./data/deaths.json').then(data => {
        // Process the data
        const parsedData = data.map(d => ({
            date: new Date(d.date),
            deaths: +d.metric_value
        }));

        // Get the min and max dates
        const minDate = d3.min(parsedData, d => d.date);
        const maxDate = d3.max(parsedData, d => d.date);

        // Create scales
        const x = d3.scaleTime()
            .domain([minDate, maxDate])
            .range([0, width]);

        const y = d3.scaleLinear()
            .domain([0, d3.max(parsedData, d => d.deaths)])
            .nice()
            .range([height, 0]);

        // Create axis
        const xAxis = d3.axisBottom(x)
            .ticks(d3.timeMonth.every(1))
            .tickFormat(d3.timeFormat('%b %Y'));

        const yAxis = d3.axisLeft(y)
            .ticks(10);



        // Append x-axis with rotated labels
        svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('text-anchor', 'middle')  // Center the text
        .attr('transform', 'rotate(-45)')  // Rotate labels by -45 degrees
        .attr('dx', '-2.0em')  // Adjust x position
        .attr('dy', '2.0em');  // Adjust y position

        // Append y-axis
        svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // Create bars
        svg.selectAll('.bar')
            .data(parsedData)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.date))
            .attr('y', d => y(d.deaths))
            .attr('width', Math.max(width / parsedData.length - 1, 1))  // Adjust bar width and ensure it’s at least 1
            .attr('height', d => height - y(d.deaths))
            .attr('fill', 'lightblue');  // Use lighter blue color
    });
}

// Draw chart on page load
drawBarChart();

// Redraw chart on window resize
window.addEventListener('resize', () => {
    d3.select('#bar-chart').select('svg').remove();
    drawBarChart();
});


function renderLineChart2024(data) {
    // Set margins
    const margin = { top: 20, right: 30, bottom: 80, left: 60 };

    function updateChart() {
        // Clear previous SVG content
        d3.select("#admitted-chart").selectAll("*").remove();

        // Get container dimensions
        const containerWidth = document.getElementById('admitted-chart').clientWidth;
        const width = containerWidth - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select("#admitted-chart").append("svg")
            .attr("width", containerWidth)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Parse date and value
        data.forEach(d => {
            d.date = new Date(d.date);
            d.dailyConfirmed = +d.metric_value;
        });

        // Set scales
        const x = d3.scaleTime().range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const xAxis = d3.axisBottom(x)
            .ticks(d3.timeMonth.every(1))
            .tickFormat(d3.timeFormat("%B %Y"));

        const yAxis = d3.axisLeft(y);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.dailyConfirmed));

        // Define domains
        x.domain(d3.extent(data, d => d.date));
        y.domain([0, d3.max(data, d => d.dailyConfirmed)]);

        // Add X Axis
        const xAxisGroup = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // Adjust X Axis labels for small screens
        const isMobile = window.innerWidth <= 768;
        xAxisGroup.selectAll("text")
            .attr("transform", isMobile ? "rotate(-90)" : "rotate(-45)")
            .style("text-anchor", isMobile ? "middle" : "end")
            .attr("dy", isMobile ? "-0.5em" : "1.5em")
            .attr("dx", isMobile ? "-3.5em" : "0.0em")
            .attr("x", isMobile ? -10 : 0)
            .attr("y", isMobile ? 10 : 0);

        // Add Y Axis
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        // Add line path
        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line);
    }

    // Initial chart rendering
    updateChart();

    // Handle window resize
    window.addEventListener("resize", updateChart);
}


// Load the data and create the chart
function loadChart() {
    d3.json("./data/admitted_patients.json").then(data => {
        renderLineChart2024(data);
    }).catch(error => {
        console.error('Error loading the JSON file:', error);
    });
}

// Initial load
loadChart();

// Adjust chart size on window resize
window.addEventListener('resize', () => {
    loadChart();
});
