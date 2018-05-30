//Comment
const CommentModel = require('../models/comment');
const ArticleModel = require('../models/article');

const option = {__v: 0};
const popuFilter = '-__v -password';

exports.list = function(req, res){

  let body = req.body,
    aid = body.aid ? body.aid : '',                         //文章id
    uid = body.uid ? body.uid : '',                         //用户id
    page = body.currentPage ? body.currentPage : 1,			    //当前页数
    rows = body.itemsPerPage ? body.itemsPerPage : 10,		  //每页数量
    params = req.body.params;

  let query = {};

  if(aid) query.aid = aid;
  if(uid) query.uid = uid;
  if(params.report) query.report = params.report;           //是否被举报

  CommentModel.find(query, function(err, result){
		if(err) return res.json({status:0, msg:err});

    let total = result.length;			//数据总数
    query.isReply = 0;                                        //是否是回复

		CommentModel.find(query, option)
		.sort({createtime: -1})
		.skip((page-1)*rows)
		.limit(rows)
		.populate({path: 'aid uid', select: popuFilter})
    //.populate({path: 'reply'})
		.exec(function(err, data) {
			if(err) return res.json({status:0, msg:err});
			let hasMore = data.length === rows;
			res.json({status:1, msg:'成功', data:data, total: total, hasMore: hasMore});
		})

	});

};

exports.replyList = function(req, res){

  let body = req.body,
    ids = body.ids,
    page = body.currentPage ? body.currentPage : 1,			    //当前页数
    rows = body.itemsPerPage ? body.itemsPerPage : 10;		  //每页数量

  let query = {_id: { $in: ids }};

  CommentModel.find(query, option)
  .sort({createtime: -1})
  .skip((page-1)*rows)
  .limit(rows)
  .populate({path: 'uid replyUid', select: popuFilter})
  .exec(function(err, data){
    if(err) return res.json({status:0, msg:err});
    let hasMore = data.length === rows;
    res.json({status:1, msg:'成功', data:data, total: ids.length, hasMore: hasMore});
  })


};

exports.add = function(req, res){

  let body = req.body;

  let newComment = {
    aid: body.aid,
    uid: body.uid,
    content: body.content,
    isReply: body.commentId ? 1 : 0,
  };

  if(body.replyUid) newComment.replyUid = body.replyUid;

  let createComment = new CommentModel(newComment);

  createComment.save(function (err) {
    if (err) return res.json({status:0, msg:err});

    createComment.populate({path: 'uid replyUid', select: popuFilter}, function(err, comment){
      if (err) return res.json({status:0, msg:err});

      //更新文章评论
      ArticleModel.update({_id: comment.aid}, {$addToSet: {comments: comment._id}}, function(err){
        if(err) return res.json({status:0, msg:err});
        //更新评论的回复
        if(body.commentId){
          CommentModel.update({_id: body.commentId}, {$addToSet: {reply: comment._id}}, function(err){
            if(err) return res.json({status:0, msg:err});
            res.json({status:1, msg:'发布成功', data:comment});
          })
        }else{
          res.json({status:1, msg:'发布成功', data:comment});
        }
      })
    })

  });

};

exports.del = function(req, res){

  let ids = req.body.ids,
    aids = req.body.aids;

  CommentModel.remove({_id: { $in: ids }}, function(err, result) {
    if (err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'删除成功', data: result});

    //更新文章评论
    aids.forEach(function(aid){
      ArticleModel.update({_id: aid}, {$pull: {comments: { $in: ids }}}, function(err, article){
        if (err) return res.json({status:0, msg:err});
        console.log(article._id + 'comments字段更新成功！');
      })
    });

  });

};

//举报
exports.report = function(req, res){

  let id = req.body.id;         //评论id

  CommentModel.update({_id: id}, {report: 1}, function(err, data) {
    if (err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'举报成功'});
  });

};

//点赞
exports.like = function(req, res){

  let _id = req.body._id,
    uid = req.body.uid,
    action = '';

  if(req.body.action === 'add'){
    action = {$addToSet: {like: uid}}
  }else{
    action = {$pull: {like: uid}}
  }

  CommentModel.findOneAndUpdate({_id: _id}, action, {new: true}, function(err, data) {
    if (err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'点赞成功', data: data});
  });

};
