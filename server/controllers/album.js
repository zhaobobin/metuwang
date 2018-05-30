//Album
var AlbumModel = require('../models/album');
var Counter = require('../models/counter');

const option = {__v: 0};

exports.list = function(req, res){

    var uid = req.body.uid ? req.body.uid : '',
        page = req.body.currentPage ? req.body.currentPage : 1,			//当前页数
        rows = req.body.itemsPerPage ? req.body.itemsPerPage : 10,			//每页数量
        status = req.body.status == 0 ? 0 : 1;

    //多条件查询
    var query = {
        status: status
    };
    if(uid) query.uid = uid;

    AlbumModel.find(query, function(err, result){
        if(err) return res.json({status:0, msg:err});
        var total = result.length;			//数据总数
        AlbumModel.find(query, option)
        .sort({id: -1})
        .skip((page-1)*rows)
        .limit(rows)
        //.populate({path: 'uid'})
        .exec(function(err, data) {
            if(err) return res.json({status:0, msg:err});
            res.json({status:1, msg:'成功', data:data, total: total});
        })
    });

};

exports.rank = function(req, res){

    var page = req.body.currentPage ? req.body.currentPage : 1,			//当前页数
        rows = req.body.itemsPerPage ? req.body.itemsPerPage : 10;			//数量

    //多条件查询
    var query = {
        status: 1
    };

    AlbumModel.find(query, option)
    .sort({views: -1})
    .skip((page-1)*rows)
    .limit(rows)
    .exec(function(err, data) {
        if(err) return res.json({status:0, msg:err});
        res.json({status:1, msg:'成功', data:data});
    })

};

exports.detail = function(req, res){

    var id = req.body.id;

    AlbumModel.findOne({id: id}, function(err, data) {
        if(err){
            return res.json({status:0, msg:err});
        }
        res.json({status:1, msg:'成功', data:data});
    })

};

//添加、更新
exports.save = function(req, res){

    var session = req.session.user;
    if(!session) res.json({status:9, msg:'超时'});

    var body = req.body,
        title = req.body.content.title,
        createAlbum = new AlbumModel(req.body);

    AlbumModel.findOne({title: title}, function (err, data){
        if(err) return res.json({status:0, msg:err});
        if(data){												//更新
            AlbumModel.update({title: title}, body, function(err, data){
                if(err) return res.json({status:0, msg:err});
                res.json({status:1, msg:'成功', data:data});
            });
        }else{													//添加
            Counter.findAndModify({_id: 'album'}, [], {$inc: { count: 1}}, {new: true, upsert: true}, function (err, result){
                if(err) return res.json({status:0, msg:err});
                createAlbum.id = result.value.count;
                createAlbum.save(function (err, data) {
                    if(err) return res.json({status:0, msg:err});
                    res.json({status:1, msg:'成功', data: data});
                });
            });
        }
    })

};


exports.del = function(req, res){

    var session = req.session.user;
    if(!session) res.json({status:9, msg:'超时'});

    var id = req.body.id;
    AlbumModel.remove({id: id}, function(err, data) {
        if (err) {
            return res.json({status:0, msg:err});
        }
        res.json({status:1, msg:'成功', data:data});

    });

};


