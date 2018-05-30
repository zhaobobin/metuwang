//Equipment
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let EquipmentSchema = new Schema({

  model: String,                                          //型号：取自exif记录的值
  name: String,                                           //依据型号删掉空格
  brand: String,                                          //品牌
  category: String,                                       //分类：camera、lens、phone
  createtime: {type: Date, default: Date.now()},					//注册时间

});

//操作
EquipmentSchema.pre('save', function(next){
  this.createtime = Date.now();
  next();
});

module.exports = mongoose.model('Equipment', EquipmentSchema);

