'use strict'

const util = require('../common/util')
const wrap = require('express-async-wrap')

module.exports = (app) => {

  app.use('/api', require('./api'))
  app.use('/admin', require('./admin'))
  app.use('/board', require('./board'));
  
  app.get('/', wrap(async function(req, res, next) {
    try {
      res.send(await util.injectionTemplate('index.html'))
    } catch (e) {
      console.log(e)
      res.sendStatus(500)
    }
  }))

  // 모든 파일
  app.get('/:file', wrap(async function(req, res, next) {
    console.log('* get /:file', req.params.file)
    try {
      if (!util.isHtml(req.params.file)) {
        throw new Error('invalid file name')
      }
      res.send(await util.injectionTemplate(req.params.file))
    } catch (e) {
      console.log(e)
      res.send(await util.injectionTemplate('404.html'))
    }
  }))
}