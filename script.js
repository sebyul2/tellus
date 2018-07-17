'use strict'

const mongoose = require('mongoose')
const mongooseTimestamp = require('mongoose-timestamp')
const config = require('config')
const db = require('./connect-db')

// const userModel = require('./model/user-model')
// const hatcheryModel = require('./model/hatchery-model')
// const hatcheryQuantityModel = require('./model/hatchery-quantity-model')
// const dbData = require('./db-data')

mongoose.Promise = global.Promise

mongoose.plugin(mongooseTimestamp, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

db.connect().then(async () => {
  
  // //user
  // await userModel.remove()
  // await userModel.create(dbData.user)
  // //hatchery
  // await hatcheryModel.remove()
  // await hatcheryModel.create(dbData.hatchery)

  // //hatcheryQuantity
  // await hatcheryQuantityModel.remove()
  // await hatcheryQuantityModel.create(hatcheryQuantity)

  process.exit(0)
}).catch(err => {
  console.log(err)
  process.exit(0)
})