let data, expenditureChart, expectancyChart, scatterplotChart;

// load data from health-outcomes.csv and convert to numeric values
d3.csv('data/health-outcomes.csv', d => ({
    Country: d.Country,
    Expenditure: +d.Expenditure,
    Expectancy: +d.Expectancy
}))
    .then(_data => {
        console.log('Data loaded successfully');
        data = _data;
        console.log(data);
        

        console.log(data);

        // Create healthcare expenditure histogram
        expenditureChart = new expenditureHistogram ({
            parentElement: '#barChart',
            containerWidth: 450,
            containerHeight: 200,
            margin: {top: 40, right: 20, bottom: 50, left: 70}
        }, data);

        // Create life expectancy histogram
        expectancyChart = new expectancyHistogram ({
            parentElement: '#barChart2',
            containerWidth: 450,
            containerHeight: 200,
            margin: {top: 40, right: 20, bottom: 50, left: 70}
        }, data);

        // Create life expectancy vs healthcare expenditure scatterplot
        scatterplotChart = new scatterplot ({
            parentElement: '#scatterplot',
            containerWidth: 450,
            containerHeight: 200,
        }, data);

    });



