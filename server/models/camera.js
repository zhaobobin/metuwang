//Camera
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let CameraSchema = new Schema({

  model: String,                                          //型号：取自exif记录的值
  name: String,                                           //依据型号删掉空格
  brand: String,                                          //品牌：全部小写
  category: String,                                       //分类：DSLR、Mirrorless
  createtime: {type: Date, default: Date.now()},					//注册时间

});

//操作
CameraSchema.pre('save', function(next){
  this.createtime = Date.now();
  next();
});

module.exports = mongoose.model('Camera', CameraSchema);

