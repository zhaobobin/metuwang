import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Icon } from 'antd';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Route, Redirect, Switch } from 'dva/router';
import { ContainerQuery } from 'react-container-query';

import classNames from 'classnames';
import HeaderMenu from '../components/HeaderMenu';
import GlobalFooter from '../components/GlobalFooter';
import {ENV, goBack, Storage} from '../utils/utils';
import styles from './IndexLayout.less';
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

const links = [{
  title: '帮助',
  href: '',
}, {
  title: '隐私',
  href: '',
}, {
  title: '条款',
  href: '',
}];

@connect(state => ({
  login: state.login
}))

export default class IndexLayout extends React.PureComponent {

  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

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
    let path = '/' + pathname.split('/')[1];
    let title = ENV.appname;
    getRouteData('IndexLayout').forEach((item) => {
      if (item.path !== '/index' && item.path === path) {
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
// console.log(navData)
// console.log(getRouteData('IndexLayout'))
    const layout = (
      <Layout>
        <HeaderMenu
          collapsed={collapsed}
          navData={navData}
          location={location}
          dispatch={dispatch}
        />
        <Content className={styles.content}>
          <div style={{ minHeight: 'calc(100vh - 260px)' }}>
            <Switch>
              {
                getRouteData('IndexLayout').map(item =>
                  (
                    <Route
                      exact={item.exact}
                      key={item.path}
                      path={item.path}
                      component={item.component}
                    />
                  )
                )
              }
              <Redirect exact from="/" to="/index" />
              <Redirect exact from="/equipments" to="/equipments/export" />
              <Route component={NotFound} />
            </Switch>
          </div>
        </Content>
        <GlobalFooter className={styles.footer} links={links} copyright={ENV.copyright} />
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
};
