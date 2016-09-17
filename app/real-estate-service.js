const _ = require("lodash");

const HomeGateClient = require("./homegate-client");
const RealEstateOracle = require("./real-estate-oracle");
const sbbService = require("./sbb-duration-service");

/**
 * Service for queering real estates.
 */
class RealEstateService {

    constructor() {
        this.homegateClient = new HomeGateClient();
        this.realEstateOracle = new RealEstateOracle();
    }

    onVoteAdded(snapshot) {
        const vote = snapshot.val();

        const realEstate = this.getRealEstate(vote.advertisementId).then(realEstate => {
            this.realEstateOracle.train(vote.uid, {
                numberRooms: realEstate.numberRooms,
                sellingPrice: realEstate.sellingPrice,
                match: vote.value > 0
            });
        });
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
     * Trains the real estate service with more input
     * @param userId {String} the id of the user
     * @param results {IRealEstateTrainingRecord[]}
     * @returns {Promise} that resolves when the training is complete
     */
    train(userId, results) {
        return this.realEstateOracle.giveFeedback(userId, results);
    }

    /**
     * Searches for the real estates near to the given coordinate
     * @param coordinate the coordinate
     * @param uid {String} user id
     * @param {String[]} [places] the places for which the travel time between to the estate should be calculated
     * @param {number} [page] the page number to fetch
     * @param {number} [limit] the number of elements to show per page
     * @returns {Promise} a promise that is resolved with the real estates near to the given coordinate
     */
    getRealEstatesNearBy(coordinate, uid, { places=[], page=0, limit=5 }) {
        return this._fetchSuggestedRealEstates(coordinate, uid, page, limit).then(result=> {
            let pagingInformation = _.pick(result, "page", "itemsPerPage");
            const travelTimesResolved = Promise.all(result.items.map(estate => this._annotateRealEstate(estate, places)));

            return travelTimesResolved.then(items => (
                Object.assign({
                    items
                }, pagingInformation)
            ));
        });
    }

    _fetchSuggestedRealEstates(coordinate, uid, page, limit, results=[]) {
        return this.homegateClient.fetchRealEstatesNearBy(coordinate, page, limit * 4)
            .then(result => this.realEstateOracle.filter(uid, result.items))
            .then(filtered => {
                results.push.apply(results, filtered);
                if (results.length < limit) {
                    return this._fetchSuggestedRealEstates(coordinate, uid, page + 1, limit, results);
                }
                return {
                    page,
                    itemsPerPage: limit,
                    items: _.take(results, limit)
                };
            });
    }

    /**
     * Adds additional fields to the real estate and removes unused ones
     * @param estate the estate to annotate
     * @param places {String[]} the places for which the travel time needs to be determined
     * @returns {Promise} returning the annotated real estate
     * @private
     */
    _annotateRealEstate(estate, places) {
        estate = _.pick(estate, "title", "street", "city", "sellingPrice", "pictures", "description", "advertisementId", "numberRooms");
        const travelTimesResolved = places.map(place => this._getTravelTimeBetween(estate, place));
        return Promise.all(travelTimesResolved).then((travelTimes) => {
            estate.travelTimes = estate.travelTimes = travelTimes;
            return estate;
        });
    }

    /**
     * Calculates the average travel time between the real estate and the given place
     * @param { { geolocation: String }} estate the real estate
     * @param {String} place the place to reach
     * @returns {Promise<number>} the calculated mean travel time
     * @private
     */
    _getTravelTimeBetween(estate, place) {
        return sbbService(`${estate.street} ${estate.city}`, place);
    }
}

module.exports = RealEstateService;