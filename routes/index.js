var express = require('express');
var router = express.Router();
var secret = require('./secret_info.js');
var auth = require('./auth.js');
var groups = require('./groups.js');
var managment = require('./user_managment.js');
var crypto = require('./crypto.js');
var password = require('./password.js');

/*
 * Routes that can be accessed by any one
 */
router.post('/register', require('./register').register);
router.post('/login', auth.login);

router.get('/auth/secret', secret.get);

router.use('/auth/group/:id', [require('../middlewares/validateUserRole.js')]);

router.get('/auth/group', groups.getAll);
router.get('/auth/group/:id', groups.getOne);

router.post('/auth/group/:id/password', password.add_group_password)

router.get('/auth/group/:id/password', password.get_group_passwords)
router.get('/auth/group/:id/password/:passid', password.get_group_password)
router.get('/auth/group/:id/passwordnamed', password.get_password_ids)

router.delete('/auth/group/:id/password/:passid', password.delete_password)

router.post('/auth/group', groups.create);
router.post('/auth/group/:id', groups.update);

router.delete('/auth/group/:id', groups.delete);

router.post('/auth/group/:id/member', managment.invite)
router.delete('/auth/group/:id/member/:userid', managment.remove)

router.post('/auth/crypto', crypto.generate_new_keypair)

router.post('/auth/crypto/encrypt', crypto.encrypt)
router.post('/auth/crypto/decrypt', crypto.decrypt)

router.get('/auth/crypto/private', crypto.privateKeyPem)
router.get('/auth/crypto/public/:id', crypto.publicKeyPem)



module.exports = router;
