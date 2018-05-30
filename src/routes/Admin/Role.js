/**
 * 角色管理
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Card, InputNumber, Table, Divider, Modal, Popconfirm, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Storage, checkRole} from '../../utils/utils';

const FormItem = Form.Item;
const confirm = Modal.confirm;

@connect(state => ({
  login: state.login,
  role: state.role,
}))
@Form.create()
export default class Role extends Component {

  state = {
    role: this.props.login.currentUser.role,
    sort: '',                                       //列表排序参数
    currentPage: 1,
    pageSize: Storage.get('metu-pageSize') ? Storage.get('metu-pageSize') : 10,
    selectedRowKeys: [],
    modalAddVisible: false,
    modalUpdateVisible: false,
    detail: {
      rolename: '',
      roleid: '',
      description: '',
    },
  };

  //初始化
  componentDidMount(){
    this.queryList();                                     //查询列表
  }

  //查询列表
  queryList(){
    this.props.dispatch({
      type: 'role/list',
      payload: {
        sort: this.state.sort,
        currentPage: this.state.currentPage,
        pageSize: this.state.pageSize
      },
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

  //新建角色Modal
  handleModalAddVisible = (flag) => {
    this.props.form.resetFields(['add_rolename', 'add_roleid', 'add_description']);
    this.setState({modalAddVisible: !!flag});
  };
  handleModalAddSubmit = (e) => {
    e.preventDefault();

    if(!checkRole(this.state.role.roleid)) return;
    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(['add_rolename', 'add_roleid', 'add_description'], (err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'role/add',
        payload: {
          rolename: values.add_rolename,
          roleid: values.add_roleid,
          description: values.add_description,
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
    this.props.form.resetFields(['update_rolename', 'update_roleid', 'update_description']);
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

    this.props.form.validateFields(['update_rolename', 'update_roleid', 'update_description'], (err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'role/update',
        payload: {
          _id: this.state.detail._id,
          rolename: values.update_rolename,
          roleid: values.update_roleid,
          description: values.update_description,
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
      type: 'role/del',
      payload: {ids: ids},
      callback: (res) => {
        this.refreshList(res);
        this.setState({selectedRowKeys: []})
      }
    });
  };
  del = (record) => {
    if(record.roleid === 9){
      notification.error({ message: '禁止删除最高级管理！' });
      return false;
    }
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

    const { form, role } = this.props;
    const { detail } = this.state;
    const { getFieldDecorator } = form;

    const loading = role.loading;
    const list = role.list;
    const total = role.total;

    const columns = [
      {
        title: '_id',
        dataIndex: '_id',
        key: (_id) => {
          return _id + Math.random()
        },
        sorter: true,
      },
      {
        title: '角色名称',
        dataIndex: 'rolename',
        key: 'rolename',
        sorter: true,
      },
      {
        title: '角色ID',
        dataIndex: 'roleid',
        key: 'roleid',
        sorter: true,
      },
      {
        title: '角色描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '操作',
        dataIndex: '_id',
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
                disabled: record.roleid === 9,
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

        <Modal
          title='新建角色'
          visible={this.state.modalAddVisible}
          onOk={this.handleModalAddSubmit}
          onCancel={() => this.handleModalAddVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="角色名称">
              {getFieldDecorator('add_rolename', {
                rules: [
                  { required: true, message: '角色名称不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入角色名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="角色ID">
              {getFieldDecorator('add_roleid', {
                rules: [
                  { required: true, message: '角ID不能为空！' },
                  { pattern: /^[0-9]+$/, message: '只能输入0~9之间的整数！' }
                ]
              })(
                <InputNumber min={0} max={9} style={{width: '100%'}} placeholder="0～9之间的整数" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="描述">
              {getFieldDecorator('add_description', {
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入描述" />
              )}
            </FormItem>
          </Form>
        </Modal>

        <Modal
          title='修改角色'
          visible={this.state.modalUpdateVisible}
          onOk={this.handleModalUpdateSubmit}
          onCancel={() => this.handleModalUpdateVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="角色名称">
              {getFieldDecorator('update_rolename', {
                initialValue: detail.rolename,
                rules: [
                  { required: true, message: '角色名称不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入角色名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="角色ID">
              {getFieldDecorator('update_roleid', {
                initialValue: detail.roleid,
                rules: [
                  { required: true, message: '角ID不能为空！' },
                  { pattern: /^[0-9]+$/, message: '只能输入0~9之间的整数！' }
                ]
              })(
                <InputNumber min={0} max={9} style={{width: '100%'}} placeholder="0～9之间的整数" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="描述">
              {getFieldDecorator('update_description', {
                initialValue: detail.description,
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入描述" />
              )}
            </FormItem>
          </Form>
        </Modal>

      </PageHeaderLayout>
    )
  }

}
