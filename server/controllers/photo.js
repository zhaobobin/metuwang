//Photo
const PhotoModel = require('../models/photo');
const TagModel = require('../models/tag');
const BrandModel = require('../models/brand');
const CameraModel = require('../models/camera');
const LenModel = require('../models/len');

const option = {__v: 0};
const popuFilter = '-__v -password';

exports.list = function(req, res){

	let page = req.body.currentPage ? req.body.currentPage : 1,			//当前页数
		rows = req.body.itemsPerPage ? req.body.itemsPerPage : 10,			//每页数量
		status = req.body.status === 0 ? 0 : 1,
    sort = req.body.sort ? req.body.sort : {_id: -1},
    params = req.body.params;

	//多条件查询
  let query = {
		status: status
	};

	if(params.uid) query.uid = params.uid;
	if(params.kw) query.title = {$regex : params.kw};

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
	PhotoModel.find(query)
  .exec(function(err, result){
    if(err) return res.json({status:0, msg:err});
    let total = result.length;			//数据总数
    PhotoModel.find(query)
      .populate({path: 'article uid', select: popuFilter})
      .sort(sort)
      .skip((page-1)*rows)
      .limit(rows)
      .exec(function(err, data) {
        if(err) return res.json({status:0, msg:err});
        let hasMore = data.length === rows;
        res.json({status:1, msg:'成功', data:data, total: total, hasMore: hasMore});
      })
  })

};

//依据图片的_id，查询该用户的图片列表a
exports.listByUser = function(req, res){

  let id = req.body.id;
  PhotoModel.findOne({_id: id})
  .exec(function(err, photo){
    if(err) return res.json({status:0, msg:err});
    if(!photo) return res.json({status:0, msg:'图片不存在'});

    PhotoModel.find({uid: photo.uid})
      .sort({_id: -1})
      .exec(function(err, data){
        if(err) return res.json({status:0, msg:err});
        res.json({status:1, msg:'成功', data:data});
      })
  })

};

exports.detail = function(req, res){

  let id = req.body.id,
    view = req.body.view ? req.body.view : 0;

  PhotoModel.findOneAndUpdate({_id: id}, {$inc: { views: view}}, {new: true})
    .populate({path: 'album uid', select: popuFilter})
    .exec(function(err, data) {
      if(err) return res.json({status:0, msg:err});
      res.json({status:1, msg:'成功', data:data});
    })

};

exports.add = function(req, res){

  let photoList = req.body;

  PhotoModel.create(photoList, function(err, result){
    if(err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'添加成功'});

    //更新相关表格
    for(let i in result){

      //更新器材
      if(result[i].camera){

        BrandModel.findOne({name: result[i].camera.brandName}, function(err, brand){
          if (err) return res.json({status:0, msg:err});
          if(!brand){
            let createBrand = new BrandModel({
              model: result[i].camera.brandModel,
              name: result[i].camera.brandName,
              type: 'camera'
            });
            createBrand.save(function (err, data) {
              console.log("brand："+ createBrand.name +" "+'保存成功！');
            });
          }
          CameraModel.findOne({name: result[i].camera.name}, function(err, model){
            if (err) return res.json({status:0, msg:err});
            if(!model){
              let newEquipment = {
                brand: result[i].camera.brandName,
                model: result[i].camera.model,
                name: result[i].camera.name,
                category: 'DSLR'
              };
              let createEquipment = new CameraModel(newEquipment);
              createEquipment.save(function (err, data) {
                console.log("equipment："+ newEquipment.model +" "+'保存成功！');
              });
            }
          })
        });

      }

      if(result[i].lens){
        BrandModel.findOne({name: result[i].lens.brandName}, function(err, brand){
          if (err) return res.json({status:0, msg:err});
          if(!brand){
            let createBrand = new BrandModel({
              model: result[i].lens.brandModel,
              name: result[i].lens.brandName,
              type: 'lens'
            });
            createBrand.save(function (err, data) {
              console.log("brand："+ createBrand.name +" "+'保存成功！');
            });
          }
          LenModel.findOne({name: result[i].lens.name}, function(err, model){
            if (err) return res.json({status:0, msg:err});
            if(!model){
              let newEquipment = {
                brand: result[i].lens.brandName,
                model: result[i].lens.model,
                name: result[i].lens.name,
              };
              let createEquipment = new LenModel(newEquipment);
              createEquipment.save(function (err, data) {
                console.log("equipment："+ newEquipment.model +" "+'保存成功！');
              });
            }
          })
        });

      }

      //更新tags映射
      if(result[i].tags){
        let _id = result[i]._id,
          tags = result[i].tags.split(',');
        tags.forEach(function(tag){
          TagModel.findOne({name: tag})
            .exec(function (err, data) {
              if (err) return res.json({status:0, msg:err});
              if (data){																		        //已有词条 更新操作
                for(let i=0;i<data.photos.length;i++){						  //映射objectId已存在时不更新photos
                  if(data.photos[i] === _id){
                    return false;
                  }
                }
                data.photos.push(_id);
                data.save(function(){
                  console.log("tags："+tag+" "+'更新成功！');
                });
              }else{																			          //没有词条 新建操作
                let createTag = new TagModel({name: tag});
                createTag.photos.push(_id);
                createTag.save(function (err, data) {
                  console.log("tags："+tag+" "+'保存成功！');
                });
              }
            })
        });
      }
    }

  })

};

exports.update = function(req, res){

  let photo = req.body,
    tags = photo.tags ? photo.tags.split(',') : undefined;

  PhotoModel.update({_id: photo.id}, photo, function(err, data){
    if(err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'更新成功', data:data});

    //更新tags映射
    if(tags){
      tags.forEach(function(tag){
        TagModel.findOne({name: tag})
          .exec(function (err, data) {
            if (err) return res.json({status:0, msg:err});
            if (data){																		        //已有词条 更新操作
              for(let i=0;i<data.photos.length;i++){						//映射objectId已存在时不更新photos
                if(data.photos[i] === photo._id){
                  return false;
                }
              }
              data.photos.push(photo._id);
              data.save(function(){
                console.log("tags："+tag+" "+'更新成功！');
              });
            }else{																			//没有词条 新建操作
              let createTag = new TagModel({name: tag});
              createTag.photos.push(photo._id);
              createTag.save(function (err, data) {
                console.log("tags："+tag+" "+'保存成功！');
              });
            }
          })
      });
    }
    //更新tags映射 end!
  })

};


exports.del = function(req, res){

  let ids = req.body.ids,
    tags = req.body.tags;

  PhotoModel.remove({_id: { $in: ids }}, function(err, article) {
    if (err) return res.json({status:0, msg:err});
    res.json({status:1, msg:'删除成功'});

    //更新tags
    if(tags){
      tags = tags.substring(0, tags.length-1);
      tags = tags.split(',');

      tags.forEach(function(tag){
        TagModel.findOne({name: tag})
          .exec(function (err, data) {
            if (err) return res.json({status:0, msg:err});
            for(let i=0; i<ids.length; i++){
              for(let j=0; j<data.photos.length; j++){
                if(data.photos[j] == ids[i]){
                  data.photos.splice(j, 1);
                }
              }
            }
            data.save(function(){
              console.log("tags："+tag+" "+'更新成功！');
            });
          })
      });

    }
    //更新tags映射 end!

  })

};
