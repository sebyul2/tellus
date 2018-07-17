'use strict'

const express = require('express')
const path = require('path')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const bluebird = require('bluebird')
const cors = require('cors')
const routes = require('./routes')
const db = require('./connect-db')
global.Promise = bluebird

const app = express();

app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
routes(app)

// static resource
app.use(express.static(path.join(__dirname, 'public')))

app.use((req, res, next) => { // 404 처리 부분
  res.redirect('/404.html');
});

app.set('port', process.env.PORT || 80);

// const server = app.listen(app.get('port'), function() {
//   console.log('Express server listening on port ' + server.address().port)
// });

db.connect().then(() => {
  const server = app.listen(app.get('port'), () => {
    console.log('Express server listening on port ' + server.address().port)
  })
})