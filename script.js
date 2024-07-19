document.addEventListener("DOMContentLoaded", function () {
    fetchGlobalStats();
    fetchAndRenderBarChart();
});

function fetchGlobalStats() {
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


function fetchAndRenderBarChart() {
    axios.get('https://api.covidtracking.com/v2/states.json')
        .then(response => {
            const data = response.data.data;

            const margin = { top: 20, right: 30, bottom: 100, left: 60 },
                  width = 960 - margin.left - margin.right,
                  height = 500 - margin.top - margin.bottom;

            const svg = d3.select("#bar-chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            const x = d3.scaleBand()
                .range([0, width])
                .padding(0.1);
            const y = d3.scaleLinear()
                .range([height, 0]);

            // Update the x domain to use state names
            x.domain(data.map(d => d.name));
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
                .attr("x", d => x(d.name))  // Update to use state names
                .attr("width", x.bandwidth())
                .attr("y", d => y(d.census.population))
                .attr("height", d => height - y(d.census.population))
                .attr("fill", "steelblue");
        })
        .catch(error => console.error('Error fetching and rendering bar chart:', error));
}
