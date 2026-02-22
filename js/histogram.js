class Histogram {

    constructor(_config, _data) 
    {
        this.config = 
        {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 140,
            margin: _config.margin || { top: 10, right: 10, bottom: 30, left: 30},
            attribute: _config.attribute || "Expectancy"
        }

        this.data = _data;
        this.initVis();
    }

    initVis() 
    {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);
      
        // Filter out null values, when not filtered, they are plotted at 0 for some reason
        const validData = vis.data.filter(d => d[vis.config.attribute] != null);

        // Scale for x-axis
        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .domain(d3.extent(validData, d => d[vis.config.attribute]))
            .nice(10);
            
        vis.histogram = d3.histogram()
            .value(d => d[vis.config.attribute])
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(10)); // 10 bins for histogram

        vis.bins = vis.histogram(validData);

        // Scale for y-axis (number of countries)
        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.bins, d => d.length)]);

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
        vis.xAxisLabel = vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', vis.width + 10)
            .attr('y', vis.height + 25)
            .attr('dy', '0.71em')
            .style('text-anchor', 'end')
            .text(vis.config.attribute);

        vis.chart.append('text')
            .attr('class', 'axis-label')
            .attr('x', 5)
            .attr('y', -10)
            .attr('dy', '0.71em')
            .text('Number of Countries');

        vis.updateVis();

    }

    // Called when a new attribute is selected; updates the current attribute, axis labels
    updateAttribute(attribute) 
    {
        let vis = this;
        vis.config.attribute = attribute;

        vis.xAxisLabel.text(attribute);
        
        vis.updateVis();
    }

    updateVis() 
    {
        let vis = this;

        // Filter out null values; when not filtered, they are plotted at 0 for some reason
        const validData = vis.data.filter(d => d[vis.config.attribute] != null);

        // Recompute bins and scales in case data or attribute changed
        vis.xScale
            .domain(d3.extent(validData, d => d[vis.config.attribute]))
            .nice(10);

        vis.histogram
            .value(d => d[vis.config.attribute])
            .domain(vis.xScale.domain())
            .thresholds(vis.xScale.ticks(10));

        vis.bins = vis.histogram(validData);
        vis.yScale.domain([0, d3.max(vis.bins, d => d.length)]);

        vis.renderVis();
    }

    renderVis() 
    {
        let vis = this;

        const bars = vis.chart.selectAll('rect')
            .data(vis.bins)
            .join('rect')
            .attr('class', 'hist-bar')
            .attr('x', d => vis.xScale(d.x0) + 1);

        bars
            .on('mouseover', (event, d) => {
                bars
                    .classed('is-hovered', false)
                    .classed('is-dim', true);

                d3.select(event.currentTarget)
                    .classed('is-hovered', true)
                    .classed('is-dim', false);

                d3.select('#tooltip')
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY + 15) + 'px')
                    .style('display', 'block')
                    .html(`
                        <div class="tooltip-title">${d.length} Countries</div>
                        <div>Range: ${d.x0} - ${d.x1}</div>
                    `);
            })
            .on('mouseleave', () => {
                bars
                    .classed('is-hovered', false)
                    .classed('is-dim', false);

                d3.select('#tooltip')
                    .style('display', 'none');
            });
        
        bars
            .transition() // pretty transitionssss
            .duration(750)
            .attr('y', d => vis.yScale(d.length))
            .attr('width', d => Math.max(0, vis.xScale(d.x1) - vis.xScale(d.x0) - 1))
            .attr('height', d => vis.height - vis.yScale(d.length))
            .attr('fill', '#08519c');
            

        vis.xAxisGroup.call(vis.xAxis);
        vis.yAxisGroup.call(vis.yAxis);

    }
}