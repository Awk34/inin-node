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

var VERSION = require('../package.json').version;

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

        if (inc.statusCode >= 300) return _Promise.reject(body);

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
    }).then(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var inc = _ref32[0];
        var body = _ref32[1];

        if (inc.statusCode >= 300) return _Promise.reject(body);

        log.debug('===' + inc.statusCode + '===');
        log.debug(inc.headers);

        var authSession = (0, _lodash2['default'])(inc.headers['set-cookie']).filter(function (cookieString) {
            return cookieString.indexOf('ININ-Auth-Api') >= 0;
        }).first();
        authSession = parseCookies(authSession);
        authSession = _lodash2['default'].get(authSession, 'ININ-Auth-Api');
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

function login(username, password) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    return createLogin(username, password).then(function (authSession) {
        var j = request.jar();
        j.setCookie(request.cookie('ININ-Auth-Api=' + authSession), 'https://apps.ininsca.com/platform/api/v1/sessions');

        configure({ jar: j });

        // request should have our new cookie jar
        return createSession().then(function (session) {
            configure({ headers: { 'ININ-Session': session.id } });

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

function createUser(_ref4) {
    var email = _ref4.email;
    var name = _ref4.name;
    var phone = _ref4.phone;
    var password = _ref4.password;

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
    }).then(function (_ref5) {
        var _ref52 = _slicedToArray(_ref5, 2);

        var inc = _ref52[0];
        var body = _ref52[1];

        if (inc.statusCode >= 300) return _Promise.reject(body);

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
        url: 'https://apps.ininsca.com/platform/api/v1/authorization/users/' + userId + '/roles',
        body: roles,
        json: true
    }).then(function (_ref6) {
        var _ref62 = _slicedToArray(_ref6, 2);

        var inc = _ref62[0];
        var body = _ref62[1];

        if (inc.statusCode >= 300) return _Promise.reject(body);

        return body;
    });
}

/**
 *
 */

function createPhone() {}

/**
 *
 * @param userId
 */

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
    createUser: createUser,
    getUser: getUser,
    setRoles: setRoles,
    makeRequest: makeRequest
};