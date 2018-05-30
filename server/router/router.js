const router = require('express').Router();
const multiparty = require('connect-multiparty');
const multipartMiddleware = multiparty();

/** ------------------------------------ Require ------------------------------------ */
//common
const Common = require('../controllers/common');
const Search = require('../controllers/search');
const File = require('../controllers/file');
const Tags = require('../controllers/tags');
const Equipment = require('../controllers/equipment');

//admin
const Admin = require('../controllers/admin');
const Role = require('../controllers/role');
const Config = require('../controllers/config');
const Cate = require('../controllers/cate');
const Article = require('../controllers/article');
const Photo = require('../controllers/photo');
const Album = require('../controllers/album');
const Position = require('../controllers/position');
const Model = require('../controllers/model');

//index
const User = require('../controllers/user');
const Comment = require('../controllers/comment');

/** ------------------------------------ Router ------------------------------------ */
//301
// router.get('/*', function (req, res, next) {
//   let haswww = req.headers.host.match(/^www\./),
//     url = ['http://www.', req.headers.host, req.url].join('');
//   haswww ? next() : res.redirect(301, url);
// });

//captcha
router.get('*/captcha.png', Common.captcha);

//index
router.get('/*', function(req, res){
  res.render('index/index', { title: 'index' });
});

//bishu
router.get('/bishu', function(req, res){
  res.render('bishu/index', { title: 'index' });
});

//Common
router.post('*/session', Common.session);
router.post('*/logout', Common.logout);

//Admin
router.post('*/AdminCount', Admin.count);
router.post('*/AdminRegister', Admin.register);
router.post('*/AdminLogin', Admin.login);
router.post('*/AdminList', Admin.list);
router.post('*/AdminDetail', Admin.detail);
router.post('*/AdminDel', Admin.del);
router.post('*/AdminUpdate', Admin.update);
router.post('*/AdminUpdatePsd', Admin.updatePsd);
router.post('*/AdminNameCheck', Admin.nameCheck);

//User
router.post('*/UserRegister', User.register);
router.post('*/UserLogin', User.login);
router.post('*/UserCount', User.count);
router.post('*/UserList', User.list);
router.post('*/UserDetail', User.detail);
router.post('*/UserDel', User.del);
router.post('*/UserUpdate', User.update);
router.post('*/UserUpdatePsd', User.updatePsd);
router.post('*/UserNameCheck', User.nameCheck);
router.post('*/UserCollect', User.collect);
router.post('*/UserFollow', User.follow);
router.post('*/UserBanner', User.banner);

//Role(角色)
router.post('*/RoleList', Role.list);
router.post('*/RoleAdd', Role.add);
router.post('*/RoleUpdate', Role.update);
router.post('*/RoleDel', Role.del);

//Search(搜索)
router.post('*/search',Search.index);

//Config(基础设置)
router.post('*/ConfigIndex',Config.index);
router.post('*/ConfigSave',Config.save);

//Model(模型)
router.post('*/ModelList', Model.list);
router.post('*/ModelInit', Model.init);
router.post('*/ModelAdd', Model.add);
router.post('*/ModelUpdate', Model.update);
router.post('*/ModelDel', Model.del);

//Cate(分类)
router.post('*/CateList',Cate.list);
router.post('*/CateAdd',Cate.add);
router.post('*/CateUpdate',Cate.update);
router.post('*/CateDel',Cate.del);

//Tags(标签)
router.post('*/TagsList',Tags.list);
router.post('*/TagsRank',Tags.rank);
router.post('*/TagsArticle',Tags.article);
router.post('*/TagsAdd',Tags.add);
router.post('*/TagsUpdate',Tags.update);
router.post('*/TagsDel',Tags.del);

//Equipment(器材)
router.post('*/EquipmentExplore',Equipment.explore);
router.post('*/EquipmentList',Equipment.list);
router.post('*/EquipmentAdd',Equipment.add);

//Article(文章)
router.post('*/ArticleList',Article.list);
router.post('*/ArticleRank',Article.rank);
router.post('*/ArticleDetail',Article.detail);
router.post('*/ArticlePos',Article.position);
router.post('*/ArticlePosDel',Article.posDel);
router.post('*/ArticleWel',Article.welcome);
router.post('*/ArticleAdd',Article.add);
router.post('*/ArticleUpdate',Article.update);
router.post('*/ArticleDel',Article.del);
router.post('*/ArticleLike',Article.like);

//Photo(图片)
router.post('*/PhotoList',Photo.list);
router.post('*/PhotoListByUser',Photo.listByUser);
router.post('*/PhotoDetail',Photo.detail);
router.post('*/PhotoAdd',Photo.add);
router.post('*/PhotoUpdate',Photo.update);
router.post('*/PhotoDel',Photo.del);

//Album(相册)
router.post('*/AlbumList',Album.list);
router.post('*/AlbumRank',Album.rank);
router.post('*/AlbumDetail',Album.detail);
router.post('*/AlbumSave',Album.save);
router.post('*/AlbumDel',Album.del);

//Comment(评论)
router.post('*/CommentList',Comment.list);
router.post('*/CommentReplyList',Comment.replyList);
router.post('*/CommentAdd',Comment.add);
router.post('*/CommentDel',Comment.del);
router.post('*/CommentReport',Comment.report);
router.post('*/CommentLike',Comment.like);

//Position(推荐位)
router.post('*/PosList', Position.list);
router.post('*/PosWelcome', Position.welcome);
router.post('*/PosAdd', Position.add);
router.post('*/PosUpdate',Position.update);
router.post('*/PosDel', Position.del);

//File(文件操作)
router.post('*/Base64Update',File.updateBase64);
router.post('*/FileUpdate', multipartMiddleware, File.updateFile);
router.post('*/FileDownload',File.download);
router.post('*/FileDel',File.del);
router.post('*/FileOssEdit',File.ossEdit);

module.exports = router;
