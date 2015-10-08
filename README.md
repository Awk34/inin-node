##Interactive Intelligence Purecloud Node.js SDK

[![Build Status](https://travis-ci.org/Awk34/inin-node.svg)](https://travis-ci.org/Awk34/inin-node)

### Usage

`npm install --save inin`

```js
var inin = require('inin');

inin.login('user@example.com', 'password').then(function() {
    inin.createUser({
        email: 'user@example.com',
        name: 'User Name',
        phone: '317222222',
        password: 'password'
    });
});
```

### Developing

`npm install`

To run tests, `gulp test` from project root
