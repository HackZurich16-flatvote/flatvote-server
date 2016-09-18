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
        // do not train until we have at least some data, otherwise all other input is excluded
        if (this.trainingData.length >= 4) {
            this.network.train(this.trainingData);
        }
    }
}

/**
 * @typedef {Object} IRealEstateTrainingRecord
 * @param sellingPrice {number} the price of the estate
 * @param numberRooms {number} the number of rooms
 * @param match {boolean} is this estate a match for the user or not?
 */
class RealEstateOracle {

    constructor() {
        this.networks = {};
    }

    /**
     * Trains the neural network for the given user
     * @param uid the id of the user for which the neural network is to be trained
     * @param decision {IRealEstateTrainingRecord} the decision to train
     */
    train(uid, decision) {
        console.log(`Train oracle for ${uid} with new decision ${decision.numberRooms}, ${decision.sellingPrice}, ${decision.match}`);
        const network = this._getNetwork(uid) || new RetrainableNeuralNetwork();

        const input = this._estateToInput(decision);
        const output = [ decision.match ? 1.0 : 0.0 ];
        network.train([ { input, output } ]);
        return this._saveNetwork(uid, network);
    }

    filter(uid, realEstates) {
        const network = this._getNetwork(uid);
        if (!network) {
            return realEstates;
        }

        return realEstates.filter(realEstate => {
            const result = network.run(this._estateToInput(realEstate));
            console.log({ price: realEstate.sellingPrice, rooms: realEstate.numberRooms}, result);
            return Math.round(result[0]) === 1;
        });
    }

    _estateToInput(estate) {
        return { price: estate.sellingPrice / 10000, rooms: estate.numberRooms / 10};
    }

    /**
     * Resolves the network for the given user id
     * @param uid {String} the id of the user for which the neural network is needed
     * @returns {Promise} a promise that resolves to the neural network or undefined if the user has no trained neural network
     * @private
     */
    _getNetwork(uid) {
        return this.networks[this._getNetworkKey(uid)];
    }

    _saveNetwork(uid, network) {
        this.networks[this._getNetworkKey(uid)] = network;
    }

    _getNetworkKey(uid) {
        return `@${uid.replace(".", ",")}`;
    }
}

module.exports = RealEstateOracle;