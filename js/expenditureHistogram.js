class expenditureHistogram {

    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: _config.margin || { top: 10, right: 10, bottom: 30, left: 30}
        }

        this.data = _data;
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
      
        // Scale for x-axis (health expenditure)
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .domain([0, 13000]);
            
        vis.histogram = d3.histogram()
            .value(d => d.Expenditure)
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(10)); // 10 bins for histogram

        vis.bins = vis.histogram(vis.data);

        // Scale for y-axis (number of countries)
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, 100]);

        vis.xAxis = d3.axisBottom(vis.xScale);
        vis.yAxis = d3.axisLeft(vis.yScale);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left},${vis.config.margin.top})`);
        
        vis.xAxisGroup = vis.chart.append('g')
            .attr('transform', `translate(0, ${vis.height})`)
            .attr('class', 'x-axis');

        vis.yAxisGroup = vis.chart.append('g')
            .attr('class', 'y-axis');


        // Create axis labels
        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.width + 10)
            .attr('y', vis.height + 25)
            .attr('dy', '0.71em')
            .style('text-anchor', 'end')
            .text('Health Expenditure per Capita (USD)');

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', 5)
            .attr('y', -10)
            .attr('dy', '0.71em')
            .text('Number of Countries');

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        vis.svg.selectAll('rect')
            .data(vis.bins)
            .enter()
            .append('rect')
            .attr('x', 1)
            .attr('transform', d => `translate(${vis.xScale(d.x0) + vis.config.margin.left}, ${vis.yScale(d.length) + vis.config.margin.top})`)
            .attr('width', d => vis.xScale(d.x1) - vis.xScale(d.x0) - 1)
            .attr('height', d => vis.height - vis.yScale(d.length))
            .attr('fill', '#08519c');

        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);

    }
}