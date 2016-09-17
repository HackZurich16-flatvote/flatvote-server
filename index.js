var express = require("express");
var process = require("process");
var bodyParser = require("body-parser");
const RealEstateService = require("./app/real-estate-service");

const realEstateService = new RealEstateService();

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('port', (process.env.PORT || 5000));

app.get("/", function (req, res) {
    res.send("Hello World");
});

app.get("/realEstates", function (req, res) {
    if (!req.query.latitude || !req.query.longitude) {
        res.sendStatus(400);
    }

    const coordinate = { latitude: req.query.latitude, longitude: req.query.longitude };
    realEstateService.getRealEstatesNearBy(coordinate, 0).then(results => res.send(results));
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});