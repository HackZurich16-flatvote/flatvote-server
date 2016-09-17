var express = require("express");
var process = require("process");
const _ = require('lodash');

const moment = require('moment');
const bodyParser = require("body-parser");
const RealEstateService = require("./app/real-estate-service");
const sbbDuration = require('./app/sbb-duration-service');

const realEstateService = new RealEstateService();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('port', (process.env.PORT || 5000));

app.get("/", function (req, res) {
    res.send("Hello World");
});

app.get("/distance", function (req, res) {
    sbbDuration(_.get(req, 'query.from'),_.get(req, 'query.to'))
        .then( function(sec){ res.json({avgTimeinMinutes: sec});})
  
});

/**
 * Returns the real estates near to the passed coordinate.
 * The coordinate is passed as latitude and longitude URL-Parameters.
 * The call accepts the optional URL-Parameter page.
 */
app.get("/realEstates", function (req, res) {
    if (!req.query.latitude || !req.query.longitude) {
        res.sendStatus(400);
    }

    const coordinate = { latitude: req.query.latitude, longitude: req.query.longitude };
    realEstateService.getRealEstatesNearBy(coordinate, req.query.page)
        .then(results => res.send(results));
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});