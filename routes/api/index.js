'use strict';

const fs = require('fs')
const express = require('express')
const request = require('request-promise')
const cheerio = require('cheerio')
const xml2js = require('xml2js')

const parser = new xml2js.Parser()
const api = express.Router()

// 공시정보
api.get('/disclosure', (req, res) => {
  const url = 'http://asp1.krx.co.kr/servlet/krx.asp.DisList4MainServlet?code=196450&gubun=K'
  request(url)
    .then(xml => {
      parser.parseString(xml, (err, result) => {
        const rows = []
        result.disclosureMain.disInfo.map(item => {
          const row = []
          row.push(item["$"].distime)
          row.push(item["$"].disTitle)
          row.push(item["$"].submitOblgNm)
          row.push(item["$"].disAcpt_no)
          rows.push(row)
        })
        res.json(rows)
      })
    }).catch(err => console.log(err))
})

// 주가정보
api.get('/stock', (req, res) => {
  const url = 'http://asp1.krx.co.kr/servlet/krx.asp.XMLSise?code=196450'
  request(url)
    .then(xml => {
      parser.parseString(xml, (err, result) => {
        res.json(result)
      })
    }).catch(err => console.log(err))
})

module.exports = api;