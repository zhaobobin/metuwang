/*
 * 前台 - 公共头部
 */
import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { Layout, Menu, Icon, Row, Col } from 'antd';
import logo from '../../assets/logo2.png';
import styles from './index.less';

import UserModal from './UserModal';

const { Header } = Layout;
const { SubMenu } = Menu;

export default class HeaderMenu extends PureComponent {

  state = {
    headerOpacity: styles.opacity,								//导航默认样式
    headerFixed: ''
  };

  constructor(props) {
    super(props);
    // 把一级 Layout 的 children 作为菜单项
    this.menus = [props.navData[0]].reduce((arr, current) => arr.concat(current.children), []);
    this.state = {
      openKeys: this.getDefaultCollapsedSubMenus(props),
    };
  }

  componentDidMount(){
    this.quertCateList();
    this.hashChange();
    window.addEventListener('scroll', this.handleScroll.bind(this));
    window.addEventListener('hashchange', this.hashChange.bind(this));
  }

  quertCateList(){
    this.props.dispatch({
      type: 'category/list',
      payload: {},
      callback: (res) => {}
    });
  }

  //路由变化
  hashChange(){
    window.scrollTo(0, 0);                                  //重置滚动
    let path = this.props.location.pathname.split('/')[1];
    if(path === 'index' || path === 'u'){
      this.setState({headerOpacity: styles.opacity});
    }else{
      this.setState({headerOpacity: ''})
    }
  }

  //监控滚动
  handleScroll(){
    let top = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
    if(top > 0){
      this.setState({headerFixed: styles.fixed})
    }else{
      this.setState({headerFixed: ''})
    }
  }

  getDefaultCollapsedSubMenus(props) {
    const currentMenuSelectedKeys = [...this.getCurrentMenuSelectedKeys(props)];
    currentMenuSelectedKeys.splice(-1, 1);
    if (currentMenuSelectedKeys.length === 0) {
      return ['dashboard'];
    }
    return currentMenuSelectedKeys;
  }
  getCurrentMenuSelectedKeys(props) {
    const { location: { pathname } } = props || this.props;
    const keys = pathname.split('/').slice(1);
    if (keys.length === 1 && keys[0] === '') {
      return [this.menus[0].key];
    }
    return keys;
  }
  getNavMenuItems(menusData, parentPath = '') {
    if (!menusData) {
      return [];
    }
    return menusData.map((item) => {
      if (!item.name || item.isHide) {
        return null;
      }
      let itemPath;
      if (item.path.indexOf('http') === 0) {
        itemPath = item.path;
      } else {
        itemPath = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
      }
      if (item.children && item.children.some(child => child.name && !child.isHide)) {
        return (
          <SubMenu
            title={
              item.icon ? (
                <span>
                  <Icon type={item.icon} />
                  <span>{item.name}</span>
                </span>
              ) : item.name
            }
            key={item.key || item.path}
          >
            {this.getNavMenuItems(item.children, itemPath)}
          </SubMenu>
        );
      }
      const icon = item.icon && <Icon type={item.icon} />;
      return (
        <Menu.Item key={item.key || item.path}>
          {
            /^https?:\/\//.test(itemPath) ? (
              <a href={itemPath} target={item.target}>
                {icon}<span>{item.name}</span>
              </a>
            ) : (
              <Link
                to={itemPath}
                target={item.target}
                replace={itemPath === this.props.location.pathname}
              >
                {icon}<span>{item.name}</span>
              </Link>
            )
          }
        </Menu.Item>
      );
    });
  }
  handleOpenChange = (openKeys) => {
    const lastOpenKey = openKeys[openKeys.length - 1];
    const isMainMenu = this.menus.some(
      item => lastOpenKey && (item.key === lastOpenKey || item.path === lastOpenKey)
    );
    this.setState({
      openKeys: isMainMenu ? [lastOpenKey] : [...openKeys],
    });
  };

  render() {
    const { collapsed } = this.props;

    // Don't show popup menu when it is been collapsed
    const menuProps = collapsed ? {} : {
      openKeys: this.state.openKeys,
    };
    //console.log(menuProps)
    return (
      <Header className={styles.header+" "+this.state.headerFixed+" "+this.state.headerOpacity}>
        <Row>
          <Col xs={24} sm={24} md={3} lg={3}>
            {/* 移动端导航 */}
            <Row>
              <Col xs={3} sm={2} md={0} lg={0}>
                <a className="min-header-icon" href="javascript:history.go(-1)"><Icon type="left" /></a>
              </Col>
              <Col xs={18} sm={20} md={24} lg={24} className="min-header-title">
                <div className={styles.logo}>
                  <Link to="/"><img src={logo} alt="logo" /></Link>
                </div>
              </Col>
              <Col xs={3} sm={2} md={0} lg={0}>
                <a className="min-header-icon"><Icon type="user" /></a>
              </Col>
            </Row>
            {/* 移动端导航 end */}
          </Col>
          <Col xs={0} sm={0} md={13} lg={13}>
            <div className={styles.menu}>
              <Menu
                theme="dark"
                mode="horizontal"
                {...menuProps}
                onOpenChange={this.handleOpenChange}
                selectedKeys={this.getCurrentMenuSelectedKeys()}
              >
                {this.getNavMenuItems(this.menus)}
              </Menu>
            </div>
          </Col>
          <Col xs={0} sm={0} md={8} lg={8}>
            <UserModal/>
          </Col>
        </Row>

      </Header>
    );

  }
}
