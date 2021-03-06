//Admin
const UserModel = require('../models/user');
const type = 'admin';

const option = {password: 0, __v: 0};

exports.count = function(req, res){

  UserModel.find({type: type}, function(err, result){
    if(err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'成功', data: result.length});
  });

};

exports.list = function(req, res){

	let page = req.body.currentPage ? req.body.currentPage : 1,
		rows = req.body.pageSize ? req.body.pageSize : 10,
    params = req.body.params ? req.body.params : {},
	  sort = req.body.sort ? req.body.sort : {username: 1};

  params.type = type;

  UserModel.find(params, function(err, result){
		if(err) return res.json({status:0, msg:err});
    let total = result.length;
    UserModel.find(params, option)
		.populate({path: 'role'})
    .sort(sort)
		.skip((page-1)*rows)
		.limit(rows)
		.exec(function(err, data){
			if(err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'成功', data:data, total: total});
		})
	});

};

exports.detail = function(req, res){

	UserModel.findOne({_id:req.body._id}, option)
    .populate({path: 'role'})
    .exec(function(err, data){
      if(err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'成功', data: data});
    })

};

exports.nameCheck = function(req, res){
  UserModel.findOne({_id:req.body._id}, function (err, user) {
    if (err) return res.json({status:0, msg:err});
    if (user) {
      res.json({status:1, msg:'用户名已存在', data: 0});
    }else{
			res.json({status:1, msg:'用户名可用', data: 1});
		}
  });
};

//注册
exports.register = function(req, res){

  let body = req.body;
  body.regip = UserModel.getClientIp(req);		//获取注册ip
  body.nickname = body.username;
  body.type = type;

  let createUser = new UserModel(body);

  UserModel.findOne({username:body.username}, function (err, user) {
    if(err) return res.json({status:0, msg:err});
    if(user) return res.json({status:0, msg:'用户名已存在'});
    createUser.save(function (err, newuser) {
      if (err) return res.json({status:0, msg:err});
      req.session.user = newuser;								//注册成功，创建会话状态
      res.json({status:1, msg:'注册成功', data: newuser});
    });
  });

};

//管理员登录 验证Admin表的密码 取用User表的用户信息
exports.login = function(req, res){

  let session = req.session.user;
	//获取登录ip
  let ip = UserModel.getClientIp(req);
  UserModel.findOneAndUpdate({username: req.body.username}, {lastip: ip, updatetime: Date.now()})
  .populate({path: 'role'})
  .exec(function(err, user){
    if(err) return res.json({status:0, msg:err});

    //检验验证码 只在手动登录时检查
    let captcha = parseInt(req.body.captcha);

    if(req.session.captcha && req.session.captcha !== captcha){
      return res.json({status:0, msg:'验证码错误，请重试！'});
    }
    if(err) return res.json({status:0, msg:err});
    if(!user) return res.json({status:0, msg:'用户名不存在'});

    user.comparePassword(req.body.password, function(err, isMatch) {
      if (err) return res.json({status:0, msg:err});
      if(!isMatch) return res.json({status:0, msg:'密码错误'});

      user.password = '';
      req.session.user = user;
      res.json({status:1, msg:'登录成功', data: user});
    });

  });
};

exports.update = function(req, res){

  let data = req.body;
  //if(data.password) data.password = UserModel.encryptPassword(data.password);

	UserModel.update({_id: data._id}, data, function(err, result){
		if(err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'保存成功', data:result});
	});

};

//修改密码
exports.updatePsd = function(req, res){

  let body = req.body,
    old_password = body.old_password,
    new_password = body.new_password;

  UserModel.findOne({_id: req.body._id}, function (err, user) {
		if (err) return res.json({status:0, msg:err});
		if (!user) return res.json({status:0, msg:'用户不存在'});

    user.comparePassword(old_password, function(err, isMatch){
      if (err) return res.json({status:0, msg:err});
      if(!isMatch) return res.json({status:0, msg:'旧密码错误'});

      UserModel.encryptPassword(new_password, function(psd){
        UserModel.update({_id: req.body._id}, {password: psd}, function(err, data){
          if(err) return res.json({status:0, msg:err});
          req.session.user = data;
          res.json({status:1, msg:'保存成功'});
        });
      });

    });

  });

};

//删除 接收数组参数
exports.del = function(req, res){
  let ids = req.body.ids;
  AdminModel.remove({_id: { $in: ids }}, function(err, result) {
    if (err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'删除成功', data:result});
  });
};






