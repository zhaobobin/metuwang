const captchapng = require('captchapng');

//图形验证码
exports.captcha = function(req , res){
	let code = Math.floor(Math.random()*9000)+1000;	      //4位验证码
	req.session.captcha = code;										        //存入session
  let p = new captchapng(80,30,parseInt(code));		      //图片尺寸
    p.color(255, 255, 255, 0);  											  //背景色(red, green, blue, alpha)
    p.color(Math.round(Math.random()*255+1), Math.round(Math.random()*255+1), Math.round(Math.random()*255+1), 255);//文字颜色(red, green, blue, alpha)
  let img = p.getBase64();
  let imgbase64 = new Buffer(img,'base64');
  res.writeHead(200, {
      'Content-Type': 'image/png'
  });
  res.end(imgbase64);

};

exports.session = function(req, res){
  let session = req.session.user;
	if(session){
		res.json({status:1, msg:'成功', data: session});
	}else{
		res.json({status:9, msg:'超时', data: {}});
	}
};

exports.logout =  function(req, res) {
	delete req.session.user;
	res.json({status:1, msg:'成功'});
};
