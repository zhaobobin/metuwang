/**
 * 文章列表
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import Moment from 'moment'
import { Form, Input, Button, Icon, Row, Col, Card, InputNumber, Select, Table, Divider, DatePicker, Modal, Popconfirm, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Storage, checkRole} from '../../utils/utils';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const { Option, OptGroup } = Select;
const { RangePicker } = DatePicker;

@connect(state => ({
  login: state.login,
  article: state.article,
  category: state.category,
  photo: state.photo,
}))
@Form.create()
export default class ArticleList extends Component {

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

    loading: true,
    total: 0,
    list: '',
    hasMore: true
  };

  //初始化
  componentDidMount(){
    this.queryList();                                     //查询列表
    this.queryCateList();
  }

  //查询列表
  queryList(){
    this.props.dispatch({
      type: 'article/list',
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

  queryCateList(){
    this.props.dispatch({
      type: 'category/list',
      payload: {},
      callback: (res) => {}
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

  //按条件查询
  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields(['category', 'kw', 'date'], (err, values) => {
      if (err) return;
      let parent = '', category = '',
        list = this.props.category.list;
      for(let i in list){
        if(list[i]._id === values.category){
          if(list[i].children && list[i].children.length > 0){
            parent = list[i]._id
          }else{
            category = list[i]._id
          }
        }
      }
      let params = {
        parent: parent ? parent : undefined,
        category: category ? category : undefined,
        kw: values.kw,
        startTime: values.date ? values.date[0]._d : undefined,
        endTime: values.date ? values.date[1]._d : undefined,
      };
      this.setState({ params: params }, () => {
        this.queryList()
      });
    });
  };
  //重置查询
  handleFormReset = (e) => {
    e.preventDefault();
    this.props.form.resetFields();
    this.setState({ params: {} }, () => {
      this.queryList()
    });
  };

  add = (id) => {
    this.props.dispatch(routerRedux.push('article/add'))
  };

  update = (id) => {
    this.props.dispatch(routerRedux.push(`article/update/${id}`))
  };

  //删除
  delData = (ids, tags) => {
    if(!checkRole(this.state.role.roleid)) return;
    this.props.dispatch({
      type: 'article/del',
      payload: {
        ids: ids,
        tags: tags
      },
      callback: (res) => {
        this.refreshList(res);
        this.setState({selectedRowKeys: []})
      }
    });
  };
  del = (record) => {
    let ids = [], tags = '';
    ids.push(record._id);
    if(record.tags) tags += record.tags + ',';
    this.delData(ids, tags);
  };
  delAll = () => {
    let _this = this,
      ids = _this.state.selectedRowKeys,
      tags = this.state.tags;
    confirm({
      title: '批量删除数据?',
      okText: '确定',
      cancelText: '取消',
      content: '这将导致不可逆的结果。',
      onOk() {
        _this.delData(ids, tags);
      },
      onCancel() {},
    });
  };

  onSelectChange = (selectedRowKeys) => {
    let tags = '',
      articleList = this.props.article.list;
    for(let i in articleList){
      for(let j in selectedRowKeys){
        if(articleList[i].tags && articleList[i]._id === selectedRowKeys[j]){
          tags += articleList[i].tags + ','
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
    const { form, category } = this.props;
    const { getFieldDecorator } = form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        md: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        md: { span: 19 },
      },
    };

    const categoryOption = category.list ?
      category.list.map((topic, index) => (
        topic.haschildren ?
          <Option key={topic._id} value={topic._id}>{topic.name}</Option>
          :
          <Option key={topic._id} value={topic._id} style={{textIndent: '15px'}}>{topic.name}</Option>
      )) : '';

    const columns = [
      {
        title: '标题',
        dataIndex: 'title',
        key: 'title',
        sorter: true,
        render: (text, record) => (
          <span>{record.title}{record.focus ? <i className="red"> [焦点]</i> : null}</span>
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
            <a onClick={() => this.update(record._id)}>修改</a>
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

              <Form onSubmit={this.handleSearch}>
                <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                  <Col md={6} sm={24}>
                    <FormItem {...formItemLayout} label="分类">
                      {getFieldDecorator('category', {
                        initialValue: 0,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                        ]
                      })(
                        <Select placeholder="请选择" style={{ width: '100%' }}>
                          <Option key={0} value={0}>全部</Option>
                          {categoryOption}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <FormItem {...formItemLayout} label="关键词">
                      {getFieldDecorator('kw', {
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                        ]
                      })(
                        <Input placeholder="请输入" style={{width: '100%'}} />
                      )}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <FormItem {...formItemLayout} label="日期">
                      {getFieldDecorator('date', {})(
                        <RangePicker style={{width: '100%'}} />
                      )}
                    </FormItem>
                  </Col>
                  <Col md={6} sm={24}>
                    <FormItem>
                      <Button type="primary" htmlType="submit">查询</Button>
                      <Button style={{ marginLeft: 20 }} onClick={this.handleFormReset}>重置</Button>
                    </FormItem>
                  </Col>
                </Row>
              </Form>

              <div style={{marginBottom: '20px'}}>
                <Button icon="plus" type="primary" onClick={() => this.add()}>新建</Button>
                {
                  this.state.selectedRowKeys.length > 0 ?
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
                  selectedRowKeys: this.state.selectedRowKeys,
                  onChange: this.onSelectChange,
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
