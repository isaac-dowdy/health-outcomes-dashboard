class scatterplot {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 350,
            margin: _config.margin || { top: 10, right: 10, bottom: 30, left: 30},
            attribute1: _config.attribute1 || "Expenditure",
            attribute2: _config.attribute2 || "Expectancy"
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
            .domain([0, d3.max(vis.data, d => d[vis.config.attribute1])]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.data, d => d[vis.config.attribute2])]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(12)

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)

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

        vis.xAxisLabel = vis.svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.config.containerWidth / 2)
            .attr('y', vis.config.containerHeight - 30)
            .attr('text-anchor', 'middle')
            .text(vis.config.attribute1);

        vis.yAxisLabel = vis.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 15)
            .attr('text-anchor', 'end')
            .text(vis.config.attribute2);

        vis.updateVis();     
    }

    updateVis() {
        let vis = this;

        const circles = vis.chart.selectAll('.point')
            .data(vis.data, d => d.Country)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('cy', d => vis.yScale(d[vis.config.attribute2]))
            .attr('cx', d => vis.xScale(d[vis.config.attribute1]))
            .attr('fill', '#08519c');

            vis.xAxisGroup.call(vis.xAxis);
            vis.yAxisGroup.call(vis.yAxis);

    }
}