'use strict';
import inin from '../src/inin';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import _request from 'request';
import bluebird from 'bluebird';

chai.use(chaiAsPromised);

const expect = chai.expect;
const should = chai.should();
const request = bluebird.promisify(_request);

/*global it, describe, require*/

const TEST_USERNAME = process.env.TEST_USERNAME || 'testhacker@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'test1234';

//inin.login(TEST_USERNAME, TEST_PASSWORD).then(() => {
//    inin.getThing().then(([inc, body]) => {
//        console.log(body);
//    });
//}).catch(console.log.bind(console));

describe('inin', function() {
    describe('#login()', function() {
        it('should log in successfully', function() {
            return inin.login(TEST_USERNAME, TEST_PASSWORD).should.eventually.be.fulfilled;
        });
    });
});
