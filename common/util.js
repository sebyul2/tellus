'use strict'

const fs = require('fs')
const path = require('path')
const cheerio = require('cheerio')

function isHtml(fileName) {
  let result = false
  const splitFile = fileName.split('.')
  if (splitFile[splitFile.length - 1].toLowerCase() === 'html') result = true
  return result
}

// promisify readFile()
function getFile(fileName, type) {
  return new Promise(function(resolve, reject) {
    fs.readFile(fileName, type, (err, data) => {
      err ? reject(err) : resolve(data);
    });
  });
}

// html에 템플릿을 주입하여 리턴
async function injectionTemplate(fileName) {
  let beforeHtml, $
  try {
    beforeHtml = await getFile(path.resolve(__dirname, '../public/', fileName), 'utf8')
  } catch (e) {
    throw new Error(e)
  }
  $ = cheerio.load(beforeHtml)
  try {
    // HEAD, header, footer load
    const promise = []
    promise.push(getFile(path.resolve(__dirname, '../public/template/', 'head.html'), 'utf8'))
    promise.push(getFile(path.resolve(__dirname, '../public/template/', 'header.html'), 'utf8'))
    promise.push(getFile(path.resolve(__dirname, '../public/template/', 'footer.html' ), 'utf8'))
    promise.push(getFile(path.resolve(__dirname, '../public/template/', 'sidebar.html'), 'utf8'))

    const [head, header, footer, sidebar] = await Promise.all(promise)

    //html에 injection(주입)
    $('head').html(head)
    $('header').html(header)
    $('footer').html(footer)
    $('sidebar').html(sidebar)
  } catch (e) {
    console.log(e)
  } finally {
    //주입된 html 파일 return
    return $.html()
  }
}


module.exports.isHtml = isHtml
module.exports.getFile = getFile
module.exports.injectionTemplate = injectionTemplate