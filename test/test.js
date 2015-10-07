'use strict';
import inin from '../';
import _request from 'request';
import bluebird from 'bluebird';

const request = bluebird.promisify(_request);

const TEST_USERNAME = process.env.TEST_USERNAME || 'testhacker@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'test1234';

inin.login(TEST_USERNAME, TEST_PASSWORD)
    .then(() => {
        console.log(inin.configure());
        inin.getThing()
            .then(([inc, body]) => {
                console.log(body);
            });
    })
    .catch(console.log.bind(console));
