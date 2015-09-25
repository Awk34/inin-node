'use strict';

require('babel/register', {
    optional: [
        'es7.functionBind'
    ]
});

// Export the application
module.exports = require('./test');
