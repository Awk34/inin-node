##Interactive Intelligence Purecloud Node.js SDK

[![Build Status](https://travis-ci.org/Awk34/inin-node.svg)](https://travis-ci.org/Awk34/inin-node)

### Usage

`npm install --save inin`

```js
var inin = require('inin');

inin.login('user@example.com', 'password').then(function() {
    inin.call('1317222222');
});
```

### Developing

`npm install`

To run tests, `gulp test` from project root
