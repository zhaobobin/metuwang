/*
 * 相册列表 - 无限加载查询
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Row, Col, notification} from 'antd';
import {Storage} from '../../utils/utils';
import InfiniteScroll from 'react-infinite-scroller';			//加载更多

import PhotoListShow from '../../components/Photo/PhotoListShow';

@connect(state => ({
  article: state.article
}))
export default class AlbumListQuery extends PureComponent {

  state = {

    modelType: 'photo',
    category: this.props.category ? this.props.category : '',
    tag: this.props.tag ? this.props.tag : '',
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
    this.queryPhotoList({
      modelType: 'photo',
      category: this.state.category,
      tag: this.state.tag,
      uid: this.state.uid,
    })
  }

  componentWillReceiveProps(nextProps){

    if(nextProps.category !== this.state.category) {
      this.queryPhotoList({
        modelType: 'photo',
        category: nextProps.category ? nextProps.category : '',
        tag: nextProps.tag ? nextProps.tag : '',
        uid: nextProps.uid ? nextProps.uid : '',
      });
    }
  }

  queryPhotoList(params){
    this.props.dispatch({
      type: 'article/list',
      payload: {
        params: params,
        currentPage: this.state.currentPage,
        pageSize: this.state.itemsPerPage
      },
      callback: (res) => {
        Storage.set('metu-ajaxFlag', true);
        if(res.status === 1){
          this.setState({
            ...params,
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
              <PhotoListShow data={list} type="album" />
            </InfiniteScroll>
            :
            null
        }
      </div>
    )
  }

}
