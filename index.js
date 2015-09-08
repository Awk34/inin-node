'use strict';

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'production';

if(env === 'development') {
    // Register the Babel require hook
    require('babel/register');
    
    // Export the application
    exports = module.exports = require('src/inin');
} else {
    // Export the application
    exports = module.exports = require('dist/inin');
}
