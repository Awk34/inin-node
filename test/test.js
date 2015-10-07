'use strict';
import inin from '../';
import _request from 'request';
import bluebird from 'bluebird';

const request = bluebird.promisify(_request);

inin.login('testhacker@example.com', 'test1234')
    .then(() => {
        console.log(inin.configure());
        inin.getThing()
            .then(([inc, body]) => {
                console.log(body);
            });
    })
    .catch(console.log.bind(console));
