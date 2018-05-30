//Brand - 添加Photo时更新品牌模型
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

let BrandSchema = new Schema({

  model: String,                                          //型号：取自exif记录的值
  name: String,                                           //名称：依据exif转为小写字母
  type: String,                                           //类型：camera、lens、phone
  createtime: {type: Date, default: Date.now()},					//注册时间

});

//操作
BrandSchema.pre('save', function(next){
  this.createtime = Date.now();
  next();
});

module.exports = mongoose.model('Brand', BrandSchema);

