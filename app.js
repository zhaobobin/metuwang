/**
 * 后端服务入口
 */
const path = require('path'),
  express = require('express'),
  compression = require('compression'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  mongoStore = require('connect-mongo')(session),
  bodyParser = require('body-parser'),
  favicon = require('serve-favicon'),
  router = require('./server/router/router'),
  dist = path.join(__dirname,'dist'),
  port = 8080;

//mongoDB
const mongoose = require('mongoose'),
  dbUrl = 'mongodb://localhost/mydb',
  db = mongoose.connection;
mongoose.connect(dbUrl);
db.once('open', function () {
  console.log('mongoDB has been connected.');
});
db.on('error', function(err){
  console.log('connect to mongoDB error: ', err.message);
});

//Express
const app = express();
app.listen(port, function(){
  console.log('metuwang server start at port:' + port)
});

app.use(compression());																		                  //gzip
app.set('views', dist);										                                  //视图路径
app.use(express.static(dist));						                                  //静态资源
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));				    //ico图标
app.engine('.html', require('ejs').__express);											        //模板引擎
app.set('view engine', 'html');																	            //模板类型
app.set('routes', './router/router.js');													          //node路由
app.use(bodyParser.urlencoded({limit: '2mb', extended: true}));			        //路径转码
app.use(bodyParser.json({limit: '2mb'}));                                   //解析json
app.use(cookieParser());                                                    //cookie

//session
app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: 'metuwang',
  cookie: {maxAge: 60 * 60 * 1000 * 168 },		//12h
  store: new mongoStore({
    url: dbUrl,
    collection: 'sessions'
  })
}));

app.use(router);

//404
app.use(function(req, res){
  res.status(404);
  res.render('404', { title: '404' });
});

//500
app.use(function(err, req, res, next){
  res.status(500);
  res.render('500');
  next(err);
});
