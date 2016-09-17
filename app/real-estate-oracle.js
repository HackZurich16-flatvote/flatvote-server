const brain = require("brain");
const _ = require("lodash");

/**
 * Network that automatically retrains itself if new data is available
 */
class RetrainableNeuralNetwork {
    constructor() {
        this.trainingData = [];
        this.network = new brain.NeuralNetwork();
    }

    run() {
        return this.network.run.apply(this.network, arguments);
    }

    train(trainingData) {
        this.trainingData = this.trainingData.concat(trainingData);
        this.network.train(this.trainingData);
    }
}

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
        let networkResolved = this._getNetwork(uid).then(network => network || new RetrainableNeuralNetwork());

        return networkResolved.then((network) => {
            const inputs = records.map(record => this._estateToInput(record));
            const outputs = records.map(record => ([record.match ? 1.0 : 0.0 ]));

            const trainData = _.zipWith(inputs, outputs, (input, output) => ({input, output}));

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
                const result = network.run(this._estateToInput(realEstate));
                return Math.round(result[0]) === 1;
            });
        });
    }

    _estateToInput(estate) {
        return { price: estate.price / 10000, rooms: estate.numberRooms / 10};
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

module.exports = RealEstateOracle;