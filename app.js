if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const mongoose = require('mongoose');
const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');

const ejsMate = require('ejs-mate');    //for making boilerplate
const flash = require('connect-flash');
const Quote = require('inspirational-quotes');

const ExpressError = require('./utils/expressError');
const mongoSanitize = require('express-mongo-sanitize');//so that no user types a script tag or html

const userRoutes = require('./routes/users');
const taskRoutes = require('./routes/tasks');

const schedule = require('node-schedule');//node scheduler for email

const User = require('./models/users')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const GoogleStrategy = require('passport-google-oauth20').Strategy;//for google auth

const MongoStore = require('connect-mongo'); // for storing session in mongodb-atlas


const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/todolistextension';
const secret = process.env.SECRET || 'thisismysecret';

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Database connected");
    })
    .catch(err => {
        console.log("ERROR!!!");
        console.log(err);
    });

    

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(mongoSanitize({
    replaceWith: '_',
}),
);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));


const sessionConfig = {
    store: MongoStore.create({
        mongoUrl: dbUrl,
        secret,
        touchAfter: 24 * 60 * 60
    }),
    name: 'session',
    cookie: {
        httpOnly: true,
        // secure: true, //this is only used when we deploy so that ppl use https ,s for secure and
        //localhost is not secure
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
    secret,
    resave: false,
    saveUninitialized: true,

};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));


//both coming from plugin added in users model
// passport.serializeUser(User.serializeUser()); //to get a user in a session
// passport.deserializeUser(User.deserializeUser());//to get a user out of a session 


//this below code serialize and deserialze in all strategies not just local
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


//google authentication
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "https://agile-island-00621.herokuapp.com/auth/google/tasks",
},
    function (accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id, email: profile._json.email, username: profile.displayName }, function (err, user) {
            return cb(err, user);
        });
    }
));


// let timearr = [];
app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;  //this is to check if there is a user logged in (passport facility)
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use(async (req,res,next) =>
{
    console.log("I am email middleware");
    const cuser = req.user;
    console.log("I am cuser "+cuser);
    if(cuser)
    {
        if(cuser.newAddedTask.reminder)
        {
            let ele = cuser.newAddedTask.reminder;
            const dateObj = new Date();
            let hr=0;
            if(ele[0]=='0')
            hr = parseInt(ele[1]);
            else
            hr = parseInt(ele[0]+ele[1]);
            let am = 0;
            if(hr>=12)
            {
                am=1;
            }
            
            let minutes = parseInt(ele[3]+ele[4]);
            let day = dateObj.getDate();
            let month = dateObj.getMonth();
            let year = dateObj.getFullYear();
            
            const date = new Date(year, month, day, hr, minutes, am);
        
            const job = schedule.scheduleJob(date, function () {
            const sgMail = require('@sendgrid/mail')
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
        
                const msg = {
                to: `${cuser.email}`, // Change to your recipient
                from: 'jaimehta0724@gmail.com', // Change to your verified sender
                subject: `Task reminder from todolist`,
                text: 'something',
                html: `<strong>Your task: "${cuser.newAddedTask.task}" is scheduled at ${cuser.newAddedTask.from}</strong>`,
                }
                sgMail
                .send(msg)
                .then(() => {
                    console.log(`${cuser.email}`);
                    console.log('Email sent')
                })
                .catch((error) => {
                    console.error(error)
                })
                console.log(`time`);

            });
            console.log("I am a reminder "+cuser.newAddedTask.reminder)
            cuser.newAddedTask.reminder=null;
            await cuser.save();

        }
    }
    next();
    
})


app.use('/',userRoutes);
app.use('/tasks',taskRoutes);


app.get('/', (req, res) => {
    let quote = Quote.getQuote({ author: false });
    console.log(quote.text);
    res.render('home', { quote });
})

app.get('/auth/google',passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/tasks',passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        req.flash('success', 'Welcome!');
        res.redirect('/');
    });











app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));

})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Something Went Wrong :(';
    res.status(statusCode).render('error', { err });
})
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}!`);
})