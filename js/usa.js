document.addEventListener("DOMContentLoaded", function () {
    fetchUSAStats();
    //fetchAndRenderBarChart();

    // Choose which function to call based on your requirement
    // fetchDataFromAPI();
    fetchDataFromLocalJson();

});

function fetchUSAStats() {
    axios.get('https://api.covidtracking.com/v2/us/daily.json')
        .then(response => {
            const latestData = response.data.data[0];
            const statsHtml = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Total Confirmed</h5>
                                <p class="card-text">${latestData.cases.total.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Total Deaths</h5>
                                <p class="card-text">${latestData.outcomes.death.total.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Total Hospitalized</h5>
                                <p class="card-text">${latestData.outcomes.hospitalized.currently.value.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.getElementById('global-stats').innerHTML = statsHtml;
        })
        .catch(error => console.error('Error fetching global stats:', error));
}


function renderBarChart(data) {
    const margin = { top: 20, right: 30, bottom: 100, left: 80 };
    const containerWidth = document.getElementById('bar-chart').clientWidth;
    const width = containerWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous SVG if any
    d3.select("#bar-chart").selectAll("*").remove();

    const svg = d3.select("#bar-chart").append("svg")
        .attr("width", containerWidth)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    const y = d3.scaleLinear()
        .range([height, 0]);

    const isMobile = window.innerWidth <= 768;

    const xDomain = isMobile ? data.map(d => d.state_code) : data.map(d => d.name);
    x.domain(xDomain);
    y.domain([0, d3.max(data, d => d.census.population)]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(y));

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(isMobile ? d.state_code : d.name))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.census.population))
        .attr("height", d => height - y(d.census.population))
        .attr("fill", "steelblue");

    // Add event listener for window resize to make chart responsive
    window.addEventListener('resize', () => {
        const containerWidth = document.getElementById('bar-chart').clientWidth;
        const width = containerWidth - margin.left - margin.right;
        x.range([0, width]);

        const isMobile = window.innerWidth <= 768;
        const xDomain = isMobile ? data.map(d => d.state_code) : data.map(d => d.name);
        x.domain(xDomain);

        svg.select('.x.axis')
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end");

        svg.selectAll(".bar")
            .attr("x", d => x(isMobile ? d.state_code : d.name))
            .attr("width", x.bandwidth());
    });
}

// Function to fetch data from API
function fetchDataFromAPI() {
    axios.get('https://api.covidtracking.com/v2/states.json')
        .then(response => {
            const data = response.data.data;
            renderBarChart(data);
        })
        .catch(error => console.error('Error fetching data from API:', error));
}

// Function to fetch data from local JSON file
function fetchDataFromLocalJson() {
    return fetch('./data/usa_data.json')
        .then(response => response.json())
        .then(data => {
            // Extract the 'data' field and call the render function
            const dataItems = data.data;
            renderBarChart(dataItems);
        })
        .catch(error => console.error('Error fetching data from local JSON:', error));
}


