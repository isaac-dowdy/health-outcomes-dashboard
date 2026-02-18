class scatterplot {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 350,
            margin: _config.margin || { top: 10, right: 10, bottom: 30, left: 30}
        }

        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .domain([0, d3.max(vis.data, d => d.Expenditure)]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.data, d => d.Expectancy)]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(12)
            //.tickSize(-vis.height - 10)
            //.tickPadding(10)
            //.tickFormat(d => d + ' km');

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            //.tickSize(-vis.width - 10)
            //.tickPadding(10);

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.width + vis.config.margin.left + vis.config.margin.right)
            .attr('height', vis.height + vis.config.margin.top + vis.config.margin.bottom);
            
        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.xAxisGroup = vis.chart.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${vis.height})`);

        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'y-axis');

        vis.xAxisLabel = vis.xAxisGroup.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.width / 2)
            .attr('y', vis.config.margin.bottom - 10)
            .attr('dy', '0.71em')
            .style('text-anchor', 'middle')
            .text('Health Expenditure per Capita (USD)');

        vis.yAxisLabel = vis.yAxisGroup.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -vis.height / 2)
            .attr('y', -vis.config.margin.left + 15)
            .attr('dy', '-0.5em')
            .attr('text-anchor', 'end')
            .text('Life Expectancy');

        vis.updateVis();     
    }

    updateVis() {
        let vis = this;

        const circles = vis.chart.selectAll('.point')
            .data(vis.data, d => d.Country)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cy', d => vis.yScale(d.Expectancy))
            .attr('cx', d => vis.xScale(d.Expenditure))
            .attr('fill', 'steelblue');

            vis.xAxisGroup.call(vis.xAxis);
            vis.yAxisGroup.call(vis.yAxis);

            console.log(vis.data);
    }
}