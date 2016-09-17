/**
 * Created by longstone on 17/09/16.
 */
const rp = require('request-promise');
const _ = require('lodash');
var API_KEY;

/**
 * conf.title
 * conf.name
 * conf.email
 * conf.description
 * conf.message
 */
const createPoll = function(conf) {
    const reqConf = {
        method: 'post',
        uri: 'http://api.tamedia.cloud/doodle/v1/polls',
        headers: {
            accept: 'application/json',
            apikey: API_KEY,
            'content-type': 'application/json'
        },
        body: {
            type: 'TEXT',
            title: conf.title,
            initiator: {name: conf.name, email: conf.email},
            options: [{date: 1462053600000}],
            rowConstraint: 1,
            description: conf.description,
            personalMessage: conf.message
        },
        json: true
    };

    return rp(reqConf);
};

module.exports = { createPoll };