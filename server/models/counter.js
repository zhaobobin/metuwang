//Counter
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Counters = new Schema({
	_id: String,
	count: {type: Number, default: 0}
});

//静态方法
Counters.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};

module.exports = mongoose.model('Counters', Counters);

