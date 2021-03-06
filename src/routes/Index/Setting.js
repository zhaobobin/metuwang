import React, { PureComponent } from 'react';
import { Redirect } from 'dva/router';
import { connect } from 'dva';
import { Row, Col, Tabs } from 'antd';
import {ENV} from '../../utils/utils';
import styles from './Setting.less';

const TabPane = Tabs.TabPane;

import UserInfoSetting from '../../components/User/UserInfoSetting'

@connect(state => ({
  login: state.login
}))
export default class Setting extends PureComponent {

  state = {
    tabKey: '1'
  };

  componentDidMount(){
    document.title = '用户信息 - 设置' + " - " + ENV.appname;
  }

  handleTab = (key) => {
    switch(key){
      case "1":
        document.title = '用户信息 - 设置' + " - " + ENV.appname;
        break;
      case "2":
        document.title = '账户安全 - 设置' + " - " + ENV.appname;
        break;
      case "3":
        document.title = '个人偏好 - 设置' + " - " + ENV.appname;
        break;
      case "4":
        document.title = '社交账号 - 设置' + " - " + ENV.appname;
        break;
    }
    this.setState({tabKey: key})
    //this.forceUpdate();                             //更新当前视图
  };

  render(){

    const tabKey = this.state.tabKey;

    const {isAuth} = this.props.login;

    return(
      <div className={styles.setting}>
        {
          isAuth ?
            <Tabs defaultActiveKey={tabKey}
                  animated={false}
                  onChange={this.handleTab}
            >
              <TabPane tab="用户信息" key="1">
                <UserInfoSetting/>
              </TabPane>
              <TabPane tab="账户安全" key="2">基本信息</TabPane>
              <TabPane tab="个人偏好" key="3">基本信息</TabPane>
              <TabPane tab="社交账号" key="4">基本信息</TabPane>
            </Tabs>
            :
            <Redirect to="/" />
        }
      </div>
    )
  }

}
