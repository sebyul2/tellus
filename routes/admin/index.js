'use strict'

const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const wrap = require('express-async-wrap')
const fs = require('fs')
const config = require('../../config')
const util = require('../../common/util')
const admin = express.Router()

admin.use(auth)

const publicDir = path.resolve(__dirname, '../../public')

// 관리자 로그인
admin.post('/login', (req, res) => {

  const userId = req.body.userId
  const password = req.body.password
  const resData = {
    success: false,
    data: {}
  }
  
  if (userId === 'admin' && password === 'tellus') {
    resData.success = true
    const token = getToken(userId)
    res.cookie('x-access-token', token, {
      signed: false,
      maxAge: 300000
    })
    console.log(token)
  }
  res.json(resData)
})

admin.get('/login', wrap(async (req, res) => {
  res.send(await util.injectionTemplate('admin/login.html'))
}))

admin.get('/logout', wrap(async (req, res) => {
  const token = req.cookies['x-access-token']
  res.cookie('x-access-token', token, {
    signed: false,
    maxAge: 0
  })
  res.send(await util.injectionTemplate('admin/login.html'))
}))



admin.get('/', wrap(async (req, res) => {
  res.send(await util.injectionTemplate('admin/index.html'))
}))

function getToken(userId) {
  const token = jwt.sign({ id: userId }, config.secret)
  return token
}

function auth(req, res, next) {
  console.log('auth')
  if (req.url === '/login') return next()

  const token = req.cookies['x-access-token']
  if (typeof token !== 'undefined') {
    const decoded = jwt.verify(token, config.secret)  
    next()
  } else {
    res.redirect('/admin/login')
  }
}

module.exports = admin