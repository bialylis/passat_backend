var express = require('express');
var router = express.Router();
var secret = require('./secret_info.js');
var auth = require('./auth.js');

/*
 * Routes that can be accessed by any one
 */
router.post('/register', require('./register').register);
router.post('/login', auth.login);

router.get('/auth/secret', secret.get);


module.exports = router;
