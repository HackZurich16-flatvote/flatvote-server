const brain = require("brain");
const _ = require("lodash");

/**
 * @typedef {Object} IRealEstateTrainingRecord
 * @param price {number} the price of the estate
 * @param rooms {number} the number of rooms
 * @param match {boolean} is this estate a match for the user or not?
 */

class RealEstateOracle {

    constructor() {
        this.networks = {};
    }

    /**
     * Trains the neural network for the given user
     * @param uid the id of the user for which the neural network is to be trained
     * @param records {IRealEstateTrainingRecord[]} the records to train
     */
    giveFeedback(uid, records) {
        let networkResolved = this._getNetwork(uid).then(network => network || new brain.NeuralNetwork());

        return networkResolved.then((network) => {
            const inputs = records.map(record => _.omit(record, "match", "rooms"));
            const outputs = records.map(record => ({ match: record.match ? 1.0 : 0.0 }));

            const trainData = _.zipWith(inputs, outputs, (input, output) => ({input, output}));
            console.log(trainData);

            network.train(trainData);
            return this._saveNetwork(uid, network);
        });
    }

    filter(uid, realEstates) {
        return this._getNetwork(uid).then(network => {
            if (!network) {
                return realEstates;
            }

            return realEstates.filter(realEstate => {
                const input = _.pick(realEstate, "price");
                const result = network.run(input);
                console.log(input, result);
                return Math.round(result[0]) === 1;
            });
        });
    }

    /**
     * Resolves the network for the given user id
     * @param uid {String} the id of the user for which the neural network is needed
     * @returns {Promise} a promise that resolves to the neural network or undefined if the user has no trained neural network
     * @private
     */
    _getNetwork(uid) {
        return Promise.resolve(this.networks[`@${uid}`]);
    }

    _saveNetwork(uid, network) {
        this.networks[`@${uid}`] = network;
    }
}

const test = new RealEstateOracle();
test.giveFeedback("micha@famreiser.ch", [{
    price: 1800,
    rooms: 3,
    match: true
},{
    price: 2000,
    rooms: 4.5,
    match: true
}, {
    price: 3000,
    rooms: 4.5,
    match: false
}, {
    price: 2500,
    rooms: 4,
    match: true
}, {
    price: 3000,
    rooms: 4,
    match: false
}]).then(() => {
    test.filter("micha@famreiser.ch", [{
        price: 500,
        rooms: 4.5
    },{
        price: 2000,
        rooms: 4.5
    }, {
        price: 10000,
        rooms: 4.5
    }]).then(matches => console.log(matches));
});

