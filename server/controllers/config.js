//Config
let ConfigModel = require('../models/config');

exports.index = function(req, res){

	ConfigModel.findOne({})
	.populate({path: 'config'})
	.exec(function(err, data){
		if(err){
			return res.json({status:0, msg:err});
		}
		res.json({status:1, msg:'成功', data:data});
	})

};

exports.save = function(req, res){

	let createConfig = new ConfigModel(req.body);
	ConfigModel.findOne({_id: req.body._id}, function (err, data) {
        if (err)
            return res.json({status:0, msg:err});
        if (data) {
			//已存在
			ConfigModel.update({_id: req.body._id}, req.body, function(err, data){
				if(err){
					return res.json({status:0, msg:err});
				}
				res.json({status:1, msg:'成功', data:data});
			});
        }else{
			//不存在
			createConfig.save(function (err, data) {
				if (err) {
					return res.json({status:0, msg:err});
				}
				res.json({status:1, msg:'成功', data:data});
			});
		}

    });

};










