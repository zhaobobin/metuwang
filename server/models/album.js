//Album - 相册，作为一种引用图片的集合
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

//AlbumSchema
//noinspection JSAnnotator
var AlbumSchema = new Schema({
    id: Number,
    title: String,
    uid: {type: ObjectId, ref: 'User'},															  //用户id
    tags: String,
    description: String,
    thumb: String,																				            //缩略图
    content: String,
    views: {type: Number, default: 0},														    //阅读
    like: [{type: ObjectId, ref: 'User'}],														//喜欢，映射用户id
    status: {type: Number, default: 1},														    //审核状态
    createtime: {type: Date, default: Date.now()},
    updatetime: {type: Date, default: Date.now()}
});

//操作
AlbumSchema.pre('save', function(next){
    if(this.isNew){
        this.createtime = Date.now();
    }else{
        this.updatetime = Date.now();
    }
    next();
});
AlbumSchema.pre('update', function(next){
    this.update({},{ $set: { updatetime: new Date() } });
    next();
});

//静态方法
AlbumSchema.statics = {
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
    }
};

module.exports = mongoose.model('Album', AlbumSchema);

