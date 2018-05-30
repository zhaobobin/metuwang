//Tags
const TagModel = require('../models/tag');
const ArticleModel = require('../models/article');

const option = {__v: 0};
const popuFilter = '-__v -password';

exports.list = function(req, res){

  let page = req.body.currentPage,
		rows = req.body.itemsPerPage,
    sort = req.body.sort ? req.body.sort : {_id: -1};

	TagModel.find({}, function(err, result){
		if(err) return res.json({status:0, msg:err});
    let total = result.length;
		TagModel.find({}, option)
    .sort(sort)
		.skip((page-1)*rows)
		.limit(rows)
		.exec(function(err, data){
			if(err) return res.json({status:0, msg:err});
      let hasMore = data.length === rows;
			res.json({status:1, msg:'成功', data:data, total: total, hasMore: hasMore});
		})
	});

};

exports.rank = function(req, res){

  let page = req.body.currentPage ? req.body.currentPage : 1,
		rows = req.body.itemsPerPage ? req.body.itemsPerPage : 10;

	TagModel.find({}, function(err, result){
		if(err) return res.json({status:0, msg:err});
    let total = result.length;
		TagModel.find({}, option)
		.skip((page-1)*rows)
		.limit(rows)
		.exec(function(err, data){
			if(err) return res.json({status:0, msg:err});
			res.json({status:1, msg:'成功', data:data, total: total});
		})
	});

};

//标签目录
exports.export = function(req, res){

};

//标签文章列表
exports.article = function(req, res){

  let name = req.body.tag,
		page = req.body.currentPage ? req.body.currentPage : 1,			//当前页数
		rows = req.body.itemsPerPage ? req.body.itemsPerPage : 10,			//每页数量
    sort = req.body.sort ? req.body.sort : {_id: -1};

  let start = (page-1)*rows,
		end = page * rows;

  TagModel.findOne({name: name})
  .exec(function(err, tag) {
    if(err || !tag) return res.json({status:0, msg:name+'：没有相关数据！'});
    let total = tag.articles.length,
      aids = tag.articles.slice(start, end);			//取数组的特定区间
    let hasMore = tag.length === rows;
    ArticleModel.find({_id: { $in: aids }})
    .populate({path: 'category uid', select: popuFilter})
    .sort(sort)
    .skip((page-1)*rows)
    .limit(rows)
    .exec(function(err, article){
      if(err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'成功', data:article, total:total, hasMore: hasMore});
    })
  })

};

exports.add = function(req, res){

  let tag = req.body.name;
  let createTag = new TagModel(tag);

  TagModel.findOne({name: tag}, function (err, data) {

    if (err) return res.json({status:0, msg:err});
    if (data) return res.json({status:0, msg:'标签名称已存在！'});

    TagModel.save(function (err, article) {
      if (err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'添加成功'});
    })

  })

};

exports.update = function(req, res){

  let body = req.body;
	TagModel.update({_id: body._id}, body, function(err, data){
		if(err){
			return res.json({status:0, msg:err});
		}
		res.json({status:1, msg:'更新成功', data:data});
	});

};

exports.del = function(req, res){

  let ids = req.body.ids;

  TagModel.find({_id: { $in: ids }}, function(err, result) {

    if (err) return res.json({status:0, msg:err});
    if(result.articles.length > 0) return res.json({status:0, msg:'不能删除有文章的标签！'});

    TagModel.remove({_id: { $in: _ids }}, function(err, data) {
      if (err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'删除成功', data: data});
    });

  });

};






