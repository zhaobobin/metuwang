import React from 'react';
import PropTypes from 'prop-types';
import { Link, Route, Redirect, Switch } from 'dva/router';
import DocumentTitle from 'react-document-title';
import { Icon } from 'antd';
//import GlobalFooter from '../components/GlobalFooter';
import {ENV, Storage} from '../utils/utils';

import logo from '../assets/logo.png';
import styles from './UserLayout.less';
import NotFound from "../routes/Other/404";

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

export default class UserLayout extends React.PureComponent {

  static childContextTypes = {
    location: PropTypes.object,
  };

  componentDidMount(){
    Storage.set('metu-ajaxFlag', true);
  }

  getChildContext() {
    const { location } = this.props;
    return { location };
  }
  getPageTitle() {
    const { getRouteData, location } = this.props;
    const { pathname } = location;
    let title = ENV.appname;
    // getRouteData('UserLayout').forEach((item) => {
    //   if (item.path === pathname) {
    //     title = item.name + ' - ' + ENV.sitename;
    //   }
    // });
    return title;
  }
  render() {

    const { getRouteData } = this.props;

    return (
      <DocumentTitle title={this.getPageTitle()}>
        <div className={styles.container}>
          <div className={styles.top}>
            <div className={styles.header}>
              <Link to="/">
                <img alt="logo" className={styles.logo} src={logo} />
                <span className={styles.title}>{ENV.appname}</span>
              </Link>
            </div>
          </div>
          <Switch>
            {
              getRouteData('UserLayout').map(item =>
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
            <Redirect exact from="/user" to="/user/login" />
            <Route component={NotFound} />
          </Switch>
          {/*<GlobalFooter className={styles.footer} links={links} copyright={ENV.copyright} />*/}
        </div>
      </DocumentTitle>
    );
  }
};
