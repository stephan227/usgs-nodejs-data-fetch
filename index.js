// Using node v10.15.0 (npm v6.4.1)
//  $ node usgs_data_fetch.js
// Earthquakes API example:
// https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-12-26&endtime=2020-07-16&catalog=pr&minmagnitude=0
// starttime - Default now
// endtime - Default 30 days ago

// This file will parse pr-earthquakes.geojson into a smaller file with the required properties to build the d3 chart
const fs = require('fs');
const https = require('https');
const BulkInsertEarthquakes = require('./mongodb/BulkInsertEarthquakes');

// const requestURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2018-11-26&endtime=2020-07-16&catalog=pr&minmagnitude=0'
const requestURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&catalog=pr&minmagnitude=0'
https.get(requestURL, (resp) => {
  let data = '';
  
  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    var dir = './data-files';

    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }

    // Save raw data locally
    fs.writeFile('./data-files/raw_earthquakes.geojson', data, () => {});
    console.log('data length', JSON.parse(data).length)

    // Transform raw data
    const transformedData = transformEarthquakeData(JSON.parse(data));

    // Save raw data to mongodb
    BulkInsertEarthquakes(transformedData);

    // Save Transformed data locally
    fs.writeFileSync('./data-files/transformed_earthquakes.json', JSON.stringify(transformedData))

  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});

/* Flatten and remove unnecesary data */
const transformEarthquakeData = (usgsEarthquakes) => {
    // Flatten dataset and delete unused properties
    const transformedData = usgsEarthquakes.features.map(feature => {
        const slimFeature = {
            mag: feature.properties.mag,
            time: feature.properties.time,
            tz: feature.properties.tz,
            location : {"type" : "Point" , "coordinates" : [feature.geometry.coordinates[0], feature.geometry.coordinates[1]]},
            depth: feature.geometry.coordinates[2],
            id: feature.id
        }
        return slimFeature
    })

    return transformedData;
}
