/**
 * 模型管理
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Card, InputNumber, Select, Table, Divider, Modal, Popconfirm, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Storage, checkRole} from '../../utils/utils';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const { Option } = Select;

@connect(state => ({
  login: state.login,
  model: state.model,
}))
@Form.create()
export default class Model extends Component {

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
  };

  //初始化
  componentDidMount(){
    this.queryList();                                     //查询列表
  }

  //查询列表
  queryList(){
    this.props.dispatch({
      type: 'model/list',
      payload: {
        sort: this.state.sort,
        currentPage: this.state.currentPage,
        pageSize: this.state.pageSize
      },
      callback: (res) => {
        if(res.total === 0){
          this.initModel()
        }
      }
    });
  }

  //模型初始化
  initModel(){
    this.props.dispatch({
      type: 'model/init',
      payload: {},
      callback: (res) => {
        if(res.status !== 1){
          notification.error({ message: res.msg });
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
    this.props.form.resetFields(['add_name', 'add_type']);
    this.setState({modalAddVisible: !!flag});
  };
  handleModalAddSubmit = (e) => {
    e.preventDefault();

    if(!checkRole(this.state.role.roleid)) return;
    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(['add_name', 'add_type'], (err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'model/add',
        payload: {
          name: values.add_name,
          type: values.add_type,
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
    this.props.form.resetFields(['update_name', 'update_type']);
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

    this.props.form.validateFields(['update_name', 'update_type'], (err, values) => {
      if (err) return;
      this.props.dispatch({
        type: 'model/update',
        payload: {
          _id: this.state.detail._id,
          name: values.update_name,
          type: values.update_type,
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
      type: 'model/del',
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

    const { form, model } = this.props;
    const { detail } = this.state;
    const { getFieldDecorator } = form;

    const loading = model.loading;
    const list = model.list;
    const total = model.total;

    const types = [
      {name: 'article', type: 'article'},
      {name: 'album', type: 'album'},
      {name: 'photo', type: 'photo'},
    ];

    const modelOption = types.map((topic, index) => (
      <Option key={index} value={topic.type}>{topic.name}</Option>
    ));

    const columns = [
      {
        title: 'id',
        dataIndex: '_id',
        key: '_id',
        sorter: true,
      },
      {
        title: '模型名称',
        dataIndex: 'name',
        key: 'name',
        sorter: true,
      },
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
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
          title='新建模型'
          visible={this.state.modalAddVisible}
          onOk={this.handleModalAddSubmit}
          onCancel={() => this.handleModalAddVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="模型名称">
              {getFieldDecorator('add_name', {
                rules: [
                  { required: true, message: '模型名称不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入模型名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="描述">
              {getFieldDecorator('add_type', {
                rules: [
                  { required: true, message: '请选择类型！' },
                ]
              })(
                <Select style={{ width: '100%' }} placeholder="请选择类型">
                  {modelOption}
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>

        <Modal
          title='修改模型'
          visible={this.state.modalUpdateVisible}
          onOk={this.handleModalUpdateSubmit}
          onCancel={() => this.handleModalUpdateVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="模型名称">
              {getFieldDecorator('update_name', {
                initialValue: detail.name,
                rules: [
                  { required: true, message: '角色名称不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入模型名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="类型">
              {getFieldDecorator('update_type', {
                initialValue: detail.type,
                rules: [
                  { required: true, message: '请选择类型！' },
                ]
              })(
                <Select style={{ width: '100%' }} placeholder="请选择类型">
                  {modelOption}
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>

      </PageHeaderLayout>
    )
  }

}
