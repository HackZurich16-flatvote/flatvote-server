var rp = require('request-promise');

const DEFAULT_ACCESS_TOKEN = "24cd4c54e7704f92a8ae7b71d4e98786";

/**
 * Client that access the Home Gate endpoint to fetch real estate information.
 */
class HomeGateClient {

    constructor(accessToken=DEFAULT_ACCESS_TOKEN) {
        this.accessToken = accessToken;
    }

    /**
     * Returns a list with the real estates near to the given location
     * @param coordinate the coordination
     * @param page the page number to fetch
     * @param limit the number of elements at most per page.
     * @returns {Promise} the real estates near by
     * @see https://tamedia.gelato.io/docs/apis/homegate-real-estate-api/versions/1.0/resources/search
     */
    fetchRealEstatesNearBy(coordinate, page, limit) {
        const args = {
            headers: {
                contentType: "application/json",
                APIKEY: this.accessToken
            }
        };

        const encodedCoordinates = encodeURIComponent(`${coordinate.latitude},${coordinate.longitude}`);
        const options = {
            uri: `https://api.tamedia.cloud/homegate/v1/rs/real-estates?lan=de&cht=rentflat&${page + 1}&nrs=${limit}&nby=${encodedCoordinates}&wdi=10`,
            json: true,
            headers: {
                APIKEY: this.accessToken,
                contentType: "application/json"
            }
        };

        return rp(options);
    }
}

module.exports = HomeGateClient;