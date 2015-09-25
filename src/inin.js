'use strict';

export const VERSION = '0.0.1';

import _ from 'lodash';
import bluebird from 'bluebird';
import _request from 'request';
import defaults from './defaults.json';

const request = bluebird.promisify(_request);

let config = defaults;

export function configure(options) {
    config = _.defaultsDeep(defaults, options);
}
configure({headers: {userAgent: "inin-node/" + VERSION}});

export function getApiDocs() {
    //request('https://apps.ininsca.com/platform/api-docs').then(console.log.bind(console));
    return request('https://apps.ininsca.com/platform/api-docs');
}
