'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var VERSION = '0.0.1';

var defaults = {
    key: null,
    secret: null,

    headers: {
        'Accept': '*/*',
        'Connection': 'close',
        'User-Agent': 'inin-node/' + VERSION
    },

    rest_base: 'https://public-api.us-east-1.inindca.com/api/v1',

    secure: false, // force use of https for login/gatekeeper
    cookie: 'ininauth',
    cookie_options: {},
    cookie_secret: null
};

var Inin = function Inin() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, Inin);

    options = _lodash2['default'].defaultsDeep(defaults, options);
};

Inin.VERSION = VERSION;

exports['default'] = Inin;
module.exports = exports['default'];