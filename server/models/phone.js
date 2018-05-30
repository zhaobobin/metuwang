//Phone
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let PhoneSchema = new Schema({

  model: String,                                          //型号：取自exif记录的值
  name: String,                                           //依据型号删掉空格
  brand: String,                                          //品牌
  createtime: {type: Date, default: Date.now()},					//注册时间

});

//操作
PhoneSchema.pre('save', function(next){
  this.createtime = Date.now();
  next();
});

module.exports = mongoose.model('Phone', PhoneSchema);

