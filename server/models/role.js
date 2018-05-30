//Role
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
	roleid: {type: Number, unique: true},
	rolename: {type: String, unique: true},
	description: String,
});

//静态方法
RoleSchema.statics = {
	findById: function(id, cb) {
		return this
		.findOne({_id: id})
		.exec(cb)
	}
};

module.exports = mongoose.model('Role', RoleSchema);

