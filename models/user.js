// The model for creating a typical user
const mongoose = require('mongoose');
// Bcrypt: Password encryption library installed using npm
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  createdAt:  { type: Date },
  updatedAt:  { type: Date },
  password:   { type: String, select: false },
  username:   { type: String, required: true },
  posts : [{ type: Schema.Types.ObjectId, ref: "Post" }]
});


// UserSchema methods
UserSchema.methods.comparePassword = function(attemptedPassword, done) {
  bcrypt.compare(attemptedPassword, this.password, (err, isMatch) => {
    done(err, isMatch);
  });
};

//I think save is supposed to update the whole document
// Use a regular function, not lambda function (ES 6) because 'this' doesnt work
UserSchema.pre('save', function(next) {
  // Setting the post creation and updated dates/times
  const now = new Date();
  this.updatedAt = now;

  //If the createdAt field is empty/undefined then the post is just being created
  if (!this.createdAt) {
    this.createdAt = now;
  }

  // I think this is only happens for new password
  if (this.isModified('password')) {
    console.log("Password updated in save method")
    const user = this;
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

// Not fully tested
// I think this is supposed to be called when you are
// only updating part of the document
UserSchema.pre('update', function(next) {
  // I think this checks if the update includes an
  // update to the password field
  const password = this.getUpdate().$set.password;
  // If the update did not include an update to the
  // password
  if (!password) {
    return next();
  }
  console.log("Password updated in update method")
  // Edit the plain text new password in the update
  // with a hash version
  const user = this;
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      user.getUpdate().$set.password = hash;
      next();
    });
  });
});


module.exports = mongoose.model('User', UserSchema);
