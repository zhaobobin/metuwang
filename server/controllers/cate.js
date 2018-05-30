//CateModel
const CateModel = require('../models/cate');
const ArticleModel = require('../models/article');
const Counter = require('../models/counter');

const option = {__v: 0};

exports.list = function(req, res){

  let sort = {index: 1};

	CateModel.find({}, option)
  .sort(sort)
	.populate({path: 'model parent'})
	.exec(function(err, data){
		if(err) return res.json({status:0, msg:err});
		//data = CateModel.tree(data);
		res.json({status:1, msg:'成功', data:data});
	})

};

exports.add = function(req, res){

	let createCate = new CateModel(req.body);

	ArticleModel.find({category: req.body.parent}, function(err, article){

		if (err) return res.json({status:0, msg:err});
		if (article.length > 0) return res.json({status:0, msg:'有文章的分类禁止添加子分类！'});

    CateModel.findOne({name: req.body.name}, function (err, data) {
      if (err) return res.json({status:0, msg:err});

      if (data) return res.json({status:0, msg:'分类已经存在'});

      Counter.findAndModify(
        {_id: 'category'},
        [],
        {$inc: { count: 1}},
        {new: true, upsert: true},
        function (err, result){
          if (err) return res.json({status:0, msg:err});
          createCate.cateid = result.value.count;
          createCate.save(function (err, data) {
            if (err) return res.json({status:0, msg:err});
            res.json({status:1, msg:'添加成功', data:data});
          });
        }
      );
    });

	});
};

exports.update = function(req, res){

	let params = req.body;
	CateModel.update({_id: params._id}, params, function(err, data){
		if(err) return res.json({status:0, msg:err});
		res.json({status:1, msg:'更新成功', data:data});
	});

};

exports.del = function(req, res){

  let ids = req.body.ids;

	ArticleModel.find({category: { $in: ids }}, function(err, article){

		if (err) return res.json({status:0, msg:err});
		if(article.length > 0) return res.json({status: 0, msg: "禁止删除有文章的分类！"});
    CateModel.find({parent: { $in: ids }}, function(err, cate){
      if (err) return res.json({status:0, msg:err});
      if (cate.length > 0) return res.json({status: 0, msg: "禁止删除有子分类的分类！"});

      CateModel.remove({_id: { $in: ids }}, function(err, data) {
        if (err) return res.json({status:0, msg:err});
        res.json({status:1, msg:'删除成功', data:data});
      });

    });

	});

};






