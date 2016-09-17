const _ = require("lodash");

const HomeGateClient = require("./homegate-client");
const sbbService = require("./sbb-duration-service");

/**
 * Service for queering real estates.
 */
class RealEstateService {

    constructor() {
        this.homegateClient = new HomeGateClient();
    }

    /**
     * Fetches the real estate with the given id
     * @param advertisementId the id of the advertisement
     * @returns {Promise} the loaded real estate
     */
    getRealEstate(advertisementId) {
        return this.homegateClient.getRealEstate(advertisementId);
    }

    /**
     * Searches for the real estates near to the given coordinate
     * @param coordinate the coordinate
     * @param {{ name: String, address: String }} places the places for which the travel time between to the estate should be calculated
     * @param {number} page the page number to fetch
     * @param {number} limit the number of elements to show per page
     * @returns {Promise} a promise that is resolved with the real estates near to the given coordinate
     */
    getRealEstatesNearBy(coordinate, places, page=0, limit=5) {
        return this.homegateClient.fetchRealEstatesNearBy(coordinate, page, limit).then(result => {
            let pagingInformation = _.pick(result, "resultCount", "start", "page", "pageCount", "itemsPerPage", "hasNextPage", "hasPreviousPage");
            const travelTimesResolved = Promise.all(result.items.map(estate => this._annotateRealEstate(estate, places)));

            return travelTimesResolved.then(items => (
                Object.assign({
                    items
                }, pagingInformation)
            ));
        });
    }

    /**
     * Adds additional fields to the real estate and removes unused ones
     * @param estate the estate to annotate
     * @param places the places for which the travel time needs to be determined
     * @returns {Promise} returning the annotated real estate
     * @private
     */
    _annotateRealEstate(estate, places) {
        estate = _.pick(estate, "title", "street", "city", "sellingPrice", "pictures", "description", "advertisementId");
        estate.travelTimes = {};
        const travelTimesResolved = places.map(place => this._getTravelTimeBetween(estate, place).then(time => estate.travelTimes[place.name] = time));
        return Promise.all(travelTimesResolved).then(() => estate);
    }

    /**
     * Calculates the average travel time between the real estate and the given place
     * @param { { geolocation: String }} estate the real estate
     * @param {{ name: String, address: String }} place the place to each
     * @returns {Promise<number>} the calculated mean travel time
     * @private
     */
    _getTravelTimeBetween(estate, place) {
        return sbbService(`${estate.street} ${estate.city}`, place.address);
    }
}

module.exports = RealEstateService;