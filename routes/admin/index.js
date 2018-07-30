'use strict'

const express = require('express')
const path = require('path')
const jwt = require('jsonwebtoken')
const wrap = require('express-async-wrap')
const fs = require('fs')
const multer = require('multer')
const moment = require('moment')
const config = require('../../config')
const util = require('../../common/util')
const boardModel = require('../../model/board-model')
const admin = express.Router()

// 게시물 가져오기
admin.get('/board', wrap(async (req, res) => {
  try {
    const r = await boardModel.find().sort({
      type: -1,
      sequence: -1
    })
    const array = r.map(item => {
      const row = []
      const date = new Date(item.created_at)
      row.push(item.type === 1 ? "공지" : item.sequence)
      row.push(item.title)
      row.push(item.user_name)
      row.push(moment(date).format('YY-MM-DD'))
      row.push(item.text)
      row.push(item.type)
      return row
    })
    console.log(array)
    res.json(array)
  } catch (err) {
    throw new Error(err)
  }
}))

admin.use(auth)

const publicDir = path.resolve(__dirname, '../../public')
// 업로드
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, new Date().valueOf() + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
  })
})

admin.put('/upload', upload.single('file'), (req, res) => {
  console.log(req.file)
  res.json(req.file)
})

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
      maxAge: 3000000
    })
    console.log(token)
  }
  res.json(resData)
})

// 로그인 페이지 호출
admin.get('/login', wrap(async (req, res) => {
  res.send(await util.injectionTemplate('admin/login.html'))
}))

// 로그아웃
admin.get('/logout', wrap(async (req, res) => {
  const token = req.cookies['x-access-token']
  res.cookie('x-access-token', token, {
    signed: false,
    maxAge: 0
  })
  res.send(await util.injectionTemplate('admin/login.html'))
}))

// admin main
admin.get('/', wrap(async (req, res) => {
  res.send(await util.injectionTemplate('admin/index.html'))
}))

function getToken(userId) {
  const token = jwt.sign({
    id: userId
  }, config.secret)
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

// 게시물 등록
admin.post('/board', wrap(async (req, res) => {
  console.log('req.body', req.body)
  const userId = 'admin'
  const name = 'Tellus'
  const data = {
    user_id: userId,
    user_name: name,
    title: req.body.title,
    text: req.body.content
  }
  if (req.body.rowId) {
    await boardModel.findOneAndUpdate({
      sequence: req.body.rowId
    }, data, {
      upsert: true,
      new: true
    })
  } else {
    await boardModel.create(data)
  }
  res.json({
    success: true
  })
}))

// 게시물 삭제
admin.post('/board/delete', wrap(async (req, res) => {
  try {
    console.log(req.params)
    await boardModel.remove({ sequence: req.body.sequence })
    res.json({success: true})
  } catch (err) {
    throw new Error(err)
  }
}))

module.exports = admin