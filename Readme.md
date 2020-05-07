# Earthquakes data-fetch
The following repo fetches earthquakes data and stores the raw data and stores and parses a minified version of the data in MongoDB or data-files folder.

## Setup
  Install dependencies:
  ```
    $ npm install
  ```

  Create .env file in the projects root directory with the Mongodb connection string:
  ```
    MONGODB_USERNAME=xxx
    MONGODB_PASSWORD=xxx
    MONGODB_IP_ADDRESS=111.111.111.111
  ```

## Running nodejs instance
  ```
    $ npm start
  ```

## Running on docker
  Create docker image:
  ```
    docker build -t usgs-nodejs-data-fetch .
  ```

  Create docker container:
  ```
    docker run -v $(pwd)/.env:/usr/src/app/.env --net mongodb-docker_default --name usgs-nodejs-data-fetch-container usgs-nodejs-data-fetch 
  ```
