//User
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 5;

let UserSchema = new Schema({

  type: {type: String, default: 'user'},  //类型 - 管理员、用户

	username: {type: String, unique: true},	//用户名
	password: String,												//密码
	nickname: String,												//昵称

  avatar: String,												  //头像
	fullname: String,												//真实姓名
	gender: String,													//性别
	userpic: String,												//头像
	banner: String,													//用户主页头图
	birthday: Date,													//生日 - Moment对象
	introduction: String,										//个人简介
	city: {type: String, default: '中国'},		//所在城市
	homepage: String,												//个人主页

	address: String,												//通讯地址
	zipcode: String,												//邮编
	email: String,													//邮箱
	tel: Number,													  //手机
	qq: '',															    //QQ号
	idcard: '',														  //身份证号

	remark: String,													//评论
	level: Number,													//等级
	point: Number,													//积分
	theme: Number,													//主题编号
	groupid: Number,												//会员组id
	collect: [{type: ObjectId, ref: 'Article'}],				//收藏过的文章，映射文章id
	like: [{type: ObjectId, ref: 'Article'}],					  //喜欢的文章，映射文章id
	follow: [{type: ObjectId, ref: 'User'}],						//关注过的用户，映射用户id
	fans: [{type: ObjectId, ref: 'User'}],							//粉丝

  role: {type: ObjectId, ref: 'Role'},    //角色 映射Role表
	regip: String,													//注册ip
	lastip: String,													//最后登录ip
	createtime: {type: Date, default: Date.now()},					//注册时间
	updatetime: {type: Date, default: Date.now()},					//最后登录时间
	status: {type: Number, default: 1}								//审核状态，1为通过、0为拒绝。
});

//操作
UserSchema.pre('save', function(next){
	let user = this;
	if(this.isNew){
		this.createtime = Date.now();
	}else{
		this.updatetime = Date.now();
	}
  //产生密码hash当密码有更改的时候(或者是新密码)
  if (!user.isModified('password')) return next();
  // 产生一个salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    // 结合salt产生新的hash
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      // 使用hash覆盖明文密码
      user.password = hash;
      next();
    });
  });
});
UserSchema.pre('update', function(next){
	this.update({},{ $set: { updatetime: Date.now() } });
	next();
});

//密码比对
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

//静态方法
UserSchema.statics = {
	fetch: function(cb) {
		return this
		.find({})
		.sort('updatetime')
		.exec(cb)
	},
	findById: function(id, cb) {
		return this
		.findOne({_id: id})
		.exec(cb)
	},
	encryptPassword: function (password, cb) {
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);
      // 结合salt产生新的hash
      bcrypt.hash(password, salt, function(err, hash) {
        if (err) return next(err);
        cb(hash)
      });
    });
	},
	getClientIp: function(req) {
    let ipAddress,
      headers = req.headers,
      forwardedIpsStr = headers['x-real-ip'] || headers['x-forwarded-for'];
		forwardedIpsStr ? ipAddress = forwardedIpsStr : ipAddress = null;
		if (!ipAddress) {
			ipAddress = req.connection.remoteAddress;
		}
		return ipAddress;
  }
};

module.exports = mongoose.model('User', UserSchema);

