var rp = require('request-promise');

const DEFAULT_ACCESS_TOKEN = "24cd4c54e7704f92a8ae7b71d4e98786";

class HomeGateClient {

    constructor(accessToken=DEFAULT_ACCESS_TOKEN) {
        this.accessToken = accessToken;
    }

    /**
     * Returns a list with the real estates near to the given location
     * @param coordinate the coordination
     * @param page the page number to fetch
     * @returns {Promise} the real estates near by
     * @see https://tamedia.gelato.io/docs/apis/homegate-real-estate-api/versions/1.0/resources/search
     */
    fetchRealEstatesNearBy(coordinate, page=0) {
        const args = { headers: { contentType: "application/json", APIKEY: this.accessToken } };

        const coordinateAsString = encodeURIComponent(`${coordinate.latitude},+${coordinate.longitude}`);

        return rp({
                uri: `https://api.tamedia.cloud/homegate/v1/rs/real-estates?lan=de&cht=rentflat&${page + 1}&nrs=10&nby=${coordinateAsString}&wdi=10`,
                json: true,
                headers: {
                    APIKEY: this.accessToken,
                    contentType: "application/json"
                }
            });
    }
}

module.exports = HomeGateClient;