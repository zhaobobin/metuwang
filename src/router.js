import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import { LocaleProvider, Spin } from 'antd';
import zhCN from 'antd/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import cloneDeep from 'lodash/cloneDeep';
import { getNavData } from './common/nav';
import { getPlainNode } from './utils/utils';
import NotFound from "./routes/Other/404";

import styles from './base.less';

dynamic.setDefaultLoadingComponent(() => {
  return <Spin size="large" className={styles.globalSpin} />;
});

function getRouteData(navData, path) {
  if (!navData.some(item => item.layout === path) ||
    !(navData.filter(item => item.layout === path)[0].children)) {
    return null;
  }
  const route = cloneDeep(navData.filter(item => item.layout === path)[0]);
  return getPlainNode(route.children);
}

function getLayout(navData, path) {
  if (!navData.some(item => item.layout === path) ||
    !(navData.filter(item => item.layout === path)[0].children)) {
    return null;
  }
  const route = navData.filter(item => item.layout === path)[0];
  return {
    component: route.component,
    layout: route.layout,
    name: route.name,
    path: route.path,
  };
}

export default function RouterConfig({ history, app }) {
  const navData = getNavData(app);

  const UserLayout = getLayout(navData, 'UserLayout').component;
  const SystemLayout = getLayout(navData, 'SystemLayout').component;
  const IndexLayout = getLayout(navData, 'IndexLayout').component;

  const passProps = {
    app,
    navData,
    getRouteData: (path) => {
      return getRouteData(navData, path);
    },
  };

  return (
    <LocaleProvider locale={zhCN}>
      <Router history={history}>
        <Switch>
          <Route path="/user" render={props => <UserLayout {...props} {...passProps} />} />
          <Route path="/system" render={props => <SystemLayout {...props} {...passProps} />} />
          <Route path="/" render={props => <IndexLayout {...props} {...passProps} />} />
          <Route component={NotFound} />
        </Switch>
      </Router>
    </LocaleProvider>
  );
};
