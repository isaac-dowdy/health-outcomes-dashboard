let data;

// load data from health-outcomes.csv
d3.csv('data/health-outcomes.csv')
    .then(_data => {
        console.log('Data loaded successfully');
        data = _data;
        console.log(data);
        

        console.log(data);

        expenditureChart = new expenditureHistogram ({
            parentElement: '#barChart',
            containerWidth: 600,
            containerHeight: 400,
            margin: {top: 40, right: 20, bottom: 50, left: 70}
        }, data);
        expenditureChart.updateVis();

        expectancyChart = new expectancyHistogram ({
            parentElement: '#barChart2',
            containerWidth: 600,
            containerHeight: 400,
            margin: {top: 40, right: 20, bottom: 50, left: 70}
        }, data);
        expectancyChart.updateVis();

    });



