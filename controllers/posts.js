const User = require('../models/user');
const Post = require('../models/post');

module.exports = (app) => {
  // GET: Create a new post page
  app.get("/posts/new", (req, res) => {
    res.render('posts-new', { currentUser: req.user });
  });

  // POST: The middleware route in between creating a new post and it being official submitted
  app.post('/posts/new', (req, res) => {
    if (req.user) {
      let postData = req.body
      postData.subreddit = postData.subreddit.replace("/", "_")
      // Instantiate instance of post models
      let post = new Post(req.body);
      post.author = req.user._id;
      post.upVotes = [];
      post.downVotes = [];
      post.voteScore = 0;

      post.save().then((post) => {
        return User.findById(req.user._id);
      }).then(user => {
        user.posts.unshift(post);
        user.save();
        // REDIRECT TO THE NEW POST
        res.redirect(`/posts/${post._id}`);
      }).catch((err) => {
        console.log(err.message)
      })
    } else {
      return res.status(401); // UNAUTHORIZED
    }
  });

  // GET: To view a specific post
  app.get('/posts/:id', (req, res) => {
    Post.findById(req.params.id)
    .populate({ 
      path: 'comments',
      populate: {
        path: 'author',
        model: 'User'
      } 
   })
   .lean().then((post) => {
      res.render('post-show', { post, currentUser: req.user });
    }).catch((err) => {
      console.log(err.message);
    });
  });

  // To view posts of a subreddit
  app.get('/n/:subreddit', (req, res) => {
    Post.find({ subreddit: req.params.subreddit }).lean().then((posts) => {
      res.render('home', { posts, currentUser: req.user });
    }).catch((err) => {
      console.log(err.message);
    });
  });

  app.put("/posts/:id/vote-up", function(req, res) {
    Post.findById(req.params.id).exec(function(err, post) {
      post.upVotes.push(req.user._id);
      post.voteScore = post.voteScore + 1;
      post.save();
  
      res.status(200);
    });
  });
  
  app.put("/posts/:id/vote-down", function(req, res) {
    Post.findById(req.params.id).exec(function(err, post) {
      post.downVotes.push(req.user._id);
      post.voteScore = post.voteScore - 1;
      post.save();
  
      res.status(200);
    });
  });
};
