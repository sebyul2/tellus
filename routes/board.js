const express = require('express');
const mongo = require('mongoose');
const moment = require('moment');
const wrap = require('express-async-wrap');

const router = express.Router();
// mongo.connect("mongodb://localhost:27017/tellus");

// mongo.model("board", new mongo.Schema({},{collation:"board"})); //콜렉션을 스키마 내부에 옵션으로 지정
var boardModel = mongo.model("board",new mongo.Schema({
    userId : String,
    password : String,
    title : String,
    lastUpdatedDate : Date,
    context : String, // string
    files : [String] // string 배열
}),"board"); // 콜렉션을 모델에서 지정


//게시판 조회
router.get('/',wrap( async (req,res)=>{
    var boards = await boardModel.find();
    res.send(JSON.stringify(boards));
}));

//게시글 추가
router.put('/', wrap( async (req,res)=>{
    try
    {
        var result = await boardModel.create({...req.body, lastUpdatedDate: moment().toDate()});
    }catch (err)
    {
        console.log(err);
    }
    res.send(JSON.stringify(result));
    /*
    {
          userId : String,
        password : String,
        title : String,
        context : String,
    }
    */
    //var board =  req.body;
    //board.lastUpdatedDate = moment().toDate();
    
}));
//게시글 수정
router.post('/', (req,res)=>{

});
//게시글 삭제
router.delete('/', (req,res)=>{

});
module.exports = router;
