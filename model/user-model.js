'use strict'

const mongoose = require('mongoose')
const collectionName = 'user'

let userSchema = new mongoose.Schema({
  user_id: {type : String, required: true},
  user_name: {type : String, required: true},
  password: {type : Text, required: true},
  type: {type : number, default: 1},
}, {
  collection: collectionName
})

module.exports = mongoose.model('user', userSchema)