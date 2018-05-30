/**
 * 图片附件 OSS对象存储相关操作
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import Moment from 'moment'
import { Form, Input, Button, Icon, Row, Col, Card, InputNumber, Select, Table, Divider, Modal, Popconfirm, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Storage, checkRole} from '../../utils/utils';
import UploadPhotoList from '../../components/FormTool/UploadPhotoList';

const confirm = Modal.confirm;

@connect(state => ({
  login: state.login,
  photo: state.photo,
  oss: state.oss,
}))
@Form.create()
export default class PhotoList extends Component {

  state = {
    role: this.props.login.currentUser.role,
    params: {},
    sort: '',                                       //列表排序参数
    currentPage: 1,
    pageSize: Storage.get('metu-pageSize') ? Storage.get('metu-pageSize') : 10,
    selectedRowKeys: [],
    tags: '',
    detail: {
      name: '',
      description: '',
    },
    modalVisible: false,

    loading: true,
    total: 0,
    list: '',
    hasMore: true
  };

  //初始化
  componentDidMount(){
    this.queryList();                                     //查询列表
  }

  //查询列表
  queryList(){
    this.props.dispatch({
      type: 'photo/list',
      payload: {
        params: this.state.params,
        sort: this.state.sort,
        currentPage: this.state.currentPage,
        pageSize: this.state.pageSize
      },
      callback: (res) => {
        if(res.status === 1){
          this.setState({
            loading: false,
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

  //刷新列表
  refreshList(res){
    if(res.status === 1){
      this.queryList();
      notification.success({ message: res.msg });
    }else{
      notification.error({ message: res.msg });
    }
  }

  update = (photo) => {
    this.setState({
      detail: photo,
      modalVisible: true
    })
  };

  //删除
  delData = (ids, tags, keys) => {
    if(!checkRole(this.state.role.roleid)) return;
    this.props.dispatch({
      type: 'photo/del',
      payload: {
        ids: ids,
        tags: tags
      },
      callback: (res) => {
        this.refreshList(res);
        this.delOssList(keys);
        this.setState({selectedRowKeys: []});
      }
    });
  };
  del = (record) => {
    if(record.article.length > 0){
      notification.error({ message: '禁止删除被文章调用的图片！' });
      return false;
    }
    let ids = [], tags = '', keys = [];
    ids.push(record._id);
    keys.push(record.key);
    if(record.tags) tags += record.tags + ',';
    this.delData(ids, tags, keys);
  };
  delAll = () => {
    let _this = this,
      ids = _this.state.selectedRowKeys,
      tags = this.state.tags,
      list = this.props.photo.list,
      keys = [];
    for(let i in list){
      for(let j in ids){
        if(list[i]._id === ids[j]) keys.push(list[i].key);
      }
    }
    confirm({
      title: '批量删除数据?',
      okText: '确定',
      cancelText: '取消',
      content: '这将导致不可逆的结果。',
      onOk() {
        _this.delData(ids, tags, keys);
      },
      onCancel() {},
    });
  };

  //删除ossList
  delOssList(keys){
    this.props.dispatch({
      type: 'oss/del',
      payload: { keys: keys },
      callback: function(res){}
    });
  }

  onSelectChange = (selectedRowKeys) => {
    let tags = '',
      photoList = this.props.photo.list;
    for(let i in photoList){
      for(let j in selectedRowKeys){
        if(photoList[i].tags && photoList[i]._id === selectedRowKeys[j]){
          tags += photoList[i].tags + ','
        }
      }
    }
    this.setState({ selectedRowKeys, tags });
  };

  //表格分页
  handleTableChange = (pagination, filters, sorter) => {
    let sort = '';
    if(sorter.field){                           //排序
      sort = {};
      sort[sorter.field] = sorter.order === 'ascend' ? 1 : -1
    }
    Storage.set('metu-pageSize', pagination.pageSize);
    this.setState({
      sort: sort,
      currentPage: pagination.current,
      pageSize: pagination.pageSize
    }, function(){
      this.queryList()
    })
  };

  render(){

    const {loading, list, total} = this.state;
    const { selectedRowKeys } = this.state;
    //console.log(list)
    const columns = [
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        sorter: true,
        width: 200,
        render: (text, record) => (
          <span>{record.title}{record.focus ? <i className="red"> [焦点]</i> : null}</span>
        ),
      },
      {
        title: '附件',
        dataIndex: 'url',
        key: 'url',
        render: (url) => (
          <span><img src={url + '?x-oss-process=style/thumb_s'} width="60" height="60"/></span>
        ),
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
      },
      {
        title: '发布人',
        dataIndex: 'uid',
        key: 'uid',
        sorter: true,
        render: (text, record) => (
          <span>{record.uid.nickname}</span>
        ),
      },
      {
        title: '访问量',
        dataIndex: 'views',
        key: 'views',
        sorter: true,
        render: (views) => (
          <span>{views ? views : 0}</span>
        ),
      },
      {
        title: '文章数',
        dataIndex: 'article',
        key: 'article',
        sorter: true,
        render: (article) => (
          <span>{article.length}</span>
        ),
      },
      {
        title: '发布时间',
        dataIndex: 'createtime',
        key: 'createtime',
        sorter: true,
        render: (createtime) => (
          <span>{Moment(createtime).format('YYYY-MM-DD hh:mm:ss')}</span>
        ),
      },
      {
        title: '更新时间',
        dataIndex: 'updatetime',
        key: 'updatetime',
        sorter: true,
        render: (updatetime) => (
          <span>{Moment(updatetime).format('YYYY-MM-DD hh:mm:ss')}</span>
        ),
      },
      {
        title: '操作',
        render: (text, record) => (
          <span>
            <a onClick={() => this.update(record)}>修改</a>
            <Divider type="vertical" />
            <Popconfirm title="确定删除该数据？" onConfirm={() => this.del(record)}>
              <a>删除</a>
            </Popconfirm>
          </span>
        ),
      }
    ];

    return(
      <PageHeaderLayout>

        {
          list ?
            <Card>

              <div style={{marginBottom: '20px'}}>
                <UploadPhotoList btnText="新建" />
                {
                  selectedRowKeys.length > 0 ?
                    <Button style={{marginLeft: '10px'}} onClick={() => this.delAll()}>批量删除</Button>
                    : ''
                }
              </div>

              <Table
                rowKey='_id'
                loading={loading}
                columns={columns}
                dataSource={list}
                onChange={this.handleTableChange}
                rowSelection={{
                  selectedRowKeys: selectedRowKeys,
                  onChange: this.onSelectChange,
                  getCheckboxProps: record => ({
                    disabled: record.article.length > 0
                  })
                }}
                pagination={{
                  total: total,
                  current: this.state.currentPage,
                  pageSize: this.state.pageSize,
                  showSizeChanger: true,
                }}
              />

            </Card>
            : null
        }

      </PageHeaderLayout>
    )
  }

}
