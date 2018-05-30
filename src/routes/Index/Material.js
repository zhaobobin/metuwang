/*
 * 图片素材
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Row, Col, Icon, Spin, notification} from 'antd';
import Moment from 'moment';
import {ENV, Storage} from "../../utils/utils";

import styles from './Material.less';

@connect(state => ({
  login: state.login,
}))
export default class Material extends PureComponent {

  state = {
    list: '',
  };

  //检查登录状态
  checkLogin = () => {
    let {isAuth} = this.props.login;
    if(!isAuth){
      this.props.dispatch({
        type: 'login/changeModal',
        payload: {
          modalVisible: true,
          tabKey: '1',
        }
      });
      Storage.set('metu-ajaxFlag', true);
      return false;
    }
    return true;
  };

  render(){

    return(
      <div className={styles.material}>

        素材

      </div>
    )

  }

}
