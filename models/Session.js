const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SessionSchema = new Schema({
  expires: {
    //suppose i follow elon,so this is my userid
    // fk to user collection
    type: Date,
  },
  sessions: {
    type: Object,
  },
})

module.exports = mongoose.model('sessions', SessionSchema)
