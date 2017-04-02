var express = require('express');
var router = express.Router();
var secret = require('./secret_info.js');
var auth = require('./auth.js');
var groups = require('./groups.js');

/*
 * Routes that can be accessed by any one
 */
router.post('/register', require('./register').register);
router.post('/login', auth.login);

router.get('/auth/secret', secret.get);
router.get('/auth/group', groups.getAll);
router.get('/auth/group/:id', groups.getOne);

router.post('/auth/group', groups.create);
router.post('/auth/group/:id', groups.update);

router.delete('/auth/group/:id', groups.delete);


module.exports = router;
