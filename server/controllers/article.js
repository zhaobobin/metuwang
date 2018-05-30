//Article
const ArticleModel = require('../models/article');
const PhotoModel = require('../models/photo');
const CateModel = require('../models/cate');
const UserModel = require('../models/user');
const TagModel = require('../models/tag');
const Counter = require('../models/counter');

const option = {__v: 0};
const popuFilter = '-__v -password';

exports.list = function(req, res){

	let page = req.body.currentPage ? req.body.currentPage : 1,			//当前页数
		rows = req.body.pageSize ? req.body.pageSize : 10,			      //每页数量
		status = req.body.status === 0 ? 0 : 1,
    sort = req.body.sort ? req.body.sort : {createtime: -1},
    params = req.body.params;

	//多条件查询
	let query = {
		status: status
	};

	if(params.parent) query.parent = params.parent;
	if(params.modelType) query.modelType = params.modelType;
	if(params.uid) query.uid = params.uid;
	if(params.tags) query.tags = {$regex : query.tags};
	if(params.kw) query.title = {$regex : params.kw};               //标题模糊查询

  if(params.category){
    switch(params.category) {
      case 'editor': query.tuijian = true; break;
      case 'popular': sort = {views: -1}; break;
      case 'new': sort = {createtime: -1}; break;
      default: query.category = params.category; break;
    }
  }

	if(params.startTime && params.endTime){
    query.createtime = {
			"$gte": params.startTime,
			"$lt": params.endTime
		}
	}else if(params.startTime && !params.endTime){
    query.createtime = {
			"$gte": params.startTime
		}
	}else if(!params.startTime && params.endTime){
    query.createtime = {
			"$lt": params.endTime
		}
	}
	ArticleModel.find(query, function(err, result){
		if(err) return res.json({status:0, msg:err});
		let total = result.length;			//数据总数
		ArticleModel.find(query, option)
    .populate({path: 'category uid', select: popuFilter})
    .sort(sort)
		.skip((page-1)*rows)
		.limit(rows)
		.exec(function(err, data) {
			if(err) return res.json({status:0, msg:err});
      let hasMore = data.length === rows;
			res.json({status:1, msg:'成功', data:data, total: total, hasMore: hasMore});
		})
	});

};

exports.listByCate = function(req, res){

};

exports.rank = function(req, res){

	let category = req.body.category ? req.body.category : '',
    modelType = req.body.modelType ? req.body.modelType : '',
		page = req.body.currentPage ? req.body.currentPage : 1,			//当前页数
		rows = req.body.pageSize ? req.body.pageSize : 10;			//数量

	//多条件查询
	let query = {
		status: 1
	};

	if(category) query.category = { $in: category };
	if(modelType) query.modelType = modelType;

	ArticleModel.find(query, option)
  .populate({path: 'category uid', select: popuFilter})
	.sort({views: -1})
	.skip((page-1)*rows)
	.limit(rows)
	.exec(function(err, data) {
		if(err) return res.json({status:0, msg:err});
		res.json({status:1, msg:'成功', data:data});
	})

};

//查询推荐位
exports.position = function(req, res){

	//多条件查询
	let query = {
		status: 1
	};
	if(req.body.cateid){query.cateid = { $in: req.body.cateid }}
	if(req.body.focus){query.focus = req.body.focus}
	if(req.body.tuijian){query.tuijian = req.body.tuijian}

	ArticleModel.find(query, option)
  .populate({path: 'uid',  select: popuFilter})
	.sort({id: -1})
	.exec(function(err, data) {
		if(err) return res.json({status:0, msg:err});
		res.json({status:1, msg:'成功', data:data});
	});

};

//移出推荐位
exports.posDel = function(req, res){

	let update,
		id = req.body.id,
		type = req.body.type;

	switch(type){
		case 'focus': update = {focus: false};break;
		case 'tuijian': update = {tuijian: false};break;
	}

	ArticleModel.update({id: id}, update, function(err, data){
		if (err) return res.json({status:0, msg:err});
		res.json({status:1, msg:'操作成功', data:data});
	})

};

//首页欢迎
exports.welcome = function(req, res){

	function randNum(minnum , maxnum){
		return Math.floor(minnum + Math.random() * (maxnum - minnum));
	}

	ArticleModel.find({focus: true}, option)
  .populate({path: 'uid', select: popuFilter})
  .exec(function(err, result){
    if (err) return res.json({status:0, msg:err});
    if (!result || result.length === 0) return res.json({status:0, msg:'暂无数据！'});
    let total = result.length,
      index = randNum(0, total);

    res.json({status:1, msg:'成功', data: result[index]});
  });

};

exports.detail = function(req, res){

	let id = req.body.id;

	ArticleModel.findOneAndUpdate({_id: id}, {$inc: { views: 1}}, {new: true})
  .populate({path: 'category uid', select: popuFilter})
	.exec(function(err, data) {
		if(err) return res.json({status:0, msg:err});
		res.json({status:1, msg:'成功', data:data});
	})

};

//喜欢
exports.like = function(req, res){
  let _id = req.body._id,
    uid = req.body.uid,
    articleAction = '',
    userAction = '';
  if(req.body.action === 'add'){
    articleAction = {$addToSet: {like: uid}};
    userAction = {$addToSet: {like: _id}};
  }else{
    articleAction = {$pull: {like: uid}};
    userAction = {$pull: {like: _id}};
  }
  UserModel.findOneAndUpdate({_id: uid}, userAction)
  .exec(function(err, user){
    if(err) return res.json({status:0, msg:err});

    ArticleModel.findOneAndUpdate({_id: _id}, articleAction, {new: true})
    .populate({path: 'category uid', select: popuFilter})
    .exec(function(err, data) {
      if(err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'成功', data:data});
    })

  })
};

exports.add = function(req, res){

	let article = req.body,
    tags = article.tags ? article.tags.split(',') : undefined,
	  createArticle = new ArticleModel(article);

  ArticleModel.findOne({title: article.title}, function (err, data) {

    if (err) return res.json({status:0, msg:err});
    if (data) return res.json({status:0, msg:'文章标题重复'});

		Counter.findAndModify({_id: 'article'}, [], {$inc: { count: 1}}, {new: true, upsert: true}, function (err, result){

			if (err) return res.json({status:0, msg:err});
			createArticle.index = result.value.count;												//文章序号
			//保存文章
			createArticle.save(function (err, article) {
				if (err) return res.json({status:0, msg:err});
				res.json({status:1, msg:'添加成功', data: article});							//文章保存成功
				//保存tags映射
				if(tags){
					tags.forEach(function(tag){
						TagModel.findOne({name: tag}, function (err, data) {
							if (err) return res.json({status:0, msg:err});
							if (data){																		//已有词条
								data.articles.push(article._id);
								data.save(function(){
									console.log("tags："+tag+" "+'更新成功！');
								});
							}else{																			//没有词条
								let createTag = new TagModel({name: tag});
								createTag.articles.push(article._id);
								createTag.save(function (err, data) {
									console.log("tags："+tag+" "+'保存成功！');
								});
							}
						});
					});
				}
				//保存tags映射 end!
			});
			//保存文章 end!
		});

  });

};

exports.update = function(req, res){

	let article = req.body,
    tags = article.tags ? article.tags.split(',') : undefined;

	ArticleModel.update({_id: article.id}, article, function(err, data){
		if(err) return res.json({status:0, msg:err});
		res.json({status:1, msg:'更新成功', data:data});
		//更新tags映射
		if(tags){
			tags.forEach(function(tag){
				TagModel.findOne({name: tag}, function (err, data) {
					if (err) return res.json({status:0, msg:err});
					if (data){																		        //已有词条 更新操作
						for(let i=0;i<data.articles.length;i++){						//映射objectId已存在时不更新articles
							if(data.articles[i] == article.id){
								return false;
							}
						}
						data.articles.push(article.id);
						data.save(function(){
							console.log("tags："+tag+" "+'更新成功！');
						});
					}else{																			//没有词条 新建操作
						let createTag = new TagModel({name: tag});
						createTag.articles.push(article.id);
						createTag.save(function (err, data) {
							console.log("tags："+tag+" "+'保存成功！');
						});
					}
				});
			});
		}
		//更新tags映射 end!
	});

};

//删除文章(支持批量)，依据_id删除文章数据，同时更新category、tag的字段映射
exports.del = function(req, res){

  let ids = req.body.ids,
    tags = req.body.tags;

	ArticleModel.remove({_id: { $in: ids }}, function(err, article) {
		if (err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'删除成功'});

		Counter.findAndModify({_id: 'article'}, {$inc: { count: -ids.length}}, function (err, result){
			if (err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'成功'});
		});

		//更新photo的album
    PhotoModel.find({album: { $in: ids }}, function(err, data) {
      if (err) return res.json({status:0, msg:err});
      for(let i=0; i<ids.length; i++){
        for(let j=0; j<data.length; j++){
          let index = data[j].album.indexOf(ids[i]);
          if(index > -1){
            data[j].album.splice(index, 1);
          }
        }
      }
      data.forEach(function(d){
        d.save(function(){
          console.log('album更新成功！');
        });
      });

    });

		//更新tags
    if(tags){
      tags = tags.substring(0, tags.length-1);
      tags = tags.split(',');

      tags.forEach(function(tag){
        TagModel.update({name: tag}, {$pull: {articles: { $in: ids }}}, function (err, data) {
          if (err) return res.json({status:0, msg:err});
          console.log("tags："+tag+" "+'更新成功！');
        });
      });

    }
		//更新tags映射 end!

	});

};

