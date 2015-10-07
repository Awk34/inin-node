'use strict';

var _slicedToArray = require('babel-runtime/helpers/sliced-to-array')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
    value: true
});
exports.configure = configure;
exports.login = login;
exports.createUser = createUser;
exports.createPhone = createPhone;
exports.getThing = getThing;
exports.getUser = getUser;
exports.makeRequest = makeRequest;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _request2 = require('request');

var _request3 = _interopRequireDefault(_request2);

var _defaultsJson = require('./defaults.json');

var _defaultsJson2 = _interopRequireDefault(_defaultsJson);

var VERSION = '0.0.1';

exports.VERSION = VERSION;

var request = _bluebird2['default'].promisify(_request3['default']);

var log = function log() {
    console.log.apply(console, arguments).bind(console);
};
if (!process.env.DEBUG) {
    log.debug = function () {};
} else {
    log.debug = console.log;
}

var config = _defaultsJson2['default'];

function configure(options) {
    if (!options) return config;
    config = _lodash2['default'].assign(_defaultsJson2['default'], options);
    request = request.defaults({ headers: config.headers, jar: config.jar });
    return config;
}

configure({ headers: { userAgent: "inin-node/" + VERSION } });

function parseCookies(cookieString) {
    var list = {};

    cookieString && cookieString.split(';').forEach(function (cookie) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

var SESSION_URL = 'https://apps.ininsca.com/platform/api/v1/sessions';
/**
 * Create a session, getting the session ID back
 * @param {Object} [options]
 * @param {request.jar} [options.jar] - A RequestJS jar to use
 * @param {Iterable} [options.cookies] - key/value pairs ({name, value}) to construct a cookie jar out of
 * @returns {Promise}
 */
function createSession() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var reqConfig = {
        method: 'POST',
        url: SESSION_URL,
        body: { minutesToLive: 1440 },
        json: true
    };

    if (options.jar) {
        reqConfig.jar = options.jar;
    }

    if (options.cookies) {
        (function () {
            var j = request.jar();

            _lodash2['default'].forEach(options.cookies, function (cookie) {
                j.setCookie(request.cookie(cookie.name + '=' + cookie.value), SESSION_URL);
            });

            reqConfig.jar = j;
        })();
    }

    return request(reqConfig).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var inc = _ref2[0];
        var body = _ref2[1];

        log.debug('===' + inc.statusCode + '===');
        log.debug(inc.headers);
        log.debug(body);
        return _Promise.resolve(body);
    });
}

/**
 * Supply credentials to get auth tokens back
 * @param {String} username
 * @param {String} password
 * @param {Object} [options]
 * @returns {Promise}
 */

function login(username, password) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return request({
        method: 'POST',
        url: 'https://apps.ininsca.com/platform/api/v1/login',
        body: {
            userIdentifier: username,
            password: password
        },
        json: true
    }).then(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var inc = _ref32[0];
        var body = _ref32[1];

        log.debug('===' + inc.statusCode + '===');
        log.debug(inc.headers);
        var authSession = (0, _lodash2['default'])(inc.headers['set-cookie']).filter(function (cookieString) {
            return cookieString.indexOf('ININ-Auth-Api') >= 0;
        }).first();
        authSession = parseCookies(authSession);
        authSession = _lodash2['default'].get(authSession, 'ININ-Auth-Api');
        //console.log(authSession);

        var j = request.jar();
        j.setCookie(request.cookie('ININ-Auth-Api=' + authSession), 'https://apps.ininsca.com/platform/api/v1/sessions');

        configure({ jar: j });

        // request should have our new cookie jar
        return createSession().then(function (body) {
            configure({ headers: { 'ININ-Session': body.id } });

            return _Promise.resolve(config);
        });
    });
}

/**
 *
 */

function createUser() {}

/**
 * Set a role of a given user
 * @param userId
 * @param roleId
 */
function setRole(userId, roleId) {
    return request({
        method: 'PUT',
        url: 'https://apps.ininsca.com/platform/api/v1/authorization/users/' + userId + '/roles',
        body: [roleId],
        json: true
    }).then(function (_ref4) {
        var _ref42 = _slicedToArray(_ref4, 2);

        var inc = _ref42[0];
        var body = _ref42[1];

        return _Promise.resolve(body);
    });
}

/**
 *
 */

function createPhone() {}

function getThing() {
    return request('https://apps.ininsca.com/platform/api/v1/authorization/roles');
}

function getUser() {
    var userId = arguments.length <= 0 || arguments[0] === undefined ? 'me' : arguments[0];

    return request('https://apps.ininsca.com/platform/api/v1/users/' + userId);
}

/**
 * Make a request with the SDK's current instance of request
 * @param {Object} options - options passed to RequestJS
 */

function makeRequest() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? { url: 'https://apps.ininsca.com/platform/api/v1/users/me' } : arguments[0];

    return request(options);
}

exports['default'] = {
    VERSION: VERSION,
    configure: configure,
    login: login,
    getThing: getThing,
    makeRequest: makeRequest
};