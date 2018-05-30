//Comment
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

//CommentSchema
let CommentSchema = new Schema({
    aid: {type: ObjectId, ref: 'Article'},                    //文章id
    uid: {type: ObjectId, ref: 'User'},					              //用户id
    content: String,                                    			//评论内容
    reply: [{type: ObjectId, ref: 'Comment'}],                //被回复的评论id
    replyUid: {type: ObjectId, ref: 'User'},                  //被回复的用户id
    isReply: {type: Number, default: 0},                      //是否是回复
    report: {type: Number, default: 0},                       //是否被举报
    like: [{type: ObjectId, ref: 'User'}],                    //点赞的用户id
    createtime: {type: Date, default: Date.now()}
});

//操作
CommentSchema.pre('save', function(next){
    this.createtime = Date.now();
    next();
});

//静态方法
CommentSchema.statics = {
    fetch: function(cb) {
        return this
            .find({})
            .sort('createtime')
            .exec(cb)
    },
    findById: function(id, cb) {
        return this
            .findOne({_id: id})
            .exec(cb)
    }
};

module.exports = mongoose.model('Comment', CommentSchema);

