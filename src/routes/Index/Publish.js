/**
 * 发布
 */
import React, { PureComponent } from 'react';
import { Redirect } from 'dva/router';
import { connect } from 'dva';
import { Card } from 'antd';
import Editor from '../../components/Article/Editor';
import styles from './Publish.less';

@connect(state => ({
  login: state.login
}))
export default class Publish extends PureComponent {

  render(){

    const { login } = this.props;

    return(
      <div className={styles.publish}>
        {
          login.isAuth ?
            <Editor type={this.props.match.params.type}/>
            :
            <Redirect to="/" />
        }
      </div>
    )
  }

}
