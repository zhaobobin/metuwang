/**
 * 标签管理
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Card, InputNumber, Table, Divider, Modal, Popconfirm, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Storage, checkRole} from '../../utils/utils';

const FormItem = Form.Item;
const confirm = Modal.confirm;

const keys1 = ['add_name', 'add_views'];
const keys2 = ['update_name', 'update_views'];

@connect(state => ({
  login: state.login,
  tags: state.tags,
}))
@Form.create()
export default class Tags extends Component {

  state = {
    role: this.props.login.currentUser.role,
    sort: '',                                       //列表排序参数
    currentPage: 1,
    pageSize: Storage.get('metu-pageSize') ? Storage.get('metu-pageSize') : 10,
    selectedRowKeys: [],
    modalAddVisible: false,
    modalUpdateVisible: false,
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
  }

  //查询列表
  queryList(){
    this.props.dispatch({
      type: 'tags/list',
      payload: {
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

  //新建模型Modal
  handleModalAddVisible = (flag) => {
    this.props.form.resetFields(keys1);
    this.setState({modalAddVisible: !!flag});
  };
  handleModalAddSubmit = (e) => {
    e.preventDefault();

    if(!checkRole(this.state.role.roleid)) return;
    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys1, (err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'tags/add',
        payload: {
          name: values.add_name,
          views: values.add_views,
        },
        callback: (res) => {
          setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
          this.refreshList(res);
          if(res.status === 1) this.handleModalAddVisible();
        }
      });
    });
  };

  //修改角色Modal
  handleModalUpdateVisible = (flag) => {
    this.props.form.resetFields(keys2);
    this.setState({modalUpdateVisible: !!flag});
  };
  update = (record) => {
    this.setState({
      modalUpdateVisible: true,
      detail: record
    });
  };
  handleModalUpdateSubmit = (e) => {
    e.preventDefault();

    if(!checkRole(this.state.role.roleid)) return;
    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys2, (err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'tags/update',
        payload: {
          _id: this.state.detail._id,
          name: values.update_name,
          views: values.update_views,
        },
        callback: (res) => {
          setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
          this.refreshList(res);
          if(res.status === 1) this.handleModalUpdateVisible();
        }
      });
    });
  };

  //删除
  delData = (ids) => {
    if(!checkRole(this.state.role.roleid)) return;
    this.props.dispatch({
      type: 'tags/del',
      payload: {ids: ids},
      callback: (res) => {
        this.refreshList(res);
        this.setState({selectedRowKeys: []})
      }
    });
  };
  del = (record) => {
    let ids = [];
    ids.push(record._id);
    this.delData(ids);
  };
  delAll = () => {
    let _this = this;
    confirm({
      title: '批量删除数据?',
      okText: '确定',
      cancelText: '取消',
      content: '这将导致不可逆的结果。',
      onOk() {
        _this.delData(_this.state.selectedRowKeys);
      },
      onCancel() {},
    });
  };
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
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

    const { loading, list, total, detail } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;

    const columns = [
      {
        title: 'id',
        dataIndex: '_id',
        key: '_id',
        sorter: true,
      },
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
      },
      {
        title: '信息总数',
        dataIndex: 'articles',
        key: 'articles',
        sorter: true,
        render: (text, record) => (
          <span>{record.articles.length}</span>
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
        title: '操作',
        render: (text, record) => (
          <span>
            <a onClick={() => this.update(record)}>修改</a>
            {record.articles.length > 0 ? '' : <Divider type="vertical" />}
            {
              record.articles.length > 0 ? '' :
              <Popconfirm title="确定删除该数据？" onConfirm={() => this.del(record)}>
                <a>删除</a>
              </Popconfirm>
            }
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
                <Button icon="plus" type="primary" onClick={() => this.handleModalAddVisible(true)}>新建</Button>
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
                  getCheckboxProps: record => ({
                    disabled: record.articles.length > 0,
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

        <Modal
          title='新建标签'
          visible={this.state.modalAddVisible}
          onOk={this.handleModalAddSubmit}
          onCancel={() => this.handleModalAddVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="名称">
              {getFieldDecorator('add_name', {
                rules: [
                  { required: true, message: '标签名称不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入标签名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="访问量">
              {getFieldDecorator('add_views', {
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <InputNumber placeholder="请输入数值" style={{ width: '100%' }} min={0} />
              )}
            </FormItem>
          </Form>
        </Modal>

        {
          detail ?
            <Modal
              title='修改标签'
              visible={this.state.modalUpdateVisible}
              onOk={this.handleModalUpdateSubmit}
              onCancel={() => this.handleModalUpdateVisible()}
            >
              <Form>
                <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="名称">
                  {getFieldDecorator('update_name', {
                    initialValue: detail.name,
                    rules: [
                      { required: true, message: '标签名称不能为空！' },
                      { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                    ]
                  })(
                    <Input placeholder="输入标签名称" />
                  )}
                </FormItem>
                <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="访问量">
                  {getFieldDecorator('update_description', {
                    initialValue: detail.views,
                    rules: [
                      { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                    ]
                  })(
                    <InputNumber placeholder="请输入数值" style={{ width: '100%' }} min={0} />
                  )}
                </FormItem>
              </Form>
            </Modal>
            : null
        }

      </PageHeaderLayout>
    )
  }

}
