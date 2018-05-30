import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Spin } from 'antd';

import styles from './PhotoWelcome.less';

@connect(state => ({
  article: state.article
}))
export default class PhotoWelcome extends PureComponent {

  state = {
    loading: true
  };

  componentDidMount(){
    this.queryPhotoWel();
  }

  queryPhotoWel(){
    this.props.dispatch({
      type: 'article/welcome',
      payload: {}
    });
  }

  //加载优化、img下载完成后再渲染组件
  loaded = () => {
    this.setState({loading: false})
  };

  render(){

    const Data = this.props.article.welcome;
    const bgImg = Data ?
      {
        backgroundImage: 'url(' + Data.thumb + '?x-oss-process=style/cover)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundSize: '100% auto'
      } : {};

    return(

      <div className={styles.photoWel} style={bgImg}>
        {
          Data ?
            <div className={styles.item}>
              <img className={styles.hidden} src={Data.thumb} onLoad={this.loaded} />
              <Spin className={styles.loading} spinning={this.state.loading} delay={300} size="large" />
              <p className={styles.info}>
                <Link to={`/album/${Data._id}/${Data.title}-by-${Data.uid.nickname}`}>{Data.title}</Link>
                <span>by</span>
                <Link to={`/u/${Data.uid.username}`}>{Data.uid.nickname}</Link>
              </p>
            </div>
            :
            null
        }
      </div>

    )
  }

}
