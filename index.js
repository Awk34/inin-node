'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if(env === 'development') {
    // Register the Babel require hook
    require('babel/register', {
        optional: [
            'es7.functionBind'
        ]
    });
    
    // Export the application
    module.exports = require('./src/inin');
} else {
    // Export the application
    module.exports = require('./dist/inin');
}
