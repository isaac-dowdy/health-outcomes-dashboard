let data, expenditureChart, expectancyChart, scatterplotChart, choroMap, attribute1, attribute2;

// Global filter state for selected countries
let selectedCountries = new Set();

// these will be used to hold the current attribute being visualized
attribute1 = "Expenditure";
attribute2 = "Expectancy";

// This dictionary maps the display names of attributes from the dropboxes to the variable names in the data 
attributeNameDict =
{
    "Healthcare Expenditure per Capita": "Expenditure",
    "Life Expectancy": "Expectancy",
    "Population": "Population",
    "GDP per Capita": "GDP",
    "Physicians per 1,000 People": "Physicians",
    "Undernourishment Rate": "Undernourishment",
    "Obesity Rate": "Obesity",
    "None": "None",
    "Region": "Region"
}

Promise.all([
        d3.json('data/custom.geo.json'),
        d3.csv('data/data.csv', d => (
        {
            Country: d.Entity,
            Code: d.Code,
            Expenditure: d.Expenditure ? +d.Expenditure : null,
            Expectancy: d.Expectancy ? +d.Expectancy : null,
            Population: d.Population ? +d.Population : null,
            GDP: d.GDP ? +d.GDP : null,
            Physicians: d.Physicians ? +d.Physicians : null,
            Undernourishment: d.Undernourishment ? +d.Undernourishment : null,
            Obesity: d.Obesity ? +d.Obesity : null,
        }))
    ]).then(_data => 
        {
        data = _data;      
        console.log(data);

        // Merge the csv data into the geojson based on country code
        const expenditureByCode = new Map(data[1].map(d => [d.Code, d.Expenditure]));
        const expectancyByCode = new Map(data[1].map(d => [d.Code, d.Expectancy]));
        const populationByCode = new Map(data[1].map(d => [d.Code, d.Population]));
        const gdpByCode = new Map(data[1].map(d => [d.Code, d.GDP]));
        const physiciansByCode = new Map(data[1].map(d => [d.Code, d.Physicians]));
        const undernourishmentByCode = new Map(data[1].map(d => [d.Code, d.Undernourishment]));
        const obesityByCode = new Map(data[1].map(d => [d.Code, d.Obesity]));
        data[0].features.forEach(feature => {
            const code = feature.id;
            // If empty, set to null
            feature.properties.Expenditure = expenditureByCode.get(code) || null;
            feature.properties.Expectancy = expectancyByCode.get(code) || null;
            feature.properties.Population = populationByCode.get(code) || null;
            feature.properties.GDP = gdpByCode.get(code) || null;
            feature.properties.Physicians = physiciansByCode.get(code) || null;
            feature.properties.Undernourishment = undernourishmentByCode.get(code) || null;
            feature.properties.Obesity = obesityByCode.get(code) || null;
        });

        console.log(data);



        // Create histogram1: defaulted to healthcare expenditure
        histogram1 = new Histogram (
        {
            parentElement: '#barChart',
            containerWidth: 450,
            containerHeight: 200,
            margin: { top: 20, right: 20, bottom: 60, left: 40 },
            attribute: attribute1
        }, data[1]);

        // Create histogram2: defaulted to life expectancy
        histogram2 = new Histogram (
        {
            parentElement: '#barChart2',
            containerWidth: 450,
            containerHeight: 200,
            margin:  { top: 20, right: 20, bottom: 60, left: 40 },
            attribute: attribute2
        }, data[1]);

        // Create scatterplot: defaulted to life expectancy vs healthcare expenditure
        scatterplotChart = new scatterplot (
        {
            parentElement: '#scatterplot',
            containerWidth: 450,
            containerHeight: 295,
            margin: { top: 20, right: 20, bottom: 95, left: 40 },
            attribute1: attribute1,
            attribute2: attribute2
        }, data[1]);

        // Create choropleth map1: defaulted to healthcare expenditure
        choroMap1 = new choropleth (
        {
            parentElement: '#choropleth1',
            containerWidth: 600,
            containerHeight: 600,
        }, data[0], attribute1);

        // Create choropleth map2: defaulted to life expectancy
        choroMap2 = new choropleth (
        {
            parentElement: '#choropleth2',
            containerWidth: 600,
            containerHeight: 600,
        }, data[0], attribute2);

        // This function updates all visualizations with the current filter
        window.updateAllVisualizations = function() {
            histogram1.applyFilter(selectedCountries);
            histogram2.applyFilter(selectedCountries);
            scatterplotChart.applyFilter(selectedCountries);
            choroMap1.applyFilter(selectedCountries);
            choroMap2.applyFilter(selectedCountries);
        }

        // This function creates the listener for the dropboxes - when a new value is selected, call the updateAttribute function
        function setupDropdownListeners()
        {
            const dropdown1Links = document.querySelectorAll('#myDropdown1 a');
            dropdown1Links.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();

                    const displayName = this.textContent;
                    const newAttribute = attributeNameDict[displayName];

                    attribute1 = newAttribute;

                    histogram1.updateAttribute(attribute1);
                    scatterplotChart.updateAttribute(attribute1, attribute2);
                    choroMap1.updateAttribute(attribute1);

                })
            });

            const dropdown2Links = document.querySelectorAll('#myDropdown2 a');
            dropdown2Links.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();

                    const displayName = this.textContent;
                    const newAttribute = attributeNameDict[displayName];

                    attribute2 = newAttribute;

                    histogram2.updateAttribute(attribute2);
                    scatterplotChart.updateAttribute(attribute1, attribute2);
                    choroMap2.updateAttribute(attribute2);

                })
            });

            const dropdown3Links = document.querySelectorAll('#myDropdown3 a');
            dropdown3Links.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();

                    const displayName = this.textContent;
                    const colorAttribute = attributeNameDict[displayName];

                    scatterplotChart.updateColor(colorAttribute);
                })
            });
        }

        setupDropdownListeners();
    
    });
        
// functions for the dropboxes
function myFunction1() 
{
    document.getElementById("myDropdown1").classList.toggle("show");
}

function myFunction2() 
{
    document.getElementById("myDropdown2").classList.toggle("show");
}

function myFunction3()
{
    document.getElementById("myDropdown3").classList.toggle("show");
}

window.onclick = function(event) 
{
    if (!event.target.matches('.dropbtn'))
    {
        var dropdowns = document.getElementsByClassName("dropdown-content");
        var i;
        for (i = 0; i < dropdowns.length; i++)
        {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show'))
            {
                openDropdown.classList.remove("show");
            }
        }
    }
}
