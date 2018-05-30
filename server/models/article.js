//Article
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//ArticleSchema
const ArticleSchema = new Schema({
  index: Number,
	title: String,
	uid: {type: ObjectId, ref: 'User'},																	  //作者的用户id
  parent: {type: ObjectId, ref: 'Category'},                            //父级分类
  category: {type: ObjectId, ref: 'Category'},                          //文章分类
  modelType: String,                                                    //模型类型
	tags: String,
	description: String,
	thumb: String,																						            //缩略图
	cover: String,																						            //推荐位图片
	content: String,                                                      //文章内容
	video: {type: ObjectId, ref: 'Video'},                                //视频内容
	photoList: [{type: ObjectId, ref: 'Photo'}],                          //图片列表
	views: {type: Number, default: 0},														        //阅读
	like: [{type: ObjectId, ref: 'User'}],														    //喜欢，映射用户id
	comments: [{type: ObjectId, ref: 'Comment'}],												  //评论
	allow_comment: {type: Boolean, default: true},											  //是否允许评论
	status: {type: Boolean, default: true},														    //审核状态
	copyright: Number,																		                //版权
	focus: {type: Boolean, default: false},
	tuijian: {type: Boolean, default: false},
	createtime: {type: Date, default: Date.now()},
	updatetime: {type: Date, default: Date.now()}
});

//操作
ArticleSchema.pre('save', function(next){
	if(this.isNew){
		this.createtime = Date.now();
	}else{
		this.updatetime = Date.now();
	}
	next();
});
ArticleSchema.pre('update', function(next){
	this.update({},{ $set: { updatetime: new Date() } });
	next();
});

//静态方法
ArticleSchema.statics = {
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

module.exports = mongoose.model('Article', ArticleSchema);

