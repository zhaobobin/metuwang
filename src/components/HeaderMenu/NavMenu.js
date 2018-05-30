/*
 * 导航菜单
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Menu } from 'antd';
import styles from './index.less';

@connect(state => ({
  category: state.category
}))
export default class NavMenu extends PureComponent {

  constructor(props) {
    super(props);
    // 把一级 Layout 的 children 作为菜单项
    this.menus = this.props.category.tree;
    this.state = {
      tree: this.props.category.tree,
      openKeys: this.getDefaultCollapsedSubMenus(props),
    };
  }

  componentDidMount(){
    this.props.dispatch({
      type: 'category/list',
      payload: {},
      callback: (res) => {
        console.log(res)
      }
    });
  }

  getDefaultCollapsedSubMenus(props) {

  }
  getCurrentMenuSelectedKeys(){

    console.log(this.state.tree)
  };

  render(){

    const {tree} = this.props.category;

    const Nav = tree.length > 0 ?
      tree.map((item, index) => (
        <Menu.Item key={item.catedir}>
          <Link to={`/${item.catedir}`}>{item.name}</Link>
        </Menu.Item>
      ))
      : null;

    return(
      <div className={styles.menu}>
        <Menu
          theme="dark"
          mode="horizontal"
          style={{background: 'none', border: 'none'}}
          selectedKeys={this.getCurrentMenuSelectedKeys()}
        >
          <Menu.Item key="index">
            <Link to="/index">首页</Link>
          </Menu.Item>

          {Nav}

        </Menu>
      </div>
    )

  }

}
