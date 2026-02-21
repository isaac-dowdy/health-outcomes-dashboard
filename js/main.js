let data, expenditureChart, expectancyChart, scatterplotChart, choroMap;

Promise.all([
        d3.json('data/custom.geo.json'),
        d3.csv('data/health-outcomes.csv', d => ({
            Country: d.Entity,
            Code: d.Code,
            Expenditure: +d.Expenditure,
            Expectancy: +d.Expectancy
        }))
    ]).then(_data => {
        data = _data;      
        console.log(data);

        // Merge the two datasets based on country code
        const expenditureByCode = new Map(data[1].map(d => [d.Code, d.Expenditure]));
        const expectancyByCode = new Map(data[1].map(d => [d.Code, d.Expectancy]));
        data[0].features.forEach(feature => {
            const code = feature.id;
            feature.properties.Expenditure = expenditureByCode.get(code) || null;
            feature.properties.Expectancy = expectancyByCode.get(code) || null;
        });

        console.log(data);



        // Create healthcare expenditure histogram
        expenditureChart = new expenditureHistogram ({
            parentElement: '#barChart',
            containerWidth: 450,
            containerHeight: 200,
            margin: { top: 20, right: 20, bottom: 60, left: 40 }
        }, data[1]);

        // Create life expectancy histogram
        expectancyChart = new expectancyHistogram ({
            parentElement: '#barChart2',
            containerWidth: 450,
            containerHeight: 200,
            margin:  { top: 20, right: 20, bottom: 60, left: 40 }
        }, data[1]);

        // Create life expectancy vs healthcare expenditure scatterplot
        scatterplotChart = new scatterplot ({
            parentElement: '#scatterplot',
            containerWidth: 450,
            containerHeight: 259,
            margin: { top: 20, right: 20, bottom: 60, left: 40 }
        }, data[1]);

        choroMap1 = new choropleth ({
            parentElement: '#choropleth1',
            containerWidth: 600,
            containerHeight: 600,
        }, data[0], 'Expenditure');

        choroMap2 = new choropleth ({
            parentElement: '#choropleth2',
            containerWidth: 600,
            containerHeight: 600,
        }, data[0], 'Expectancy');

    });
