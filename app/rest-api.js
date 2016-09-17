var express = require("express");
var process = require("process");
const _ = require('lodash');

const bodyParser = require("body-parser");
const sbbDuration = require('./sbb-duration-service');

function queryParametersToPlaces(queryParameters) {
    if (queryParameters.place) {
        if (_.isArray(queryParameters.place)) {
            return queryParameters.place;
        }
        return[ queryParameters.place ];
    }
    return [];
}

module.exports = function (realEstateService) {

    var app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.set('port', (process.env.PORT || 5000));

    app.get("/distance", function (req, res) {
        sbbDuration(_.get(req, 'query.from'),_.get(req, 'query.to'))
            .then( function(sec){ res.json({avgTimeinMinutes: sec});})

    });

    /**
     * Returns the real estates near to the passed coordinate.
     * @param req.query.longitude {number} the longitude of the coordinate for which nearby flats are searched
     * @param req.query.latitude {number} the latitude of the coordinate for which nearby flats are searched
     * @param req.query.place {string | string[]} address of a place for which the public transport travel time should be calculated to the found estates
     * @param req.params.uid {String} the id of the logged in user
     * @param [req.query.page=0] {number} the page number to fetch (starting with 0)
     * @returns the found real estates
     */
    app.get("/realEstates/:uid", function (req, res) {
        if (!req.query.latitude || !req.query.longitude || !req.params.uid) {
            return res.sendStatus(400);
        }

        const places = queryParametersToPlaces(req.query);

        const coordinate = { latitude: req.query.latitude, longitude: req.query.longitude };
        realEstateService.getRealEstatesNearBy(coordinate, req.params.uid, { places, page: req.query.page })
            .then(results => res.send(results));
    });

    /**
     * Returns the real estate with the given id
     * @param :id the id of the real estate to fetch
     * @returns the fetched real estate
     */
    app.get("/realEstates/:id", function (req, res) {
        if (!req.params.id) {
            return res.sendStatus(400);
        }

        realEstateService.getRealEstate(req.params.id).then(estate => res.send(estate));
    });

    /**
     * Trains the service with the given data
     * @param {String} uid the id of the user for which the real estate service is to train
     */
    app.post("/realEstates/:uid/train", function (req, res) {
        if (!req.params.uid) {
            return res.sendStatus(400);
        }

        realEstateService.train(req.params.uid, req.body).then(() => res.sendStatus(200));
    });

    app.listen(app.get('port'), function () {
        console.log('Node app is running on port', app.get('port'));
    });
};