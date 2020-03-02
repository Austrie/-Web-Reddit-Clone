const Comment = require('../models/comment');
const Post = require('../models/post')

module.exports = (app) => {
  //Create a comment
  app.post('/posts/:postId/comments', (req, res) => {
    const comment = new Comment(req.body);
    comment.author = req.user._id;

    //The save method does not return anything to then
    comment.save().then((mComment) => {
      return Post.findById(req.params.postId);
    }).then((post) => {
      if (!post.comments) {
        post.comments = [];
      }
      post.comments.unshift(comment);

      return post.save()
    }).then((post) => {
      // console.log("Post after save: " + post);
       res.redirect("/");
     }).catch((err) => {
      console.log(err.message)
    });
  });
};
