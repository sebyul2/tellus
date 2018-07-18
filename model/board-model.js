'use strict'

const mongoose = require('mongoose')
const collectionName = 'board'

let boardSchema = new mongoose.Schema({
  sequence: {type : Number, default: 0},
  user_id: {type : String, required: true},
  title: {type : String, required: true},
  text: {type : Text, required: true},
  files: {type : String, required: true},
  type: {type : Number, default: 1}
}, {
  collection: collectionName
})

userSchema.plugin(AutoIncrement, {inc_field: 'sequence'});

module.exports = mongoose.model('board', boardSchema)