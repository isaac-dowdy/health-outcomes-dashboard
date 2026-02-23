class choropleth {
    constructor(_config, _data, _currentAttribute) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: _config.containerWidth || 500,
            containerHeight: _config.containerHeight || 350,
            margin: _config.margin || { top: 10, right: 10, bottom: 30, left: 30},
            tooltipPadding: 10,
            legendBottom: 200,
            legendLeft: 50,
            legendRectHeight: 15,
            legendRectWidth: 100,
        }
        
        this.data = _data;

        this.currentAttribute = _currentAttribute || 'Expenditure';

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = vis.config.containerWidth - vis.config.margin.left - vis.config.margin.right;
        vis.height = vis.config.containerHeight - vis.config.margin.top - vis.config.margin.bottom;

        vis.svg = d3.select(vis.config.parentElement)
            .attr('width', vis.config.containerWidth)
            .attr('height', vis.config.containerHeight);

        vis.chart = vis.svg.append('g')
            .attr('transform', `translate(${vis.config.margin.left}, ${vis.config.margin.top})`);

        vis.projection = d3.geoMercator()
        vis.geoPath = d3.geoPath().projection(vis.projection);

        vis.colorScale = d3.scaleLinear()
            .range(['#f0f0f0', '#08519c'])
            .interpolate(d3.interpolateHcl);

        vis.linearGradient = vis.svg.append('defs').append('linearGradient')
            .attr('id', 'legend-gradient')

        vis.legend = vis.chart.append('g')
            .attr('class', 'legend');

        vis.legendRect = vis.legend.append('rect')
            .attr('width', vis.config.legendRectWidth)
            .attr('height', vis.config.legendRectHeight);

        vis.legendTitle = vis.legend.append('text')
            .attr('class', 'legend-title')
            .attr('dy', '0.35em')
            .attr('y', -10)
            .text(vis.currentAttribute);

        vis.updateVis();
    }

    // Called whenever a new attribute is selected; updates the current attribute, legend
    updateAttribute(attribute) 
    {
        let vis = this;

        vis.currentAttribute = attribute;
        vis.legendTitle.text(attribute);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;


        // Get the extent of expenditure values for the color scale domain, ignoring null and NaN values
        const extentValues = d3.extent(vis.data.features
            .map(d => d.properties[vis.currentAttribute])
            .filter(v => v != null && !isNaN(v)));

        vis.colorScale.domain(extentValues);

        vis.legendStops = [
            { color: vis.colorScale(extentValues[0]), value: extentValues[0], offset: 0},
            { color: vis.colorScale(extentValues[1]), value: extentValues[1], offset: 100},
        ]

        vis.renderVis();
    }

    renderVis() {
        let vis = this;

        const countries = vis.data.features;
        vis.projection.fitSize([vis.width, vis.height], vis.data);

        // Place the legend in the giant space that antarctica leaves for some reason
        const legendPos = vis.projection([-100, -80]);

        vis.legend.attr(
            'transform',
            `translate(${legendPos[0] - vis.config.legendRectWidth / 2}, ${legendPos[1]})`
        )
        
        const togglePos = vis.projection([60, -80]);

        d3.select('#toggle-container')
            .style('left', `${togglePos[0] + vis.config.margin.left - 20}px`)
            .style('top', `${togglePos[1] + vis.config.margin.top}px`);


        const countryPaths = vis.chart.selectAll('.country')
            .data(countries)
            .join('path')
            .attr('class', 'country')
            .attr('d', vis.geoPath)
            .attr('stroke', '#000')
            .attr('stroke-width', 0.5)
            .attr('vector-effect', 'non-scaling-stroke')
            .attr('stroke-linejoin', 'round')
            .attr('stroke-linecap', 'round')
            
        countryPaths
            .on('mouseover', (event, d) => {
                countryPaths
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
                        <div class="tooltip-title">${d.properties.name}</div>
                        <div>${vis.currentAttribute}: ${d.properties[vis.currentAttribute] != null ? d.properties[vis.currentAttribute] : 'N/A'}</div>
                    `);
            })
            .on('mouseleave', () => {
                countryPaths
                    .classed('is-hovered', false)
                    .classed('is-dim', false);

                d3.select('#tooltip')
                    .style('display', 'none');
            })
            .on('click', (event, d) => {
                const countryName = d.properties.name;
                
                // Toggle selection: if already selected, deselect; otherwise select
                if (selectedCountries.has(countryName)) {
                    selectedCountries.delete(countryName);
                } else {
                    selectedCountries.add(countryName);
                }
                
                // Update all visualizations with the new filter
                updateAllVisualizations();
            }); 

        countryPaths
            .transition() // pretty transitionssss
            .duration(750)
            .attr('fill', d => {
                if (d.properties[vis.currentAttribute] != null) {
                    return vis.colorScale(d.properties[vis.currentAttribute]);
                } else {
                    return 'url(#lightstripes)';
                }
            });

        vis.legend.selectAll('.legend-label')
            .data(vis.legendStops)
            .join('text')
            .attr('class', 'legend-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '0.35em')
            .attr('y', 20)
            .attr('x', (d, i) => {
                return i == 0 ? 0 : vis.config.legendRectWidth;
            })
            .text(d => Math.round(d.value));

        vis.linearGradient.selectAll('stop')
            .data(vis.legendStops)
            .join('stop')
            .attr('offset', d => `${d.offset}%`)
            .attr('stop-color', d => d.color);

        vis.legendRect.attr('fill', 'url(#legend-gradient)');
    }
}