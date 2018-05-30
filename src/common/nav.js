import dynamic from 'dva/dynamic';

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => dynamic({
  app,
  models: () => models.map(m => import(`../models/${m}.js`)),
  component,
});

// nav data
export const getNavData = app => [

  {
    component: dynamicWrapper(app, ['form', 'category', 'login', 'article'], () => import('../layouts/IndexLayout')),
    layout: 'IndexLayout',
    name: '前台',
    path: '/',
    children: [
      {
        name: '首页',
        key: 'index',
        path: 'index',
        component: dynamicWrapper(app, [], () => import('../routes/Index/Index')),
      },
      {
        name: '影像',
        key: 'vision',
        path: 'vision',
        component: dynamicWrapper(app, [], () => import('../routes/Index/Vision')),
      },
      {
        name: '影像-分类',
        key: 'vision-category',
        path: 'vision/:category',
        isHide: true,
        component: dynamicWrapper(app, [], () => import('../routes/Index/Vision')),
      },
      {
        name: '素材',
        key: 'material',
        path: 'material',
        component: dynamicWrapper(app, [], () => import('../routes/Index/Material')),
      },
      {
        name: '教程',
        key: 'course',
        path: 'course',
        component: dynamicWrapper(app, ['tags'], () => import('../routes/Index/Course')),
      },
      {
        name: '器材',
        key: 'equipments',
        path: 'equipments',
        component: dynamicWrapper(app, ['equipments'], () => import('../routes/Index/Equipments')),
      },
      {
        name: '器材',
        key: 'equipments-list',
        path: 'equipments/:keyword',
        isHide: true,
        component: dynamicWrapper(app, ['equipments'], () => import('../routes/Index/Equipments')),
      },
      {
        name: '相机列表',
        key: 'camera',
        path: 'camera',
        isHide: true,
        component: dynamicWrapper(app, ['equipments'], () => import('../routes/Index/EquipmentsGear')),
      },
      {
        name: '相机详情',
        key: 'camera-detail',
        path: 'camera/:keyword',
        isHide: true,
        component: dynamicWrapper(app, ['equipments'], () => import('../routes/Index/EquipmentsGear')),
      },
      {
        name: '镜头列表',
        key: 'lens',
        path: 'lens',
        isHide: true,
        component: dynamicWrapper(app, ['equipments'], () => import('../routes/Index/EquipmentsGear')),
      },
      {
        name: '镜头详情',
        key: 'lens-detail',
        path: 'lens/:keyword',
        isHide: true,
        component: dynamicWrapper(app, ['equipments'], () => import('../routes/Index/EquipmentsGear')),
      },
      {
        name: '相册详情',
        path: 'album/:id/:title',
        isHide: true,
        component: dynamicWrapper(app, ['comment'], () => import('../routes/Index/AlbumDetail')),
      },
      {
        name: '图片详情',
        path: 'photo/:id/:title',
        isHide: true,
        component: dynamicWrapper(app, ['photo', 'comment'], () => import('../routes/Index/PhotoDetail')),
      },
      {
        name: '文章详情',
        path: ':category/:id/:title',
        isHide: true,
        component: dynamicWrapper(app, ['comment'], () => import('../routes/Index/ArticleDetail')),
      },
      {
        name: '标签云',
        path: '/tags',
        isHide: true,
        component: dynamicWrapper(app, ['tags'], () => import('../routes/Index/TagsExport')),
      },
      {
        name: '标签',
        path: '/tags/:tag',
        isHide: true,
        component: dynamicWrapper(app, ['tags'], () => import('../routes/Index/TagsArticle')),
      },
      {
        name: '用户中心',
        path: 'u/:username',
        isHide: true,
        component: dynamicWrapper(app, ['oss', 'photo', 'user'], () => import('../routes/Index/UserCenter')),
      },
      {
        name: '设置',
        path: 'setting',
        isHide: true,
        component: dynamicWrapper(app, ['oss'], () => import('../routes/Index/Setting')),
      },
      {
        name: '发布图片',
        path: 'publish/:type',
        isHide: true,
        component: dynamicWrapper(app, ['category', 'oss', 'photo'], () => import('../routes/Index/Publish')),
      },
    ]
  },

  {
    component: dynamicWrapper(app, ['form', 'login'], () => import('../layouts/SystemLayout')),
    layout: 'SystemLayout',
    name: '后台',
    path: '/system',
    children: [
      {
        name: '首页',
        icon: 'home',
        key: 'home',
        path: 'system/home',
        component: dynamicWrapper(app, [], () => import('../routes/Admin/Home')),
      },
      {
        name: '个人中心',
        icon: 'user',
        key: 'center',
        path: 'system/center',
        component: dynamicWrapper(app, ['admin', 'oss'], () => import('../routes/Admin/Center')),
      },
      {
        name: '系统设置',
        icon: 'setting',
        key: 'setting',
        path: 'system/setting',
        children: [
          {
            name: '站点配置',
            path: 'config',
            component: dynamicWrapper(app, ['config', 'oss'], () => import('../routes/Admin/Config')),
          },
          {
            name: '管理员管理',
            path: 'admin',
            component: dynamicWrapper(app, ['admin', 'role'], () => import('../routes/Admin/Admin')),
          },
          {
            name: '角色管理',
            path: 'role',
            component: dynamicWrapper(app, ['role'], () => import('../routes/Admin/Role')),
          },
        ]
      },
      {
        name: '内容管理',
        icon: 'profile',
        key: 'content-manage',
        path: 'system/content-manage',
        children: [
          {
            name: '文章列表',
            key: 'article',
            path: 'article',
            component: dynamicWrapper(app, ['article', 'category', 'oss', 'photo'], () => import('../routes/Admin/ArticleList')),
            children: [
              {
                name: '添加文章',
                path: 'add',
                isHide: true,
                component: dynamicWrapper(app, [], () => import('../routes/Admin/ArticleDetail')),
              },
              {
                name: '修改文章',
                path: 'update/:id',
                isHide: true,
                component: dynamicWrapper(app, [], () => import('../routes/Admin/ArticleDetail')),
              },
            ]
          },
          {
            name: '图片附件',
            path: 'photo',
            key: 'photo',
            component: dynamicWrapper(app, ['photo', 'oss'], () => import('../routes/Admin/PhotoList')),
          },
          {
            name: '标签云',
            key: 'tags',
            path: 'tags',
            component: dynamicWrapper(app, ['tags'], () => import('../routes/Admin/Tags')),
          },
          {
            name: '文章分类',
            key: 'category',
            path: 'category',
            component: dynamicWrapper(app, ['category', 'model'], () => import('../routes/Admin/Category')),
          },
          {
            name: '文章模型',
            key: 'model',
            path: 'model',
            component: dynamicWrapper(app, ['model'], () => import('../routes/Admin/Model')),
          },
        ]
      },
      {
        name: '器材管理',
        icon: 'hdd',
        key: 'equipments-manage',
        path: 'system/equipments-manage',
        component: dynamicWrapper(app, ['equipments'], () => import('../routes/Admin/EquipmentsManage')),
        children: [
          {
            name: '器材详情',
            path: 'detail/:id',
            isHide: true,
            component: dynamicWrapper(app, [], () => import('../routes/Admin/EquipmentsDetail')),
          },
        ]
      },
      {
        name: '用户管理',
        icon: 'contacts',
        key: 'user-manage',
        path: 'system/user-manage',
        component: dynamicWrapper(app, ['admin', 'user', 'role'], () => import('../routes/Admin/UserManage')),
      },
      {
        name: '评论管理',
        icon: 'message',
        key: 'comment-manage',
        path: 'system/comment-manage',
        component: dynamicWrapper(app, ['comment'], () => import('../routes/Admin/CommentManage')),
      },

    ],
  },

  {
    component: dynamicWrapper(app, ['admin', 'login'], () => import('../layouts/UserLayout')),
    layout: 'UserLayout',
    name: '用户',
    path: 'user',
    children: [
      {
        name: '登录',
        icon: 'user',
        path: 'user/login',
        component: dynamicWrapper(app, [], () => import('../routes/User/Login')),
      },
      {
        name: '注册',
        icon: 'user',
        path: 'user/register',
        component: dynamicWrapper(app, ['role'], () => import('../routes/User/Register')),
      },
    ],
  },
];
