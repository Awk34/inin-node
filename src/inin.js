'use strict';

export const VERSION = '0.0.1';

import _ from 'lodash';
import bluebird from 'bluebird';
import _request from 'request';
import defaults from './defaults.json';

let request = bluebird.promisify(_request);

if(process.env.NODE_ENV !== 'development') {
    console.log = function() {};
}

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

const SESSION_URL='https://apps.ininsca.com/platform/api/v1/sessions';
/**
 * Create a session, getting the session ID back
 * @param {Object} [options]
 * @param {request.jar} [options.jar] - A RequestJS jar to use
 * @param {Iterable} [options.cookies] - key/value pairs ({name, value}) to construct a cookie jar out of
 * @returns {Promise}
 */
function createSession(options = {}) {
    let reqConfig = {
        method: 'POST',
        url: SESSION_URL,
        body: {minutesToLive: 1440},
        json: true
    };

    if(options.jar) {
        reqConfig.jar = options.jar;
    }

    if(options.cookies) {
        let j = request.jar();

        _.forEach(options.cookies, cookie => {
            j.setCookie(request.cookie(`${cookie.name}=${cookie.value}`), SESSION_URL);
        });

        reqConfig.jar = j;
    }

    return request(reqConfig)
        .then(([inc, body]) => {
            return Promise.resolve(body);
        });
}

/**
 * Supply credentials to get auth tokens back
 * @param {String} username
 * @param {String} password
 * @param {Object} [options]
 * @returns {Promise}
 */
export function login(username, password, options = {}) {
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

            configure({jar: j});

            // request should have our new cookie jar
            return createSession()
                .then(body => {
                    configure({headers: {'ININ-Session': body.id}});

                    return Promise.resolve(config);
                });
        });
}

/**
 *
 */
export function createUser() {

}

/**
 * Set a role of a given user
 * @param userId
 * @param roleId
 */
function setRole(userId, roleId) {
    return request({
        method: 'PUT',
        url: `https://apps.ininsca.com/platform/api/v1/authorization/users/${userId}/roles`,
        body: [roleId],
        json: true
    })
        .then(([inc, body]) => {
            return Promise.resolve(body);
        });
}

/**
 *
 */
export function createPhone() {

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
