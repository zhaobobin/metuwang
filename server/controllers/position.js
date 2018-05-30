//PositionModel
var PositionModel = require('../models/position');

exports.list = function(req, res){
	
	PositionModel.find({})
	.exec(function(err, data){
		if(err){
			return res.json({status:0, msg:err});
		}
		res.json({status:1, msg:'成功', data:data});
	})
	
};

exports.welcome = function(req, res){

	function randNum(minnum , maxnum){
		return Math.floor(minnum + Math.random() * (maxnum - minnum));
	}
	PositionModel.find({focus: true}, function(err, result){
		if (err) return res.json({status:0, msg:err});
		//var total = result.length;
		//var index = randNum(1,total);
		//var name = result[index].name;
		console.log(result)
		/*
		PositionModel.findOne({name: name}, function (err, data) {
			if (err) return res.json({status:0, msg:err});
			res.json({status:1, msg:'成功', data:data});
		});
		*/
	});

};

exports.add = function(req, res){
	
	var createPos = new PositionModel(req.body);
	
	PositionModel.findOne({name: req.body.name}, function (err, data) {
        if (err)
            return res.json({status:0, msg:err});
        if (data) {
            return res.json({status:0, msg:'名称已经存在'});
        }
		createPos.save(function (err, data) {
            if (err) {
                return res.json({status:0, msg:err});
            }
            res.json({status:1, msg:'成功', data:data});
        });
		
    });
	
};

exports.update = function(req, res){
	
	var data = req.body;
	PositionModel.update({_id: data._id}, data, function(err, data){
		if(err){
			return res.json({status:0, msg:err});
		}
		res.json({status:1, msg:'成功', data:data});
	});
	
};

exports.del = function(req, res){
	
	var id = req.body.id;
	PositionModel.remove({
		_id: id
	}, function(err, data) {
		if (err) {
			return res.json({status:0, msg:err});
		}
		res.json({status:1, msg:'成功', data:data});
	});
	
};






