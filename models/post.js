const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");

// The post will not be added to be the database if any of the required fields are empty
const PostSchema = new Schema({
  createdAt:  { type: Date },
  updatedAt:  { type: Date },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title:      { type: String, required: true },
  url:        { type: String, required: true },
  summary:    { type: String, required: true },
  subreddit:  { type: String, required: true },
  comments:   [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  upVotes : [{ type: Schema.Types.ObjectId, ref: "User"}],
  downVotes : [{ type: Schema.Types.ObjectId, ref: "User"}],
  voteScore : {type: Number}
});

// Use a regular function, not lambda function (ES 6) because 'this' doesnt work
PostSchema.pre('save', function(next) {
  // Setting the post creation and updated dates/times
  const now = new Date();
  this.updatedAt = now;

  //If the createdAt field is empty/undefined then the post is just being created
  if (!this.createdAt) {
    this.createdAt = now;
  }
  next();
});

PostSchema
  .pre('findOne', Populate('author'))
  .pre('find', Populate('author'))

module.exports = mongoose.model('Post', PostSchema);
