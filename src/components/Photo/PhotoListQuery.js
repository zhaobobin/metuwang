/*
 * 图片列表 - 对应oss存储，无限加载查询
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Row, Col, notification} from 'antd';
import {Storage} from '../../utils/utils';
import PhotoListShow from '../../components/Photo/PhotoListShow';

import InfiniteScroll from 'react-infinite-scroller';			//加载更多

@connect(state => ({
  photo: state.photo
}))
export default class PhotoListQuery extends PureComponent {

  state = {
    modelType: 'photo',

    uid: this.props.uid ? this.props.uid : '',								                //用户id
    currentPage: this.props.currentPage ? this.props.currentPage : 1,					//当前页数
    itemsPerPage: this.props.itemsPerPage ? this.props.itemsPerPage : 10,			//每页数量
    initializing: 1,

    total: 0,
    list: '',
    hasMore: true
  };

  componentDidMount(){
    Storage.set('metu-ajaxFlag', true);
    this.queryPhotoList()
  }

  queryPhotoList(){
    this.props.dispatch({
      type: 'photo/list',
      payload: {
        params: {
          modelType: this.state.modelType,
          uid: this.state.uid
        },
        currentPage: this.state.currentPage,
        pageSize: this.state.itemsPerPage
      },
      callback: (res) => {
        Storage.set('metu-ajaxFlag', true);
        if(res.status === 1){
          this.setState({
            total: res.total,
            list: res.data,
            hasMore: res.hasMore
          })
        }else{
          notification.error({message: '提示', description: res.msg});
        }
      }
    });
  }

  //加载更多
  LoadMore = (page) => {
    if(!page) return;
    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);
    let _this = this;
    setTimeout(function(){
      _this.queryPhotoList();
    }, 200)
  };

  render(){

    const { list, hasMore } = this.state;

    return(
      <div className="photo-container">
        {
          list ?
            <InfiniteScroll
              pageStart={0}
              initialLoad={false}
              loadMore={this.LoadMore}
              hasMore={hasMore}
            >
              <PhotoListShow data={list} type="photo" />
            </InfiniteScroll>
            :
            null
        }
      </div>
    )
  }

}
