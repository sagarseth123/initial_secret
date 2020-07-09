require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var reload = require("reload");
const ejs = require("ejs");
const date = require(__dirname + "/date.js");
const session = require('express-session');
const passport = require('passport');

const findOrCreate = require("mongoose-findorcreate");
const passportLocalMongoose = require("passport-local-mongoose");
var GoogleStrategy = require('passport-google-oauth20').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy;


const app = express();
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret must be kept secret',
    resave: false,
    saveUninitialized: true,
    //at saveUninitialize:true,it will remail login untill we logout
    // but at "false" it will logout whenever we close secrets tab
}));
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect("mongodb+srv://seth4444:seth4444@cluster2.yf9no.mongodb.net/user_secrets", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});

var userSchema = new mongoose.Schema({

    local: {
        username: String,
        password: String
    },
    name: String,
    googleId: String

});

var secretSchema = new mongoose.Schema({
    secret: String,
    comments: Array,
    likes: Array,
    date: String,
    person: String

});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);


const User = new mongoose.model("User", userSchema);
const Secret = new mongoose.model("secret", secretSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


//google authentication

passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: " https://tranquil-garden-42667.herokuapp.com/auth/google/secrets"
    },
    function(accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({ googleId: profile.id }, function(err, user) {
            return cb(err, user);

        });
    }
));


//facebook authentication

//passport.use(new FacebookStrategy({
//       clientID: process.env.FACEBOOK_APP_ID,
//        clientSecret: process.env.FACEBOOK_APP_SECRET,
//        callbackURL: "http://localhost:3000/auth/facebook/secrets"
//    },
//    function(accessToken, refreshToken, profile, cb) {
//        console.log(profile);
//      User.findOrCreate({ facebookId: profile.id }, function(err, user) {
//          return cb(err, user);
//      });
//  }
//));





//get req



app.get("/", function(req, res) {
    res.render("home", {});
});

app.get("/login", function(req, res) {
    res.render("login", {});
});

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});


app.get("/register", function(req, res) {
    res.render("register", {});
});

app.get("/submit", checkAuthentication, function(req, res) {
    res.render("submit");
});

function href() {
    Secrets.find({}, function(err, found) {
        found.forEach(item => {
            console.log(item._id);
        })

    });
}




app.get('/users', checkAuthentication, function(req, res) {
    //console.log(req.user._id);
    Secret.find({ secret: { $ne: null } }).sort({ date: -1 }).exec(function(err, userFound) {
        //Secret.find({ secret: { $ne: null } }, function(err, userFound) {
        if (userFound) {
            //console.log(userFound);
            res.render("users", { user: req.user, found: userFound });
        } else {
            console.log("hyyyy");
            //res.render("users");
        }

    });
});

app.get('/secrets', checkAuthentication, function(req, res) {

    Secret.find({ person: req.user._id }, function(err, found) {
        res.render("secrets", { my: found, me: req.user });
    });


});






function checkAuthentication(req, res, next) {
    if (req.isAuthenticated()) {
        //req.isAuthenticated() will return true if user is logged in
        //res.redirect("/submit");
        next();
    } else {
        res.redirect("/login");
    }
}




//google auth
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));
app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/register' }),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });


// facebook auth
//app.get('/auth/facebook',
//   passport.authenticate('facebook'));

////app.get('/auth/facebook/secrets',
///    passport.authenticate('facebook', { failureRedirect: '/login' }),
//    function(req, res) {
// Successful authentication, redirect home.
//       res.redirect('/secrets');
//   });







//post req




app.post("/register", function(req, res) {

    User.register({ username: req.body.username, active: false }, req.body.password, function(err, user) {

        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/users");
            });
        }
    });
});

app.post("/login", function(req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });
    req.login(user, function(err) {
        if (err) {
            return next(err);
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("users");
            });
        }
    });
});




app.post("/name", function(req, res) {
    console.log(req.body.username);


    User.findOneAndUpdate({ _id: req.user._id }, { $set: { name: req.body.username } }, { new: true }, (err, doc) => {
        if (err) {
            console.log("Something wrong when updating data!");
        }

        console.log(doc);
    });

    res.redirect("/secrets");
});



app.post("/submit", function(req, res) {
    let day = date();
    const secret = new Secret({

        secret: req.body.secret,
        comments: [],
        likes: [" "],
        date: day,
        person: req.user._id

    });
    secret.save();
    res.redirect("/secrets");
});



app.post("/like", function(req, res) {
    //console.log(req.body.person);
    //console.log(req.body.click);
    Secret.findOne({ _id: req.body.click }, function(err, found) {
        var arr = found.likes;
        var count = 0;
        arr.forEach(item => {
            if (item == req.body.person) {

                count = 1;

            } else {
                console.log("not match");

            }
        });
        if (count == 0) {

            found.likes.push(req.body.person);
            found.save();
            count = 0;
        }
        var count = 1;

        //found.likes.push(req.body.person);
    });

    res.redirect("/users");
});


app.post("/comment", function(req, res) {

    Secret.findOne({ _id: req.body.press }, function(err, found) {

        found.comments.push({
            person: req.body.user,
            com: req.body.comment
        });
        found.save();
    });
});



app.post("/show_comment", function(req, res) {
    Secret.findOne({ _id: req.body.show }, function(err, found) {
        res.render("comments", { post: found.comments });
    });
});




//app.listen(3000, function() {
//   console.log("the server is running at port 3000");
//});


let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
app.listen(port);