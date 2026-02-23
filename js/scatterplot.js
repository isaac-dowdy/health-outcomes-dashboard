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

    // Filter scatterplot to show only selected countries, or all if none selected
    applyFilter(selectedCountries)
    {
        let vis = this;
        vis.selectedCountries = selectedCountries;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Filter out data points with null values
        let validData = vis.data.filter(d => d[vis.config.attribute1] != null && d[vis.config.attribute2] != null);

        // Apply country filter if any countries are selected
        if (vis.selectedCountries && vis.selectedCountries.size > 0) {
            validData = validData.filter(d => vis.selectedCountries.has(d.Country));
        }

        const circles = vis.chart.selectAll('.point')
            .data(validData, d => d.Country)
            .join('circle')
            .attr('class', 'point')
            .attr('r', 4)
            .attr('fill', '#08519c')
            .classed('is-selected', d => {
                return vis.selectedCountries && vis.selectedCountries.has(d.Country);
            });

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

                d3.select('#tooltip')
                    .style('display', 'block')
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY + 15) + 'px')
                    .html(`
                        <div class="tooltip-title">${d.Country}</div>
                        <div>${vis.config.attribute1}: ${d[vis.config.attribute1]}</div>
                        <div>${vis.config.attribute2}: ${d[vis.config.attribute2]}</div>
                    `);
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