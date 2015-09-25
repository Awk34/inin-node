'use strict';
import * as inin from '../';

async function getApiDocs() {
    let result = await inin.apiDocs();
    console.log(result.apiVersion);
    console.log(result.swaggerVersion);
    console.log(result.authorization);
    console.log(result.info);
    console.log(result.apis);
    return result;
}
getApiDocs();
//console.log(inin.getApiDocs());
//inin.getApiDocs().then(console.log.bind(console));
