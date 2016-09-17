const HomeGateClient = require("./homegate-client");

class RealEstateService {

    constructor() {
        this.homegateClient = new HomeGateClient();
    }

    /**
     * Searches for the real estates near to the given coordinate
     * @param coordinate the coordinate
     * @param {number} page the page number to featch
     * @returns {Promise} a promise that is resolved with the real estates near to the given coordinate
     */
    getRealEstatesNearBy(coordinate, page=0) {
        return this.homegateClient.fetchRealEstatesNearBy(coordinate, page);
    }
}

module.exports = RealEstateService;