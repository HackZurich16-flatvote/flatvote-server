const HomeGateClient = require("./homegate-client");

/**
 * Service for queering real estates.
 */
class RealEstateService {

    constructor() {
        this.homegateClient = new HomeGateClient();
    }

    /**
     * Searches for the real estates near to the given coordinate
     * @param coordinate the coordinate
     * @param {number} page the page number to fetch
     * @param {number} limit the number of elements to show per page
     * @returns {Promise} a promise that is resolved with the real estates near to the given coordinate
     */
    getRealEstatesNearBy(coordinate, page=0, limit=20) {
        return this.homegateClient.fetchRealEstatesNearBy(coordinate, page, limit);
    }
}

module.exports = RealEstateService;