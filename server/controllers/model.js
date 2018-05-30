//Model
const CateModel = require('../models/cate');
const Model = require('../models/model');

const option = {__v: 0};

exports.list = function(req, res){

  let page = req.body.currentPage ? req.body.currentPage : 1,
    rows = req.body.pageSize ? req.body.pageSize : 10,
    sort = req.body.sort ? req.body.sort : {_id: -1};

  Model.find({}, function(err, result){
    if(err) return res.json({status:0, msg:err});
    let total = result.length;
    Model.find({}, option)
      .sort(sort)
      .skip((page-1)*rows)
      .limit(rows)
      .exec(function(err, data){
        if(err) return res.json({status:0, msg:err});
        res.json({status:1, msg:'成功', data:data, total: total});
      })
  });
};

exports.init = function(req, res){

  let array = [
    {name: '图片', type: 'photo'},
    {name: '文章', type: 'article'}
  ];

  Model.create(array, function (err, data) {
    if (err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'初始化成功', data:data});
  });

};

exports.add = function(req, res){

  let createModel = new Model(req.body);

  Model.find({name: req.body.name}, function (err, data) {

    if (err) return res.json({status:0, msg:err});
    if (data.length > 0) return res.json({status:0, msg:'模型已存在'});
    createModel.save(function (err, data) {
      if (err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'新建成功', data:data});
    });

  });

};

exports.update = function(req, res){

  let data = req.body;
  Model.update({_id: data._id}, data, function(err, data){
    if(err){
      return res.json({status:0, msg:err});
    }
    res.json({status:1, msg:'修改成功', data:data});
  });

};

exports.del = function(req, res){

  let ids = req.body.ids;
  CateModel.find({model: { $in: ids }}, function(err, result) {

    if (err) return res.json({status:0, msg:err});
    if(result.length > 0) return res.json({status:0, msg:'不能删除有数据的模型！'});

    Model.remove({_id: { $in: ids }}, function(err, data) {
      if (err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'删除成功', data:data});
    });

  });

};






