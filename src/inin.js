'use strict';

const VERSION = '0.0.1';

import _ from 'lodash';

const defaults = {
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

class Inin {
    constructor(options = {}) {
        options = _.defaultsDeep(defaults, options);
    }
}

Inin.VERSION = VERSION;

export default Inin;
