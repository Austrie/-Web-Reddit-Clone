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
    res.redirect('/')
  });

  // GET: Login form
  app.get('/login', (req, res) => {
    res.render('login');
  });
}
