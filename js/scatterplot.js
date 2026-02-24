class scatterplot {
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 350,
            margin: _config.margin || { top: 10, right: 10, bottom: 30, left: 30},
            attribute1: _config.attribute1 || "Expenditure",
            attribute2: _config.attribute2 || "Expectancy",
            colorAttribute: _config.colorAttribute || "None",
            tooltipPadding: 10,
            legendBottom: _config.containerHeight - 25,
            legendLeft: (_config.containerWidth - 100) / 2,
            legendRectHeight: 12,
            legendRectWidth: 100,
        }

        this.data = _data;
        this.initVis();
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        } else {
            return num.toFixed(1);
        }
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        // filter out null values: when not filtered, they are plotted at 0 for some reason
        const validAttribute1 = vis.data.filter(d => d[vis.config.attribute1] != null);
        const validAttribute2 = vis.data.filter(d => d[vis.config.attribute2] != null);

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .domain([0, d3.max(validAttribute1, d => d[vis.config.attribute1])]);

        vis.yScale = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(validAttribute2, d => d[vis.config.attribute2])]);

        vis.xAxis = d3.axisBottom(vis.xScale)
            .ticks(12)
            .tickFormat(d => vis.formatNumber(d));

        vis.yAxis = d3.axisLeft(vis.yScale)
            .ticks(6)
            .tickFormat(d => vis.formatNumber(d));

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
            .attr('y', vis.config.containerHeight - 60)
            .attr('text-anchor', 'middle')
            .text(vis.config.attribute1);

        vis.yAxisLabel = vis.svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('y', 15)
            .attr('text-anchor', 'end')
            .text(vis.config.attribute2);

        vis.legend = vis.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${vis.config.legendLeft}, ${vis.config.legendBottom})`);
        
        // Define gradient for legend
        vis.linearGradient = vis.svg.append('defs')
            .append('linearGradient')
            .attr('id', 'legend-gradient');
        
        vis.legendRect = vis.legend.append('rect')
            .attr('width', vis.config.legendRectWidth)
            .attr('height', vis.config.legendRectHeight)
            .style('fill', 'url(#legend-gradient)');

        vis.legendTitle = vis.legend.append('text')
            .attr('class', 'legend-title')
            .attr('dy', '0.35em')
            .attr('y', -8)
            .attr('x', vis.config.legendRectWidth / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .text(vis.config.colorAttribute);
        
        // Add min and max value labels for the legend
        vis.legendMinLabel = vis.legend.append('text')
            .attr('class', 'legend-label')
            .attr('dy', '0.35em')
            .attr('y', vis.config.legendRectHeight + 10)
            .attr('x', 0)
            .style('font-size', '9px');
        
        vis.legendMaxLabel = vis.legend.append('text')
            .attr('class', 'legend-label')
            .attr('dy', '0.35em')
            .attr('y', vis.config.legendRectHeight + 10)
            .attr('x', vis.config.legendRectWidth)
            .attr('text-anchor', 'end')
            .style('font-size', '9px');
        
        // Initially hide legend if no color attribute is selected
        if (vis.config.colorAttribute === "None") {
            vis.legend.style('opacity', 0);
        }

        vis.updateVis();     
    }

    // Called whenever a new attribute is selected; updates the current attribute, filters values, and sets up the scales and the axis labels
    updateAttribute(attribute1, attribute2) 
    {
        let vis = this;

        vis.config.attribute1 = attribute1;
        vis.config.attribute2 = attribute2;

        // filter out null values: when not filtered, they are plotted at 0 for some reason
        const validAttribute1 = vis.data.filter(d => d[attribute1] != null);
        const validAttribute2 = vis.data.filter(d => d[attribute2] != null);

        // update scales
        vis.xScale.domain([0, d3.max(validAttribute1, d => d[vis.config.attribute1])]);
        vis.yScale.domain([0, d3.max(validAttribute2, d => d[vis.config.attribute2])]);

        // update axis labels
        vis.xAxisLabel.text(attribute1);
        vis.yAxisLabel.text(attribute2);

        vis.updateVis();

    }

    updateColor(colorAttribute) {
        let vis = this;

        vis.colorAttribute = colorAttribute;
        vis.legendTitle.text(colorAttribute);

        if (colorAttribute === "None") {
            // Hide legend when no color attribute is selected
            vis.legend.style('opacity', 0);
            
            vis.chart.selectAll('.point')
                .transition()
                .duration(750)
                .attr('fill', '#08519c');
        } else {
            // Show legend
            vis.legend.style('opacity', 1);
            
            const extentValues = d3.extent(vis.data, d => d[colorAttribute]);
            
            // Update gradient stops
            vis.legendStops = [
                { color: '#ccebc5', value: extentValues[0], offset: 0},
                { color: '#08519c', value: extentValues[1], offset: 100},
            ];
            
            // Update the gradient
            vis.linearGradient.selectAll('stop')
                .data(vis.legendStops)
                .join('stop')
                .attr('offset', d => d.offset + '%')
                .attr('stop-color', d => d.color);
            
            // Update legend labels
            vis.legendMinLabel.text(vis.formatNumber(extentValues[0]));
            vis.legendMaxLabel.text(vis.formatNumber(extentValues[1]));
            
            // Create color scale
            const colorScale = d3.scaleLinear()
                .domain(extentValues)
                .range(['#ccebc5', '#08519c'])
                .interpolate(d3.interpolateHcl);
            
            // Update point colors
            vis.chart.selectAll('.point')
                .transition()
                .duration(750)
                .attr('fill', d => colorScale(d[colorAttribute]));
        }
    }

    updateVis() {
        let vis = this;

        // Filter out data points with null values
        const validData = vis.data.filter(d => d[vis.config.attribute1] != null && d[vis.config.attribute2] != null);

        const circles = vis.chart.selectAll('.point')
            .data(validData, d => d.Country)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('fill', '#08519c');

            vis.xAxisGroup.call(vis.xAxis);
            vis.yAxisGroup.call(vis.yAxis);

        circles
            .on('mouseover', (event, d) => {
                circles
                    .classed('is-hovered', false)
                    .classed('is-dim', true);

                d3.select(event.currentTarget)
                    .classed('is-hovered', true)
                    .classed('is-dim', false);

                let tooltipHTML = `
                    <div class="tooltip-title">${d.Country}</div>
                    <div>${vis.config.attribute1}: ${d[vis.config.attribute1]}</div>
                    <div>${vis.config.attribute2}: ${d[vis.config.attribute2]}</div>
                `;
                
                // Only add color attribute if it's not "None" and different from attribute1 and attribute2
                if (vis.colorAttribute && vis.colorAttribute !== "None" && vis.colorAttribute !== vis.config.attribute1 && vis.colorAttribute !== vis.config.attribute2) 
                {
                    tooltipHTML += `<div>${vis.colorAttribute}: ${d[vis.colorAttribute]}</div>`;
                }

                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY + 15) + 'px')
                    .html(tooltipHTML);
            })
            .on('mouseleave', () => {
                circles
                    .classed('is-hovered', false)
                    .classed('is-dim', false);

                d3.select('#tooltip')
                    .style('display', 'none');
            });

        circles
            .transition() // pretty transitionssss
            .duration(750)
            .attr('cy', d => vis.yScale(d[vis.config.attribute2]))
            .attr('cx', d => vis.xScale(d[vis.config.attribute1]));

    }
}