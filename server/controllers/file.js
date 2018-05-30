//File
var fs = require('fs');
var path = require('path');

var OSS = require('ali-oss');
var STS = OSS.STS;
var co = require('co');

//对接阿里OSS - 令子账号扮演角色，然后创建临时的AccessKey
//STS是一个安全凭证（Token）的管理系统，用来授予临时的访问权限，这样就可以通过STS来完成对于临时用户的访问授权。

//授权oss编辑权限 生成临时token
exports.ossEdit = function(req, res){

	//子账号授权
	var sts = new STS({
		accessKeyId: 'LTAIeKq9uDQ8RNtE',
		accessKeySecret: 'WrsLXHpsmpALq8JmBmxdAKQbo4clag'
	});

	//角色信息
	var policy = {
		"Statement": [
			{
				"Action": [
					"oss:ListObjects",
					"oss:GetObject",
					"oss:DeleteObject",
					"oss:ListParts",
					"oss:AbortMultipartUpload",
					"oss:PutObject"
				],
				"Effect": "Allow",
				"Resource": ["acs:oss:*:*:metuwang/*"]
			}
		],
		"Version": "1"
	};

	var config = {
		RoleArn: 'acs:ram::1323073144340307:role/ramedit',		//表示的是需要扮演的角色ID
		DurationSeconds: 60 * 60,								//指的是临时凭证的有效期，单位是s，最小为900，最大为3600。
		RoleSessionName: 'ossEdit'								//是一个用来标示临时凭证的名称，一般来说建议使用不同的应用程序用户来区分。
	};

	co(function* () {
		var token = yield sts.assumeRole(config.RoleArn, policy, config.DurationSeconds, config.RoleSessionName);
		token.region = 'oss-cn-qingdao';
		token.bucket = 'metuwang';
		res.json({status:1, msg:'成功', data:token});
	})
	.catch(function (err) {
		console.log(err);
	});



};

//接收multipart/form-data文件
exports.updateFile = function(req, res){

	res.header('Access-Control-Allow-Origin', '*');
	res.json({state:1, msg:'成功', data:req.body});

};

//接收base64格式保存为文件
exports.updateBase64 = function(req, res){
	
	var newImg = req.body.newImg;
	var oldPath = req.body.oldPath ? 'public' + req.body.oldPath : '';

	//过滤data:URL
    var base64Data = newImg.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = Buffer.from(base64Data, 'base64');
	var date = new Date(),
		year = date.getFullYear(),
		month = date.getMonth()+1,
		day = date.getDate();
		
	month = (month<10 ? "0"+month : month);
	day = (month<10 ? "0"+day : day);
	
	var dateString = year.toString() + month.toString() + day.toString();
	var code = dateString + '_' + Math.floor(Math.random()*9000)+1000;
	var url = '/upload/thumb_' + code +'.jpg';
	var urlPath = path.join(__dirname, '../../public'+url);

	fs.writeFile(urlPath, dataBuffer, function(err) {
        if(err){
			res.json({status:0, msg:err});
        }else{
			if(oldPath){
				fs.unlink(oldPath, function(){
					res.json({status:1, msg:'保存成功', data: url});
				});
			}else{
				res.json({status:1, msg:'保存成功', data: url});
			}
        }
    });
	
};

exports.download = function(req, res){
	
	var readStream = fs.createReadStream();
	
	readStream.on('data', function(chunk){
		if(writeStream.write(chunk) === false){				//数据仍未读完时暂缓读取操作
			readStream.pause();
		}
	});
	
	readStream.on('end', function(chunk){
		readStream.end();
	})
	
};

//删除文件
exports.del = function(req, res){
	var paths = req.body.path;
	if(paths instanceof Array){
		paths.forEach(function(p){
			var urlPath = path.join(__dirname, '../../public'+p);
			fs.exists(urlPath, function(exists){
				if(exists) fs.unlink(urlPath);
			})
		});
	}else{
		var urlPath = path.join(__dirname, '../../public'+paths);
		fs.exists(urlPath, function(exists){
			if(exists) fs.unlink(urlPath);
		})
	}
	res.json({status:1, msg:'成功'});
};

