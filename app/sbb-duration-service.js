const rp = require('request-promise');
const _ = require('lodash');
const moment = require('moment');

module.exports = function (from, to) {
    let conf = {
        uri: 'http://transport.opendata.ch/v1/connections',
        qs: {
            from: from,
            to: to,
            date: '2016-09-20',
            time: '07:30'
        },
        json: true
    };

    return rp(conf).then(
        function (result) {
            return _.mean(result.connections.map(function (value) {
                const cleanedDuration = value.duration.replace('00d', '') ;
                return moment.duration(cleanedDuration, 'HH:mm:ss').asMinutes();
            }));
        });
};