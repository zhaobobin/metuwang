#项目启动

  服务端：npm run server，启动localhost:8080
  前端：npm start index 或 npm start
  后端：npm start admin
  
  说明：本地开发使用8000端口，启用代理实现ajax。
    本地测试使用8080端口。
    项目上线使用阿里云80端口。
    
#chrome跨域
open -n /Applications/Google\ Chrome.app/ --args --disable-web-security  --user-data-dir=/Users/zhaobobin/Documents/ChromeUserData
  
#pm2 项目启动

pm2 start /root/metu/app.js
pm2 save
pm2 startup
pm2 restart all
pm2 delete all                 # 关闭并删除所有应用
pm2 monit                      # 监控日志
  
#目录结构

  ├── dist                     # 静态资源(生产)
  ├── mock                     # 本地模拟数据
  ├── public                   # 公共资源 - 图片等
  │   └── favicon.ico          # Favicon
  ├── server                   # 服务端 - nodejs，开发环境8000端口，测试环境8080，上线端口80。
  ├── src                      # 前端资源 - 含index端、admin端
  │   ├── assets               # 本地静态资源
  │   ├── common               # 应用公用配置，如导航信息
  │   ├── components           # 业务通用组件
  │   ├── e2e                  # 集成测试用例
  │   ├── layouts              # 通用布局
  │   ├── models               # dva model
  │   ├── routes               # 业务页面入口和常用模板
  │   ├── services             # 后台接口服务
  │   ├── utils                # 工具库
  │   ├── g2.js                # 可视化图形配置
  │   ├── theme.js             # 主题配置
  │   ├── index.ejs            # HTML 入口模板
  │   ├── admin.js             # 应用入口
  │   ├── index.less           # 全局样式
  │   └── router-admin.js            # 路由入口
  ├── tests                    # 测试工具
  ├── README.md
  └── package.json

#代理：配置.roadhogrc.mock.js

  export default {
    [`POST /api/*`]: function (req, res) {
      res.redirect(307, `locaohost:8080/api${req.originalUrl}`);
    },
  };
  
#路由配置 ./routes.js、 ./layouts/SystemLayout.js

  1、登录布局：<Route path="/login" render={props => <UserLayout {...props} {...passProps} />} />
  
  2、导航布局：<Route path="/" render={props => <SystemLayout {...props} {...passProps} />} />
  
  3、默认跳转：<Redirect exact from="/" to="/welcome" />
  
  4、404(登录后可用)：<Route component={NotFound} />
  
    <LocaleProvider locale={zhCN}>
        <Router history={history}>
          <Switch>
            <Route path="/login" render={props => <UserLayout {...props} {...passProps} />} />
            <Route path="/" render={props => <SystemLayout {...props} {...passProps} />} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </LocaleProvider>
      
      <Redirect exact from="/" to="/welcome" />
    
#登录验证

  1、登录成功跳转：./models/login.js，this.props.login.isAuth = true
  
    if (response.status === 200) {
      yield put(routerRedux.push('/'));
    }
    
  2、登录验证
  
    ./layouts/SystemLayout.js中，验证this.props.login.isAuth，为false则跳转到登录。
    ./models/login.js中，验证Storage.get('metu-userinfo')是否存在。
    
    {
      login.isAuth ?
      getRouteData('SystemLayout').map(item =>
        (
          <Route
            exact={item.exact}
            key={item.path}
            path={item.path}
            component={item.component}
          />
        )
      )
      :
      <Redirect to="/login" />
    }
  
  3、退出登录：清空redux保存的currentUser数据，isAuth重置为false。
  
  4、处理F5刷新
  
    ./models/login.js
    
    登录成功后：  本地保存userinfo
      yield response.status === 200 ? Storage.set('userinfo', response.data) : null;
      
    redux初始化：isAuth: !!Storage.get('userinfo')

-------------------------------------> redux <-------------------------------------

#组件连接redux
  @connect(state => ({
    login: state.login,
    manage: state.manage,
  }))

#redux调用顺序
  
  1、在models文件夹中，定义model文件
  
  2、model调用services中对应的模块，通过封装的request函数发起fetch请求
  
  3、src/common中，在组件上绑定model
    component: dynamicWrapper(app, ['user', 'login', 'manage'], () => import('../layouts/SystemLayout'))
    
  4、在组件中调用dispatch，传入与type与参数，type名称对应model的namespace + effects名称
    this.props.dispatch({
      type: 'manage/expertList',
      payload: this.state.params
    })
    
-------------------------------------> 本地存储Storage <-------------------------------------

metu-ajaxFlag: 防止重复提交
metu-userinfo: 用户信息
metu-username: 用户名
metu-remember: 记住账号
metu-menuList: 快捷菜单
metu-pageSize: 分页每页数量

-------------------------------------> 问题 <-------------------------------------

1、配置不在导航显示的子路由：https://github.com/ant-design/ant-design-pro/issues/227
  
  三级路由，带参数的路由配置
  
    修改三个文件SystemLayout.js、PageHeader.js、utils.js
  
    然后可以在nav.js中，配置如下结构的路由，isHide设置菜单隐藏。
    ```
      {
        name: '专家管理',
        icon: 'flag',
        path: 'expert-manage',
        component: dynamicWrapper(app, ['form'], () => import('../routes/Manage/Expert')),
        children: [
          {
            name: '详情',
            path: 'detail/:uid',
            isHide: true,
            component: dynamicWrapper(app, [], () => import('../routes/Manage/Detail')),
          },
        ]
      },
    ```
    
2、关于dva中effect的异步操作

  组件执行dispatch，然后依据model中callback返回的结果执行后续操作

  组件调用：
    this.props.dispatch({
      type: 'admin/addAdmin',
      payload: {
        username: values.add_username,
        password: values.password,
        email: values.email,
        role: {
          roleid: values.add_role.split('-')[0],
          rolename: values.add_role.split('-')[1],
        },
      },
      callback: (res) => {
        if(res.status === 1) this.queryList()
      }
    });
    
  model执行回调：
    if (response.status === 1) {
      notification.success({
        message: '添加成功！',
        description: '',
      });
      callback(response)
    }else{
      notification.error({
        message: '添加失败！',
        description: response.msg,
      });
    }
    
3、Table支持服务端排序

  columns数组项配置，sorter: true, 当分页函数出发变化时，重新查询数据列表
    
4、Table列表操作的排除项

  getCheckboxProps: record => ({
    disabled: record.username === 'admin',
  })
  
5、build后，css文件没有压缩？

  https://github.com/sorrycc/roadhog/issues/460

  找到node_modules roadhog包
  /lib/utils/getCSSLoaders.js 文件
  const baseCSSOptions = {
    importLoaders: 1,
    sourceMap: !config.disableCSSSourceMap,
  };
  改成
  const baseCSSOptions = {
    importLoaders: 1,
    minimize: true,
    sourceMap: !config.disableCSSSourceMap,
  };
    
-------------------------------------> OSS <------------------------------------- 
    
1、文件命名规则
  uid + name + unix + type
  uid: 用户ID，对应数据库_id，
  name: 名称，LOGO - logo, 头像 - avatar，图片 - photo，横幅 - banner
  unix: 时间戳，new Date().getTime()
  type: 文件类型，file.name.split('.')[1]
  
2、上传OSS
  handleUpload = ({ file }) => {
    this.setState({ loading: true, logourl: '' });
    let option = {
      uid: this.props.login.currentUser._id,
      category: 'avatar',
      name: file.name.split('.')[0],
      type: file.name.split('.')[1],
      unix: new Date().getTime(),
    };
    let key = option.uid + '/' + option.category + '_' + option.unix + '.' + option.type;
    this.props.dispatch({
          type: 'photo/upload',
          payload: {
            key: key,
            file: file
          },
          callback: (url) => {
            //todo
          }
        });
  };
  
3、上传进度
Ajax({
  
})
  

