import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Tabs } from 'antd';
import { ENV, Storage } from '../../utils/utils';
import styles from './UserCenter.less';

import UserCenterBanner from '../../components/User/UserCenterBanner';
import PhotoListShow from '../../components/Photo/PhotoListShow';
import PhotoListQuery from '../../components/Photo/PhotoListQuery';
import AlbumListQuery from '../../components/Photo/AlbumListQuery';
import ArticleListQuery from '../../components/Article/ArticleListQuery'
import UserAbout from '../../components/User/UserAbout'

const TabPane = Tabs.TabPane;

@connect(state => ({
  login: state.login,
  user: state.user
}))

export default class UserCenter extends PureComponent {

  state = {
    username: this.props.match.params.username,
    detail: '',
    tabKey: Storage.get('metu-UserCenterKey') ? Storage.get('metu-UserCenterKey') : '1'
  };

  componentDidMount(){
    let username = this.props.match.params.username;
    this.queryUserDetail(username);
    document.title = '照片 - 用户中心' + " - " + ENV.appname;
  }

  queryUserDetail(username){
    this.props.dispatch({
      type: 'user/detail',
      payload: {
        username: username
      },
      callback: (res) => {
        if(res.status === 1){
          this.setState({detail: res.data})
        }
      }
    });
  }

  handleTab = (key) => {
    switch(key){
      case "1":
        document.title = '照片 - 用户中心' + " - " + ENV.appname;
        break;
      case "2":
        document.title = '相册 - 用户中心' + " - " + ENV.appname;
        break;
      case "3":
        document.title = '文章 - 用户中心' + " - " + ENV.appname;
        break;
      case "4":
        document.title = '喜欢 - 用户中心' + " - " + ENV.appname;
        break;
      case "5":
        document.title = '收藏 - 用户中心' + " - " + ENV.appname;
        break;
      case "6":
        document.title = '关于 - 用户中心' + " - " + ENV.appname;
        break;
    }
    Storage.set('metu-UserCenterKey', key);
    this.setState({tabKey: key})
    //this.forceUpdate();                             //更新当前视图
  };

  render(){

    const {tabKey, detail} = this.state;

    return(

      <div className={styles.userCenter}>

        {detail ? <UserCenterBanner detail={detail} /> : null}

        <Tabs defaultActiveKey={tabKey}
          animated={false}
          onChange={this.handleTab}
        >

          <TabPane tab="照片" key="1">
            {tabKey === '1' && detail ? <PhotoListQuery uid={detail._id}/> : null}
          </TabPane>

          <TabPane tab="相册" key="2">
            {tabKey === '2' && detail ? <AlbumListQuery uid={detail._id}/> : null}
          </TabPane>

          <TabPane tab="文章" key="3">
            <Row>
              <Col xs={0} sm={0} md={3} lg={5} />
              <Col xs={24} sm={24} md={18} lg={14}>
                {tabKey === '3' && detail ?
                  <Card bordered={true}>
                    <ArticleListQuery uid={detail._id}/>
                  </Card>
                  : null
                }
              </Col>
              <Col xs={0} sm={0} md={3} lg={5} />
            </Row>
          </TabPane>

          <TabPane tab="喜欢" key="4">
            {tabKey === '4' && detail ? <PhotoListShow data={detail.like} type="album" /> : null}
          </TabPane>

          <TabPane tab="收藏" key="5">
            {tabKey === '5' && detail ? <PhotoListShow data={detail.collect} type="album" /> : null}
          </TabPane>

          <TabPane tab="关于" key="6">
            <Row>
              <Col xs={0} sm={0} md={3} lg={5} />
              <Col xs={24} sm={24} md={18} lg={14}>
                {tabKey === '6' && detail ?
                  <Card bordered={true}>
                    <UserAbout detail={detail} />
                  </Card>
                  : null
                }
              </Col>
              <Col xs={0} sm={0} md={3} lg={5} />
            </Row>
          </TabPane>

        </Tabs>

      </div>

    )
  }

}
