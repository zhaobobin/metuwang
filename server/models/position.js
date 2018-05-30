//Position
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PositionSchema = new Schema({
	name: {type: String, unique: true},
	modelid: Array,
	cateid: Array,
	maxnum: Number,
	createtime: {type: Date, default: Date.now()},
	updatetime: {type: Date, default: Date.now()},
});

//操作
PositionSchema.pre('save', function(next){
	this.createtime = Date.now();
	next();
});
PositionSchema.pre('update', function(next){
	this.updatetime = Date.now();
	next();
});

//静态方法
PositionSchema.statics = {
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
}

module.exports = mongoose.model('Position', PositionSchema);

