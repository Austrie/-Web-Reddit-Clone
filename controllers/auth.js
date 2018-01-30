const User = require('../models/user');
const jwt = require('jsonwebtoken');
module.exports = (app) => {
  // GET: Signup form
  app.get('/register', (req, res) => {
    res.render('register');
  });

  //POST: register
  app.post('/register', (req, res) => {
    //Create User
    const user = new User(req.body);

    user.save().then((user) => {
      var token = jwt.sign({ _id: user._id}, process.env.SECRET, { expiresIn: "60 days" });
      res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
      res.redirect('/')
    }).catch((err) => {
      console.log(err.message);
    });
  });

  // GET: Logout
  app.get('/logout', (req, res) => {
    res.clearCookie('nToken');
    res.redirect('/');
  });

  // GET: Login form
  app.get('/login', (req, res) => {
    res.render('login');
  });

  // POST: login
  app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // Find this username
    // TODO: Find out about second param
    User.findOne({ username }, 'username password').then((user) => {
      if (!user) {
        // User not found
        return res.status(401).send({ message: "Wrong username or password" });
      }
      // Check password
      user.comparePassword(password, (err, isMatch) => {
        if (!isMatch) {
          // Password does not match
          return res.status(401).send({ message: "Wrong password" });
        }
        // Create a token
        const token = jwt.sign(
          { _id: user._id, username: user.username }, process.env.SECRET,
          {  expiresIn: "60 days" }
        );
        // Set a cookie and redirect
        res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
        res.redirect('/');
      });
    }).catch((err) => {
      console.log(err);
    });
  });
}
