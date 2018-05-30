import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Layout, Menu, Icon, Spin, Tag, Dropdown, Avatar, Modal, message } from 'antd';
import Debounce from 'lodash-decorators/debounce';
import { ENV } from '../../utils/utils';
import styles from './index.less';

const { Header } = Layout;
const confirm = Modal.confirm;

@connect(state => ({
  login: state.login
}))
export default class GlobalHeader extends PureComponent {

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  logout(){
    let _this = this;
    confirm({
      title: '退出登录?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        _this.props.dispatch({
          type: 'login/logout',
        });
      },
      onCancel() {},
    });
  };

  toggle = () => {
    const { collapsed } = this.props;
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: !collapsed,
    });
    this.triggerResizeEvent();
  };
  @Debounce(600)
  triggerResizeEvent() { // eslint-disable-line
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }

  render() {

    const {collapsed, login} = this.props;

    const menu = (
      <Menu className={styles.menu}>
        <Menu.Item key="center"><a href="#/center"><Icon type="user" />个人中心</a></Menu.Item>
        <Menu.Item key="setting"><a href="#/setting/config"><Icon type="setting" />系统设置</a></Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout"><a onClick={() => this.logout()}><Icon type="logout" />退出登录</a></Menu.Item>
      </Menu>
    );

    return (
      <div>
        <Header className={styles.header}>
          <Icon
            className={styles.trigger}
            type={collapsed ? 'menu-unfold' : 'menu-fold'}
            onClick={this.toggle}
          />
          <div className={styles.right}>
            <span className={styles.action}><a href={ENV.sitelink} target="_blank">前台首页</a></span>
            {
              login.isAuth ?
              (
                <Dropdown overlay={menu}>
                <span className={`${styles.action} ${styles.account}`}>
                  {
                    login.currentUser.avatar ?
                      <Avatar size="small" className={styles.avatar} src={login.currentUser.avatar+'?x-oss-process=style/thumb_s'} />
                      :
                      <Icon type="user"/>
                  }
                  {login.currentUser.username}
                </span>
                </Dropdown>
              )
              :
              <Spin size="small" style={{ marginLeft: 8 }} />
            }
          </div>
        </Header>
      </div>
    )

  }
}
