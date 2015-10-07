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

//inin.login(TEST_USERNAME, TEST_PASSWORD)
//    .then(() => {
//        //console.log(inin.configure());
//        inin.getThing()
//            .then(([inc, body]) => {
//                console.log(body);
//            });
//    })
//    .catch(::console.log);

describe('inin', function() {
    describe('#login()', function() {
        //before(function() {
        //    return inin.login(TEST_USERNAME, TEST_PASSWORD);
        //});

        it('should log in successfully', function() {
            return inin.login(TEST_USERNAME, TEST_PASSWORD).should.eventually.be.fulfilled;
        });
    });
});
