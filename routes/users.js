const express = require('express');
const router = express.Router();
const users = require('../controllers/users');
const passport = require('passport');



router.route('/login')
    .get(users.loginPage)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.route('/register')
    .get(users.newUserRegistrationForm)
    .post(users.newUserRegistration)

router.get('/logout',users.logout);

module.exports = router;