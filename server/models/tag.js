//Tag
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//TagSchema
let TagSchema = new Schema({
	name: String,
	views: {type: Number, default: 0},
	articles: [{type: ObjectId, ref: 'Article'}],			//字段映射数组
	createtime: {type: Date, default: Date.now()},
	updatetime: {type: Date, default: Date.now()},
});

//操作
TagSchema.pre('save', function(next){
	this.createtime = Date.now();
	next();
});
TagSchema.pre('update', function(next){
	this.updatetime = Date.now();
	next();
});

//静态方法
TagSchema.statics = {
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

module.exports = mongoose.model('Tag', TagSchema);

