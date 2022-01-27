const User = require('../models/users');

module.exports.newUserRegistrationForm = (req, res) => {
    res.render('users/register');
}

module.exports.newUserRegistration = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) {
                req.flash('error', 'Something went wrong!');
                return res.redirect('/login');
            }
            req.flash('success', 'Successfully registered new user!');
            const returnToUrl = res.session.returnTo || '/tasks';
            res.redirect(returnToUrl);
        })
        // console.log(registeredUser);

    } catch (error) {
        req.flash('error', error.message);
        res.redirect('/register');
    }

}

module.exports.loginPage = (req, res) => {
    res.render('users/login');
}

module.exports.login = async (req, res, next) => {
    try {
        req.flash('success', 'Welcome!');
        delete req.session.returnTo;
        // const returnToUrl = res.session.returnTo || '/tasks';
        res.redirect('/');
    } catch (e) {
        next(e);
    }

}

module.exports.logout = (req, res) => {
    req.logout();
    delete req.user;    // IMP to delete req.user after logout
    req.flash('success', 'Successfully logged you out!');
    res.redirect('/');
}
