//Model
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModelSchema = new Schema({
  name: {type: String, unique: true},
  type:String,
});

//静态方法
ModelSchema.statics = {
  findById: function(id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  }
};

module.exports = mongoose.model('Model', ModelSchema);

