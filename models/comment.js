const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Populate = require("../utils/autopopulate");

const CommentSchema = new Schema({
  createdAt: { type: Date },
  updatedAt: { type: Date },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comments: [{type: Schema.Types.ObjectId, ref: "Comment"}] 
});

// Always populate the author field
CommentSchema
  .pre('findOne', Populate('author'))
  .pre('find', Populate('author'))

//Before official saving get the date, and
// update the appropriate fields
CommentSchema.pre('save', function(next) {
  const now = new Date();
  //The post is being updated now
  this.updatedAt = now;

  //If createdAt is empty/undefined then then
  // the post is only just being created, so
  // set the value to 'now' as well
  if (!this.createdAt) {
    this.createdAt = now;
  }

  next();
});

module.exports = mongoose.model('Comment', CommentSchema);
