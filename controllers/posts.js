const Post = require('../models/post');

module.exports = (app) => {
  // GET: Create a new post page
  // Needs to do a login check
  app.get("/posts/new", (req, res) => {
    // res.send("Hello")
    res.render('posts-new', {});
  });

  // POST: The middleware route in between creating a new post and it being official submitted
  app.post('/posts/new', (req, res) => {
    console.log(req.body.title);
    // Instantiate instance of post models
    var post = new Post(req.body);

    post.save().then((post) => {
      res.redirect('/')
    }).catch((err) => {
      console.log(err.message)
    })

    // Save instance of post model to db
    // post.save((err, post) => {
    //   //Redirect to Home
    //   return res.redirect('/');
    // });
  });

  // GET: To view a specific post
  app.get('/posts/:id', (req, res) => {
    Post.findById(req.params.id).populate('comments').then((post) => {
      res.render('post-show', { post });
    }).catch((err) => {
    console.log(err.message);
    });
  });
};
