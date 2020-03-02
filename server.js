// These next three lines are for authentication and tokens
// dotenv npm package
require('dotenv').config();
var cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const express = require('express')
const app = (express)();
app.use(cookieParser());


//We're using Handlebars for ExpressJS
var exphbs = require('express-handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// In order to parse text (e.g. text from when a user creates a new post)
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Set up a static directory
app.use(express.static('public'));

// We're using MongoDB as our database
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/reddit-clone', { useNewUrlParser: true });
mongoose.connection.on('error', console.error.bind(console, "MongoDB connection error: "));
mongoose.set('debug', true);

const checkAuth = (req, res, next) => {
  console.log("Checking authentication");
  if (typeof req.cookies.nToken === "undefined" || req.cookies.nToken === null) {
    req.user = null;
  } else {
    var token = req.cookies.nToken;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
  }

  next();
};
app.use(checkAuth);

// The data structure for Post
const Post = require('./models/post');

//GET and POST method for creating a new post
require('./controllers/posts.js')(app);

//GET and POST method for registering, logging-in, and logging-out
require('./controllers/auth.js')(app)

//For comments
require('./controllers/comments.js')(app);
require('./controllers/replies.js')(app);


// Home page
app.get('/', (req, res) => {
  // console.log("Cookie check: " + req.cookies);
  Post.find().lean().then((posts) => {
    res.render('home', { posts, currentUser: req.user });

  }).catch((err) => {
    console.log(err.message);
  });
});


//The port for this website
app.listen(3001, () => {
  console.log("Listening to port 3001");
});

module.exports = app;
