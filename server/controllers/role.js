//RoleModel
const UserModel = require('../models/user');
const RoleModel = require('../models/role');

const option = {__v: 0};

exports.list = function(req, res){

  let page = req.body.currentPage ? req.body.currentPage : 1,
    rows = req.body.pageSize ? req.body.pageSize : 10,
    sort = req.body.sort ? req.body.sort : {roleid: -1};

  RoleModel.find({}, function(err, result){
    if(err) return res.json({status:0, msg:err});
    let total = result.length;
    RoleModel.find({}, option)
    .sort(sort)
    .skip((page-1)*rows)
    .limit(rows)
    .exec(function(err, data){
      if(err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'成功', data:data, total: total});
    })
  });
};

exports.add = function(req, res){

  let createRole = new RoleModel(req.body);

	RoleModel.find({$or: [{roleid: req.body.roleid}, {rolename: req.body.rolename}]})
  .exec(function(err, data){
    if (err) return res.json({status:0, msg:err});
    if (data.length > 0) return res.json({status:0, msg:'角色类型已存在'});
    createRole.save(function (err, data) {
      if (err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'新建成功', data:data});
    });
  })

};

exports.update = function(req, res){

  let data = req.body;
	RoleModel.update({_id: data._id}, data)
  .exec(function(err, data){
    if(err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'修改成功', data:data});
  })

};

exports.del = function(req, res){

  let ids = req.body.ids;

  UserModel.find({role: { $in: ids }})
  .exec(function(err, result) {

    if (err) return res.json({status:0, msg:err});
    if(result.length > 0) return res.json({status:0, msg:'不能删除有数据的角色！'});

    RoleModel.remove({_id: { $in: ids }}, function(err, data) {
      if (err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'删除成功', data:data});
    });

  })

};






