/**
 * 用户管理
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import Moment from 'moment'
import { Form, Input, Button, Icon, Row, Col, Card, Select, Table, Divider, Modal, Popconfirm, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Storage, checkRole} from '../../utils/utils';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const { Option } = Select;

const keys1 = ['add_username', 'add_password', 'add_role', 'add_email'];
const keys2 = ['update_nickname', 'update_role', 'update_email'];

@connect(state => ({
  login: state.login,
  admin: state.admin,
  user: state.user,
  role: state.role,
}))
@Form.create()
export default class UserManage extends Component {

  state = {
    role: this.props.login.currentUser.role,
    params: {},                                     //列表查询参数
    sort: '',                                       //列表排序参数
    currentPage: 1,
    pageSize: Storage.get('metu-pageSize') ? Storage.get('metu-pageSize') : 10,
    selectedRowKeys: [],
    modalAddVisible: false,
    modalUpdateVisible: false,
    detail: {
      _id: '',
      username: '',
      password: '',
      role: '',
      email: ''
    },
  };

  //初始化
  componentDidMount(){
    this.queryList();                                     //查询列表
    this.props.dispatch({
      type: 'role/list',
      payload: {},
      callback: () => {}
    });
  }

  //查询列表
  queryList(){
    this.props.dispatch({
      type: 'user/list',
      payload: {
        params: this.state.params,
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

  //按条件查询
  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields(['username', 'role'], (err, values) => {
      if (err) return;
      this.setState({ params: values }, () => {
        this.queryList()
      });
    });
  };
  //重置查询
  handleFormReset = (e) => {
    e.preventDefault();
    this.props.form.resetFields();
    this.setState({
      params: {},
    }, () => {
      this.queryList()
    });
  };

  //新建用户Modal
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
        type: 'user/add',
        payload: {
          username: values.add_username,
          password: values.add_password,
          email: values.add_email,
          role: values.add_role,
        },
        callback: (res) => {
          this.refreshList(res);
          if(res.status === 1) this.handleModalAddVisible();
        }
      });
      setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
    });
  };
  //比对密码
  checkConfirm = (rule, value, callback) => {
    if (value && value !== this.props.form.getFieldValue('add_password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  //修改用户Modal
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
        type: 'user/update',
        payload: {
          _id: this.state.detail._id,
          nickname: values.update_nickname,
          email: values.update_email,
          role: values.update_role,
        },
        callback: (res) => {
          this.refreshList(res);
          if(res.status === 1) this.handleModalUpdateVisible();
        }
      });
      setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
    });
  };

  //删除用户
  delData = (ids) => {
    if(!checkRole(this.state.role.roleid)) return;
    this.props.dispatch({
      type: 'user/del',
      payload: {ids: ids},
      callback: (res) => {
        this.refreshList(res);
        this.setState({selectedRowKeys: []})
      }
    });
  };
  del = (record) => {
    if(record.username === 'admin'){
      notification.error({ message: '禁止操作该账号！' });
      return false;
    }
    if(record._id === this.props.login.currentUser._id){
      notification.error({ message: '不能删除自己！' });
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

    const { form, user, role } = this.props;
    const { detail } = this.state;
    const { getFieldDecorator, getFieldsError } = form;

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

    const selectOption = role.list ?
      role.list.map((topic, index) => (
        <Option key={topic._id} value={topic._id}>{topic.rolename}</Option>
      )) : '';

    const loading = user.loading;
    const list = user.list;
    const total = user.total;

    const columns = [
      {
        title: '用户名',
        dataIndex: 'username',
        key: 'username',
        sorter: true,
      },
      {
        title: '昵称',
        dataIndex: 'nickname',
        key: 'nickname',
        sorter: true,
      },
      {
        title: '所属角色',
        dataIndex: 'role.rolename',
        key: 'role._id',
      },
      {
        title: '邮箱',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: '最后登录ip',
        dataIndex: 'lastip',
        key: 'lastip',
      },
      {
        title: '创建时间',
        dataIndex: 'updatetime',
        key: 'updatetime',
        sorter: true,
        render: (date) => (
          <span>{Moment(date).format('YYYY-MM-DD hh:mm:ss')}</span>
        ),
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

          <Form onSubmit={this.handleSearch}>
            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
              <Col md={8} sm={24}>
                <FormItem {...formItemLayout} label="用户名">
                  {getFieldDecorator('username', {
                    rules: [
                      { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                    ]
                  })(
                    <Input placeholder="请输入" style={{width: '100%'}} />
                  )}
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem {...formItemLayout} label="角色类型">
                  {getFieldDecorator('role', {})(
                    <Select placeholder="请选择" style={{ width: '100%' }}>
                      {selectOption}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem>
                  <Button type="primary" htmlType="submit">查询</Button>
                  <Button style={{ marginLeft: 20 }} onClick={this.handleFormReset}>重置</Button>
                </FormItem>
              </Col>
            </Row>
          </Form>

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
                disabled: record.username === 'admin',
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
          title='新建用户'
          visible={this.state.modalAddVisible}
          onOk={this.handleModalAddSubmit}
          onCancel={() => this.handleModalAddVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="用户名">
              {getFieldDecorator('add_username', {
                rules: [
                  { required: true, message: '用户名不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入用户名" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="密码">
              {getFieldDecorator('add_password', {
                rules: [
                  { required: true, message: '密码不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input type="password" placeholder="至少6位密码，区分大小写" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="确认密码">
              {getFieldDecorator('confirm', {
                rules: [
                  { required: true, message: '请输入确认密码！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' },
                  { validator: this.checkConfirm },
                ]
              })(
                <Input type="password" placeholder="输入确认密码" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="角色类型">
              {getFieldDecorator('add_role', {
                rules: [
                  { required: true, message: '角色类型不能为空！' }
                ]
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {selectOption}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="邮箱">
              {getFieldDecorator('add_email', {
                rules: [
                  { required: true, message: '邮箱不能为空！' },
                  { type: 'email', message: '邮箱格式有误！' },
                ]
              })(
                <Input placeholder="输入用户名" />
              )}
            </FormItem>
          </Form>
        </Modal>

        <Modal
          title='修改用户'
          visible={this.state.modalUpdateVisible}
          onOk={this.handleModalUpdateSubmit}
          onCancel={() => this.handleModalUpdateVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="用户名">
              {getFieldDecorator('update_username', {
                initialValue: detail.username,
                rules: [
                  { required: true, message: '用户名不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入用户名" readOnly />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="昵称">
              {getFieldDecorator('update_nickname', {
                initialValue: detail.nickname,
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入昵称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="角色类型">
              {getFieldDecorator('update_role', {
                initialValue: detail.role._id,
                rules: [
                  { required: true, message: '角色类型不能为空！' }
                ]
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {selectOption}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="邮箱">
              {getFieldDecorator('update_email', {
                initialValue: detail.email,
                rules: [
                  { required: true, message: '邮箱不能为空！' },
                  { type: 'email', message: '邮箱格式有误！' },
                ]
              })(
                <Input placeholder="输入用户名" />
              )}
            </FormItem>
          </Form>
        </Modal>

      </PageHeaderLayout>
    )
  }

}
