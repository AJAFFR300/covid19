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
    fetch('uk_data.json')
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
           
            // Aggregate data by month and render the chart
            const monthlyData = aggregateDataByMonth(data);
            renderTotalInfectedBarChart(monthlyData);
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


// function aggregateDataByMonth(data) {
//     const parseMonth = d3.timeMonth.floor;
//     const monthlyData = d3.rollups(
//         data,
//         v => d3.sum(v, d => d.totalInfected),
//         d => parseMonth(d.date)
//     ).map(([date, totalInfected]) => ({ date, totalInfected }));

//     return monthlyData;
// }

// function renderTotalInfectedBarChart(data) {
//     const margin = { top: 20, right: 30, bottom: 80, left: 60 };

//     function updateChart() {
//         // Clear previous SVG content
//         d3.select("#total-infected-bar-chart").selectAll("*").remove();

//         const containerWidth = document.getElementById('total-infected-bar-chart').clientWidth;
//         const width = containerWidth - margin.left - margin.right;
//         const height = 500 - margin.top - margin.bottom;

//         const svg = d3.select("#total-infected-bar-chart").append("svg")
//             .attr("width", containerWidth)
//             .attr("height", height + margin.top + margin.bottom)
//             .append("g")
//             .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//         const x = d3.scaleBand().range([0, width]).padding(0.1);
//         const y = d3.scaleLinear().range([height, 0]);

//         // Set domains
//         x.domain(data.map(d => d.date));
//         y.domain([0, d3.max(data, d => d.totalInfected)]);

//         const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y"));
//         const yAxis = d3.axisLeft(y);

//         const isMobile = window.innerWidth <= 768;

//         svg.append("g")
//             .attr("class", "x axis")
//             .attr("transform", "translate(0," + height + ")")
//             .call(xAxis)
//             .selectAll("text")
//             .attr("transform", isMobile ? "rotate(-90)" : "rotate(-45)")
//             .style("text-anchor", isMobile ? "middle" : "end")
//             .attr("dy", isMobile ? "-0.5em" : "1.5em")
//             .attr("dx", isMobile ? "-3.5em" : "0.0em")
//             .attr("x", isMobile ? -10 : 0)
//             .attr("y", isMobile ? 10 : 0);

//         svg.append("g")
//             .attr("class", "y axis")
//             .call(yAxis);

//         svg.selectAll(".bar")
//             .data(data)
//             .enter().append("rect")
//             .attr("class", "bar")
//             .attr("x", d => x(d.date))
//             .attr("width", x.bandwidth())
//             .attr("y", d => y(d.totalInfected))
//             .attr("height", d => height - y(d.totalInfected))
//             .attr("fill", "steelblue");
//     }

//     // Initial chart rendering
//     updateChart();

//     // Handle window resize
//     window.addEventListener("resize", updateChart);
// }











