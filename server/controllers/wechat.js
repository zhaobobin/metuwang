/** 微信路径token验证
 * 此文件只用于微信token验证
*/
var url = require('url');
var crypto = require("crypto");
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));

var prefix = 'https://api.wechat.qq.com/cgi-bin/';
var api = prefix + 'token?grant_type=client_credential';

//微信接口的哈希加密方法
function sha1(str) {
    var md5sum = crypto.createHash("sha1");
    md5sum.update(str);
    str = md5sum.digest("hex");
    return str;
}

//微信票据
function accessToken(opts){
	var that = this;
	this.appId = opts.appId;
	this.secret = opts.appSecret;
	this.getAccessToken = opts.getAccessToken;
	this.setAccessToken = opts.setAccessToken;

	this.getAccessToken()
		.then(function(data){
			try{
				data = JSON.parse(data);
			}
			catch(err){
				return that.updateAccessToken(data);
			}

			if(that.isValidAccessToken(data)){
				return data;
			}else{
				return that.updateAccessToken();
			}
		})
		.then(function(data){
			that.access_token = data.access_token;
			that.expires_in = data.expires_in;
			that.saveAccessToken(data);
		})

}
/*
Wechat.prototype.isValidAccessToken = function(data){
	if(!data || !data.access_token || !data.expires_in){
		return false;
	}
	var access_token = data.access_token;
	var expires_in = data.expires_in;	//结束时间
	var now = new Date().gettime();		//当前时间

	if(now < expires_in){				//未过期
		return true;
	}else{
		return false;
	}
}

Wechat.prototype.updateAccessToken = function(){
	var appId = this.appId;
	var appSecret = this.appSecret;
	var url = api.accessToken + '&appId=' + appId + '&secret=' + appSecret;

	return new Promise(function(resolve, reject){
		request({url: url, json: true}).then(function(res){
			var data = res.body;
			var now = new Date().gettime();
			var expires_in = now + (data.expires_in - 20) * 1000;	//票据提前20秒刷新
			data.expires_in = expires_in;
			resolve(data);
		})
	})

}
*/
exports.token = function(req, res){

	//var wechat = new Wechat();		//初始化
	
	var token = 'metuwangzhaobobin820502';
	var query = url.parse(req.url,true).query;
	var signature = query.signature;
	var timestamp = query.timestamp;
	var nonce = query.nonce;
	var echostr = query.echostr;
	
	var str = [token, timestamp, nonce].sort().join('');
	var scyptoString = sha1(str);
	
	if(scyptoString == signature){
		res.end(echostr);
		console.log("Confirm and send echo back");
	}else{
		res.end("false");
		console.log("Failed!");
	}
	
}