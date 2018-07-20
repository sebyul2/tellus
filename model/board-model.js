'use strict'

const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);
const collectionName = 'board'

let boardSchema = new mongoose.Schema({
  sequence: {type : Number, default: 0},
  user_id: {type : String, required: true},
  user_name: {type : String, required: true},
  title: {type : String, required: true},
  text: {type : String, required: true},
  type: {type : Number, required: true, default: 0}
}, {
  collection: collectionName
})

boardSchema.plugin(AutoIncrement, {inc_field: 'sequence'});

module.exports = mongoose.model('board', boardSchema)