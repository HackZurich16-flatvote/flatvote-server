/**
 * Created by longstone on 17/09/16.
 */
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
                return moment(value.duration.replace('00d', ''), 'HH:mm:ss').subtract(moment()).minutes();
            }));


        });


};