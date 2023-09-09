const mongoose = require('mongoose')
const Schema = mongoose.Schema

const FollowSchema = new Schema({
  followerUserId: {
    //suppose i follow elon,so this is my userid
    // fk to user collection
    type: String,
    ref: 'users',
    require: true,
  },
  followingUserId: {
    // this is elon userid
    // fk to user collection
    type: String,
    ref: 'users',
    require: true,
  },
  creationDateTime: {
    type: Date,
    default: Date.now(),
    require: true,
  },
})

module.exports = mongoose.model('follow', FollowSchema)
