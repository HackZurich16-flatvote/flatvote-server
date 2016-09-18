var rp = require('request-promise');
const process = require("process");

const DEFAULT_ACCESS_TOKEN = process.env.HOME_GATE_ACCESS_TOKEN;

/**
 * Client that access the Home Gate endpoint to fetch real estate information.
 */
class HomeGateClient {

    constructor(accessToken=DEFAULT_ACCESS_TOKEN) {
        this.accessToken = accessToken;
    }

    /**
     * Fetches the real estate with the given id
     * @param advertisementId the id of the advertisement
     * @returns {Promise} the loaded real estate
     */
    getRealEstate(advertisementId) {
        const options = {
            uri: `https://api.tamedia.cloud/homegate/v1/rs/real-estates/${encodeURIComponent(advertisementId)}`,
            json: true,
            headers: {
                APIKEY: this.accessToken,
                contentType: "application/json"
            }
        };

        return rp.get(options).then(estate => {
            estate.description = estate.adDescription;
            estate.pictures = estate.realEstatePictures.map(pic => pic.url);

            delete estate.adDescription;
            delete estate.realEstatePictures;
            return estate;
        });
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
        const options = {
            uri: `https://api.tamedia.cloud/homegate/v1/rs/real-estates`,
            qs: {
                lan: "de",
                cht: "rentflat",
                pag: page + 1,
                nrs: limit,
                nby: `${coordinate.latitude},${coordinate.longitude}`,
                wdi: 10
            },
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