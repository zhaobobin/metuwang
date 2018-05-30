/*
* 综合搜索
* keyword: 搜索关键词
* callback: 返回数据列表
*/
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Row, Col, Card, notification} from 'antd';
import {Storage} from '../../utils/utils';
import InfiniteScroll from 'react-infinite-scroller';			//加载更多

import styles from './SearchBar.less';

import PhotoListShow from '../Photo/PhotoListShow'

@connect(state => ({
  article: state.article,
}))
export default class SearchBar extends PureComponent {

  state = {
    keyword: this.props.keyword ? this.props.keyword : '',

    currentPage: this.props.currentPage ? this.props.currentPage : 1,					//当前页数
    itemsPerPage: this.props.itemsPerPage ? this.props.itemsPerPage : 10,			//每页数量
    initializing: 1,

    total: 0,
    list: '',
    hasMore: true
  };

  render(){

    return(

      <Row className={styles.searchBar}>

        <Col xs={0} sm={0} md={1} lg={1} />

        <Col xs={24} sm={24} md={22} lg={22}>



        </Col>

        <Col xs={0} sm={0} md={1} lg={1} />

      </Row>

    )
  }

}
