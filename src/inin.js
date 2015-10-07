'use strict';

export const VERSION = '0.0.1';

import _ from 'lodash';
import bluebird from 'bluebird';
import _request from 'request';
import defaults from './defaults.json';

let request = bluebird.promisify(_request);

let config = defaults;

export function configure(options) {
    if(!options) return config;
    config = _.assign(defaults, options);
    request = request.defaults({headers: config.headers, jar: config.jar});
    return config;
}
configure({headers: {userAgent: "inin-node/" + VERSION}});

function parseCookies(cookieString) {
    var list = {};

    cookieString &&
    cookieString
        .split(';')
        .forEach(cookie => {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = decodeURI(parts.join('='));
        });

    return list;
}

/**
 *
 * @param username
 * @param password
 * @param options
 */
export function login(username, password, options) {
    return request({
        method: 'POST',
        url: 'https://apps.ininsca.com/platform/api/v1/login',
        body: {
            userIdentifier: username,
            password: password
        },
        json: true
    })
        .then(([inc, body]) => {
            //console.log('===' + inc.statusCode + '===');
            //console.log(inc.headers);
            let authSession = _(inc.headers['set-cookie'])
                .filter(cookieString => cookieString.indexOf('ININ-Auth-Api') >= 0)
                .first();
            authSession = parseCookies(authSession);
            authSession = _.get(authSession, 'ININ-Auth-Api');
            //console.log(authSession);

            let j = request.jar();
            j.setCookie(request.cookie(`ININ-Auth-Api=${authSession}`), 'https://apps.ininsca.com/platform/api/v1/sessions');

            return request({
                method: 'POST',
                url: 'https://apps.ininsca.com/platform/api/v1/sessions',
                body: {minutesToLive: 1440},
                json: true,
                jar: j
            })
                .then(([inc, body]) => {
                    //console.log('===' + inc.statusCode + '===');
                    //console.log(inc.headers);
                    //console.log(body);

                    config.jar = j;
                    config.headers['ININ-Session'] = body.id;

                    return Promise.resolve(config);
                });
        });
}

export function getThing() {
    return request.defaults({jar: config.jar, headers: config.headers})('https://apps.ininsca.com/platform/api/v1/billing/invoices');
}

export default {
    config,
    configure,
    login,
    getThing
}
