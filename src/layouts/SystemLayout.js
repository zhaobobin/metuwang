import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch } from 'dva/router';
import { ContainerQuery } from 'react-container-query';
import classNames from 'classnames';
import GlobalHeader from '../components/GlobalHeader';
import SiderMenu from '../components/SiderMenu';
import {ENV, Storage} from '../utils/utils';
import NotFound from '../routes/Other/404';

const { Content } = Layout;

const query = {
  'screen-xs': {
    maxWidth: 575,
  },
  'screen-sm': {
    minWidth: 576,
    maxWidth: 767,
  },
  'screen-md': {
    minWidth: 768,
    maxWidth: 991,
  },
  'screen-lg': {
    minWidth: 992,
    maxWidth: 1199,
  },
  'screen-xl': {
    minWidth: 1200,
  },
};

@connect(state => ({
  login: state.login
}))

class SystemLayout extends React.PureComponent {

  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  componentDidMount(){
    Storage.set('metu-ajaxFlag', true);
    this.checkSession();
    window.scrollTo(0, 0);            //重置滚动位置
  }

  checkSession(){
    this.props.dispatch({
      type: 'login/session',
      payload: {},
    });
  }

  getChildContext() {
    const { location, navData, getRouteData } = this.props;
    const routeData = getRouteData('SystemLayout');
    const firstMenuData = navData.reduce((arr, current) => arr.concat(current.children), []);
    const menuData = this.getMenuData(firstMenuData, '');
    const breadcrumbNameMap = {};

    routeData.concat(menuData).forEach((item) => {
      breadcrumbNameMap[item.path] = {
        name: item.name,
        component: item.component,
      };
    });
    return { location, breadcrumbNameMap };
  }

  getPageTitle() {
    const { location, getRouteData } = this.props;
    const { pathname } = location;
    let title = ENV.appname;
    getRouteData('SystemLayout').forEach((item) => {
      if (item.path === pathname) {
        title = item.name + ' - ' + ENV.appname;
      }
    });
    return title;
  }

  getMenuData = (data, parentPath) => {
    let arr = [];
    data.forEach((item) => {
      if (item.children) {
        arr.push({ path: `${parentPath}/${item.path}`, name: item.name });
        arr = arr.concat(this.getMenuData(item.children, `${parentPath}/${item.path}`));
      }
    });
    return arr;
  };

  render() {
    const {
      collapsed, fetchingNotices, notices, getRouteData, navData, location, dispatch, login
    } = this.props;

    const layout = (
      <Layout style={{width:'100%', height:'100%', position:'fixed', left:'0',top:'0', overflow:'hidden'}}>
        <SiderMenu
          collapsed={collapsed}
          navData={navData}
          location={location}
          dispatch={dispatch}
        />
        <Layout style={{position: 'relative'}}>
          <GlobalHeader
            fetchingNotices={fetchingNotices}
            notices={notices}
            collapsed={collapsed}
            dispatch={dispatch}
          />
          <Content style={{ marginTop:'66px', padding: '24px', height: '100%', overflowX:'hidden' }}>
            <div style={{ minHeight: 'calc(100vh - 260px)' }}>
              <Switch>
                {
                  login.isAuth && login.currentUser.type === 'admin' ?
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
                  <Redirect to="/user/login" />
                }
                <Redirect exact from="/system" to="/system/home" />
                <Route component={NotFound} />
              </Switch>
            </div>
          </Content>

        </Layout>
      </Layout>
    );

    return (
      <div>
        <DocumentTitle title={this.getPageTitle()}>
          <ContainerQuery query={query}>
            {params => <div className={classNames(params)}>{layout}</div>}
          </ContainerQuery>
        </DocumentTitle>
      </div>
    );
  }
}

export default connect(state => ({
  login: state.login,
  collapsed: state.global.collapsed,
  fetchingNotices: state.global.fetchingNotices,
  notices: state.global.notices,
}))(SystemLayout);
