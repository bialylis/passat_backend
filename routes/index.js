var express = require('express');
var router = express.Router();

var auth = require('./auth.js');

/*
 * Routes that can be accessed by any one
 */
router.post('/register', require('./register').register);
router.post('/login', auth.login);

module.exports = router;
