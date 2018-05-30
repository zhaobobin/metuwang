//Config
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//ConfigSchema
var ConfigSchema = new Schema({
	appname: String,
	siteurl: String,
	sitekeywords: String,
	sitedesc: String,

	company: String,
	address: String,
	tel: String,
	siteemail: String,
	qq: String,
	copyright: String,

	logourl: String,
	createtime: {type: Date, default: Date.now()},
	updatetime: {type: Date, default: Date.now()},
});

//操作
ConfigSchema.pre('save', function(next){
	var cate = this;
	if(this.isNew){
		this.createtime = Date.now();
	}else{
		this.updatetime = Date.now();
	}
	next();
});
ConfigSchema.pre('update', function(next){
	this.update({},{ $set: { updatetime: new Date() } });
	next();
});

module.exports = mongoose.model('Config', ConfigSchema);

