//Category
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//CategorySchema
const CategorySchema = new Schema({
	index: {type: Number, default: 0},											              //排序
  model: {type: ObjectId, ref: 'Model'},                                //模型
	parent: {type: ObjectId, ref: 'Category'},                            //父级分类
	name: String,
	catedir: String,
  tags: String,
	description: String,
	show: {type: Number, default: 1},
	createtime: {type: Date, default: Date.now()},
	updatetime: {type: Date, default: Date.now()},
});

//操作
CategorySchema.pre('save', function(next){
	if(this.isNew){
		this.createtime = Date.now();
	}else{
		this.updatetime = Date.now();
	}
	next();
});
CategorySchema.pre('update', function(next){
	this.update({},{ $set: { updatetime: new Date() } });
	next();
});

//静态方法
CategorySchema.statics = {
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
	tree: function(a){
		let r = [], len = a.length;
		for(let i=0; i < len; i++){

			if(!a[i].parent){
				let arr = [];
				for(let j=0; j < len; j++){
					if(a[j].parent === a[i]._id){
						arr.push(a[j]);
					}
				}
				a[i].children = arr;
				r.push(a[i]);
			}

		}

		return r;
	}
};

module.exports = mongoose.model('Category', CategorySchema);
