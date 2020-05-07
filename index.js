// Using node v10.15.0 (npm v6.4.1)
//  $ node usgs_data_fetch.js
// Earthquakes API example:
// https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2019-12-01&endtime=2020-01-14&catalog=pr
// starttime - Default now
// endtime - Default 30 days ago

// This file will parse pr-earthquakes.geojson into a smaller file with the required properties to build the d3 chart
const fs = require('fs');
const https = require('https');
const BulkInsertEarthquakes = require('./mongodb/BulkInsertEarthquakes');

// const requestURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2019-12-26&endtime=2020-01-16&catalog=pr'
const requestURL = 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&catalog=pr'
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
    
    // Raw Data Save
    fs.writeFile('./data-files/raw_earthquakes.geojson', data, () => {});

    // Transform raw data
    const transformedData = transformEarthquakeData(JSON.parse(data));
    BulkInsertEarthquakes(transformedData);
    // Save Transformed data
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
            utc_timestamp: feature.properties.time,
            local_time: new Date(feature.properties.time + (feature.properties.tz * 1000)),
            location : {"type" : "Point" , "coordinates" : [feature.geometry.coordinates[0], feature.geometry.coordinates[1]]},
            depth: feature.geometry.coordinates[2],
            id: feature.id
        }
        return slimFeature
    })

    return transformedData;
}
