/**
 * The BulkInsertEarthquakes will bulk Insert/update earthquakes collection by id
 * 
 * Indexes:
 *  - local_time (date)
 *  - coordinates (2dsphere)
 * 
 * data: [
 * {
      mag: 3,
      utc_timestamp: 1588755460480,
      local_time: "2020-05-06 04:53:40.480",
      coordinates: [-66.9661, 17.9785],
      depth: 5,
      id: "pr2020127011"
    }
  ]
 */

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const { MONGODB_USERNAME, MONGODB_PASSWORD, MONGODB_IP_ADDRESS } = process.env;
const url = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_IP_ADDRESS}`;

// Database Name
const dbName = 'earthquakes';

// Bulk Inserts/updates earthquakes by id
module.exports = function BulkInsertEarthquakes(data) {
  const client = new MongoClient(url);

  client.connect(function(err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const dbs = client.db(dbName);

    var bulkUpdateOps = data.map(item => (
        {
          "updateOne": {
            "filter": { id: item.id },
            "update": { ...item },
            "upsert": true
          }
        }
    ));
  
    dbs.collection("earthquakes").bulkWrite(bulkUpdateOps, 
      {"ordered": true, "w": 1}, function(err, result) {
          console.log('err', err)
          console.log('result', result)
          // callback(err); 
      }
    );

    client.close();
  });
}
