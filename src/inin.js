'use strict';

export const VERSION = require('../package.json').version;

import _ from 'lodash';
import bluebird from 'bluebird';
import _request from 'request';
import defaults from './defaults.json';

let request = bluebird.promisify(_request);

let log = function(...args) {
    console.log(...args).bind(console);
};
if(!process.env.DEBUG) {
    log.debug = function () {};
} else {
    log.debug = console.log;
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
            if(inc.statusCode >= 300) return Promise.reject(body);

            log.debug('===' + inc.statusCode + '===');
            log.debug(inc.headers);
            log.debug(body);
            return body;
        });
}

function createLogin(username, password) {
    return request({
        method: 'POST',
        url: 'https://apps.ininsca.com/platform/api/v1/login',
        body: {
            userIdentifier: username,
            password: password
        },
        json: true
    }).then(([inc, body]) => {
        if(inc.statusCode >= 300) return Promise.reject(body);

        log.debug('===' + inc.statusCode + '===');
        log.debug(inc.headers);

        let authSession = _(inc.headers['set-cookie'])
            .filter(cookieString => cookieString.indexOf('ININ-Auth-Api') >= 0)
            .first();
        authSession = parseCookies(authSession);
        authSession = _.get(authSession, 'ININ-Auth-Api');
        //console.log(authSession);

        return authSession;
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
    return createLogin(username, password).then(authSession => {
        let j = request.jar();
        j.setCookie(request.cookie(`ININ-Auth-Api=${authSession}`), 'https://apps.ininsca.com/platform/api/v1/sessions');

        configure({jar: j});

        // request should have our new cookie jar
        return createSession()
            .then(session => {
                configure({headers: {'ININ-Session': session.id}});

                return config;
            });
    });
}

/**
 * Create a new PureCloud user
 * @param email
 * @param name
 * @param phone
 * @param password
 * @returns {Promise}
 */
export function createUser({email, name, phone, password}) {
    return request({
        method: 'POST',
        url: 'https://apps.ininsca.com/platform/api/v1/users',
        body: {
            'username': email,
            'email': email,
            'name': name,
            'displayName': name,
            'phoneNumber': phone,
            'requestedStatus': 'UserStatus',
            'voicemailEnabled': true,
            'department': 'Hackathon Hackers',
            'title': 'Hackathon Hacker',
            'password': password
        },
        json: true
    })
        .then(([inc, body]) => {
            if(inc.statusCode >= 300) return Promise.reject(body);

            log.debug('===' + inc.statusCode + '===');
            log.debug(inc.headers);

            return body;
        });
}

/**
 * Set roles of a given user
 * @param {String} userId
 * @param {String[]} roles
 */
function setRoles(userId, roles) {
    return request({
        method: 'PUT',
        url: `https://apps.ininsca.com/platform/api/v1/authorization/users/${userId}/roles`,
        body: roles,
        json: true
    })
        .then(([inc, body]) => {
            if(inc.statusCode >= 300) return Promise.reject(body);

            return body;
        });
}

/**
 *
 */
export function createPhone() {

}

/**
 *
 * @param userId
 */
export function getUser(userId = 'me') {
    return request(`https://apps.ininsca.com/platform/api/v1/users/${userId}`);
}

/**
 * Make a request with the SDK's current instance of request
 * @param {Object} options - options passed to RequestJS
 */
export function makeRequest(options = {url: 'https://apps.ininsca.com/platform/api/v1/users/me'}) {
    return request(options);
}

export default {
    VERSION,
    configure,
    login,
    createUser,
    getUser,
    setRoles,
    makeRequest
}
