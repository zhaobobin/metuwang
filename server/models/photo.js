//Photo
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//PhotoSchema
let PhotoSchema = new Schema({
	key: String,																				            //与OSS存储信息一致
	title: String,                                                  //标题
	uid: {type: ObjectId, ref: 'User'},															//用户id
  article: [{type: ObjectId, ref: 'Article'}],									  //所属文章
	keywords: String,                                               //关键词
	tags: String,                                                   //标签
	description: String,                                            //描述
  thumb: String,																				          //缩略图
	cover: String,																				          //推荐位图片
	url: String,																				            //记录图片路径

  exif: String,                                                   //照片元数据
  camera: Object,																			            //拍摄设备 {brand: '', model: ''}
	lens: Object,																			              //镜头 {brand: '', model: ''}
  composition: Number,                                            //构图：>1横幅、<1竖幅、1正方
  category: String,                                               //分类：照片、插画、矢量
  use: String,                                                    //用途：创意图片，编辑图片

	views: {type: Number, default: 0},															//阅读
	like: [{type: ObjectId, ref: 'User'}],													//喜欢，映射用户id
	comments: {type: Number, default: 0},														//评论
	allow_comment: {type: Number, default: 1},											//是否允许评论
	status: {type: Number, default: 1},															//审核状态
	copyright: String,																			        //版权
	focus: {type: Boolean, default: false},
	tuijian: {type: Boolean, default: false},
	createtime: {type: Date, default: Date.now()},
	updatetime: {type: Date, default: Date.now()}
});

//操作
PhotoSchema.pre('save', function(next){
	if(this.isNew){
		this.createtime = Date.now();
	}else{
		this.updatetime = Date.now();
	}
	next();
});
PhotoSchema.pre('update', function(next){
	this.update({},{ $set: { updatetime: new Date() } });
	next();
});

//静态方法
PhotoSchema.statics = {
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
	}
};

module.exports = mongoose.model('Photo', PhotoSchema);

