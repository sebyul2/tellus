const mongoose = require('mongoose')
const mongooseTimestamp = require('mongoose-timestamp')
const config = require('config')

mongoose.Promise = global.Promise
mongoose.plugin(mongooseTimestamp, {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})

mongoose.plugin((schema) => {
  schema.options.toJSON = {
    virtuals: true,
    versionKey: false,
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  };
});

module.exports.connect = async () => {
  try {
    await mongoose.connect(config.db.host, config.db.options)
    console.log('mongo server connect success!')
  } catch (err) {
    throw err
  }
}