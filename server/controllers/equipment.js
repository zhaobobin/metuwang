//Equipment
const BrandModel = require('../models/brand');
const CameraModel = require('../models/camera');
const LenModel = require('../models/len');
const PhoneModel = require('../models/phone');

const option = {__v: 0};

exports.explore = function(req, res){

  let page = 1,
    rows = 10,
    sort = {_id: -1};

  let cameraQuery = {brand: {$in : ['canon', 'nikon', 'sony', 'pentax', 'olympus']}};
  let lensQuery = {};

  CameraModel.find(cameraQuery, option)
  .sort(sort)
  .skip((page-1)*rows)
  .limit(rows)
  .exec(function(err, camera){
    if(err) return res.json({status:0, msg:err});

    LenModel.find(lensQuery, option)
      .sort(sort)
      .skip((page-1)*rows)
      .limit(rows)
      .exec(function(err, lens){
        if(err) return res.json({status:0, msg:err});

        res.json({status:1, msg:'成功', camera:camera, lens: lens});

      });

  });

};

exports.list = function(req, res){

  let page = req.body.currentPage ? req.body.currentPage : 1,
    rows = req.body.pageSize ? req.body.pageSize : 10,
    params = req.body.params,
    sort = req.body.sort ? req.body.sort : {_id: -1};

  let query = {};
  if(params.brand) query.brand = params.brand;
  if(params.name) query.name = {$regex : params.name};          //模糊查询

  let brandQuery = {};
  if(params.category) brandQuery.type = params.category;

  //查询品牌列表
  BrandModel.find(brandQuery)
  .exec(function(err, brand){
    if(err) return res.json({status:0, msg:err});

    let Model = '';
    switch(params.category){
      case 'camera': Model = CameraModel; break;
      case 'lens': Model = LenModel; break;
      case 'phone': Model = PhoneModel; break;
      default: Model = CameraModel;
    }

    //查询列表
    Model.find(query, function(err, result){
      if(err) return res.json({status:0, msg:err});
      let total = result.length;
      Model.find(query, option)
        .sort(sort)
        .skip((page-1)*rows)
        .limit(rows)
        .exec(function(err, data){
          if(err) return res.json({status:0, msg:err});
          let hasMore = data.length === rows;
          res.json({status:1, msg:'成功', data:data, total: total, hasMore: hasMore, brand: brand});
        })
    });

  });

};

exports.add = function(req, res){

};






