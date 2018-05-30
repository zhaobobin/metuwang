/**
 * 分类管理
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Card, Select, InputNumber, Table, Divider, Modal, Popconfirm, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {Storage, checkRole} from '../../utils/utils';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const { Option } = Select;

const keys1 = ['add_index', 'add_model', 'add_parent', 'add_name', 'add_catedir', 'add_tags', 'add_description', 'add_show'];
const keys2 = ['update_index', 'update_model', 'update_parent', 'update_name', 'update_catedir', 'update_tags', 'update_description', 'update_show'];

@connect(state => ({
  login: state.login,
  category: state.category,
  model: state.model,
}))
@Form.create()
export default class Category extends Component {

  state = {
    role: this.props.login.currentUser.role,
    selectedRowKeys: [],
    modalAddVisible: false,
    modalUpdateVisible: false,
    detail: {
      index: '',
      model: '',
      parent: '',
      name: '',
      catedir: '',
      tags: '',
      description: '',
      show: ''
    },
  };

  //初始化
  componentDidMount(){
    this.queryCateList();                                     //查询列表
    this.queryModelList();
  }

  //查询模型列表
  queryModelList(){
    this.props.dispatch({
      type: 'model/list',
      payload: {},
      callback: (res) => {}
    });
  }

  //查询分类列表
  queryCateList(){
    this.props.dispatch({
      type: 'category/list',
      payload: { sort: this.state.sort },
      callback: (res) => {}
    });
  }

  //刷新列表
  refreshList(res){
    if(res.status === 1){
      this.queryCateList();
      notification.success({ message: res.msg });
    }else{
      notification.error({ message: res.msg });
    }
  }

  //新建分类Modal
  add = (record) => {
    this.props.form.resetFields(keys1);
    this.setState({
      modalAddVisible: true,
      detail: record ? record : {}
    });
  };
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
      let params = {
        index: values.add_index,
        model: values.add_model,
        name: values.add_name,
        catedir: values.add_catedir,
        tags: values.add_tags,
        description: values.add_description,
        show: values.add_show,
      };
      if(values.add_parent !== 0) params.parent = values.add_parent;
      this.props.dispatch({
        type: 'category/add',
        payload: params,
        callback: (res) => {
          setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
          this.refreshList(res);
          if(res.status === 1) this.handleModalAddVisible();
        }
      });
    });
  };

  //修改分类Modal
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
      let params = {
        _id: this.state.detail._id,
        index: values.update_index,
        model: values.update_model,
        name: values.update_name,
        catedir: values.update_catedir,
        tags: values.update_tags,
        description: values.update_description,
        show: values.update_show,
      };
      if(values.update_parent !== 0) params.parent = values.update_parent;
      this.props.dispatch({
        type: 'category/update',
        payload: params,
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
      type: 'category/del',
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

  handleChangeTags = (value) => {
    console.log(`selected ${value}`);
  };

  render(){

    const { form, category, model } = this.props;
    const { detail } = this.state;
    const { getFieldDecorator } = form;

    const loading = category.loading;
    const tree = category.tree;

    const modelOption = model.list ?
      model.list.map((topic, index) => (
        <Option key={topic._id} value={topic._id}>{topic.name}</Option>
      )) : '';

    const categoryOption = category.list ?
      category.list.map((topic, index) => (
        topic.parent ? '' :
        <Option key={topic._id} value={topic._id}>{topic.name}</Option>
      )) : '';

    const columns = [
      {
        title: '分类名称',
        dataIndex: 'name',
        key: 'name',
        render: (text, record) => (
          <span>{record.hasparent ? '└ '+record.name : record.name}</span>
        ),
      },
      {
        title: '排序',
        dataIndex: 'index',
        key: 'index',
      },
      {
        title: '分类路径',
        dataIndex: 'catedir',
        key: 'catedir',
      },
      {
        title: '模型',
        dataIndex: 'model',
        key: 'model',
        render: (model) => (
          <span>{model.name}</span>
        ),
      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
      },
      {
        title: '分类描述',
        dataIndex: 'description',
        key: 'description',
      },
      {
        title: '菜单显示',
        dataIndex: 'show',
        key: 'show',
        render: (show) => (
          <span>
            {show === 1 ? '显示' : '隐藏'}
          </span>
        ),
      },
      {
        title: '操作',
        dataIndex: '_id',
        render: (text, record) => (
          <span>
            <a onClick={() => this.update(record)}>修改</a>
            {record.haschildren ? '' : <Divider type="vertical" />}
            {
              record.haschildren ? '' :
              <Popconfirm title="确定删除该数据？" onConfirm={() => this.del(record)}>
                <a>删除</a>
              </Popconfirm>
            }
            {record.hasparent ? '' : <Divider type="vertical" />}
            {
              record.hasparent ? '' : <a onClick={() => this.add(record)}>新建</a>
            }
          </span>
        ),
      }
    ];

    return(
      <PageHeaderLayout>
        <Card>

          <div style={{marginBottom: '20px'}}>
            <Button icon="plus" type="primary" onClick={() => this.add()}>新建</Button>
            {
              this.state.selectedRowKeys.length > 0 ?
                <Button style={{marginLeft: '10px'}} onClick={() => this.delAll()}>批量删除</Button>
                : ''
            }
          </div>

          {
            tree.length > 0 ?
              <Table
                rowKey='_id'
                loading={loading}
                columns={columns}
                dataSource={tree}
                indentSize={10}
                defaultExpandAllRows={true}
                pagination={false}
                rowSelection={{
                  selectedRowKeys: this.state.selectedRowKeys,
                  onChange: this.onSelectChange,
                  getCheckboxProps: record => ({
                    disabled: record.haschildren === true,
                  })
                }}
              />
              :
              <div>暂无数据</div>
          }


        </Card>

        <Modal
          title='新建分类'
          visible={this.state.modalAddVisible}
          onOk={this.handleModalAddSubmit}
          onCancel={() => this.handleModalAddVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="排序">
              {getFieldDecorator('add_index', {
                initialValue: 0,
                rules: [
                  { required: true, message: '排序不能为空！' },
                  { pattern: /^[0-9]+$/, message: '只能输入数值！' }
                ]
              })(
                <InputNumber placeholder="请输入数值" style={{ width: '100%' }} min={0} />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="上级栏目">
              {getFieldDecorator('add_parent', {
                initialValue: detail._id ? detail._id : 0,
                rules: [
                  { required: true, message: '请选择上级栏目！' }
                ]
              })(
                <Select placeholder="请选择分类" style={{ width: '100%' }}>
                  <Option key={0} value={0}>作为一级分类</Option>
                  {categoryOption}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="分类模型">
              {getFieldDecorator('add_model', {
                initialValue: detail.model ? detail.model._id : undefined,
                rules: [
                  { required: true, message: '请选择分类模型！' }
                ]
              })(
                <Select placeholder="请选择模型" style={{ width: '100%' }}>
                  {modelOption}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="分类名称">
              {getFieldDecorator('add_name', {
                rules: [
                  { required: true, message: '分类名称不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入分类名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="分类路径">
              {getFieldDecorator('add_catedir', {
                rules: [
                  { required: true, message: '分类路径不能为空！' },
                  { pattern: /^[A-Za-z]+$/, message: '只能输入英文，区分大小写！' }
                ]
              })(
                <Input placeholder="输入分类路径" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="标签">
              {getFieldDecorator('add_tags', {
                initialValue: '',
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入标签，可用英文逗号分开" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="描述">
              {getFieldDecorator('add_description', {
                initialValue: '',
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入分类描述" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="导航显示">
              {getFieldDecorator('add_show', {
                initialValue: 1,
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option key={1} value={1}>显示</Option>
                  <Option key={0} value={0}>隐藏</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>

        <Modal
          title='修改分类'
          visible={this.state.modalUpdateVisible}
          onOk={this.handleModalUpdateSubmit}
          onCancel={() => this.handleModalUpdateVisible()}
        >
          <Form>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="排序">
              {getFieldDecorator('update_index', {
                initialValue: detail.index,
                rules: [
                  { required: true, message: '排序不能为空！' },
                  { pattern: /^[0-9]+$/, message: '只能输入数值！' }
                ]
              })(
                <InputNumber placeholder="请输入数值" style={{ width: '100%' }} min={0} />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="上级栏目">
              {getFieldDecorator('update_parent', {
                initialValue: detail.parent ? detail.parent._id : 0,
                rules: [
                  { required: true, message: '请选择上级栏目！' }
                ]
              })(
                <Select placeholder="请选择分类" style={{ width: '100%' }}>
                  <Option key={0} value={0}>作为一级分类</Option>
                  {categoryOption}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="分类模型">
              {getFieldDecorator('update_model', {
                initialValue: detail.model ? detail.model._id : null,
                rules: [
                  { required: true, message: '请选择分类模型！' }
                ]
              })(
                <Select placeholder="请选择模型" style={{ width: '100%' }}>
                  {modelOption}
                </Select>
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="分类名称">
              {getFieldDecorator('update_name', {
                initialValue: detail.name,
                rules: [
                  { required: true, message: '分类名称不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入分类名称" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="分类路径">
              {getFieldDecorator('update_catedir', {
                initialValue: detail.catedir,
                rules: [
                  { required: true, message: '分类路径不能为空！' },
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入分类路径" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="标签">
              {getFieldDecorator('update_tags', {
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入标签，可用英文逗号分开" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="描述">
              {getFieldDecorator('update_description', {
                initialValue: detail.description,
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Input placeholder="输入分类描述" />
              )}
            </FormItem>
            <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 17 }} label="导航显示">
              {getFieldDecorator('update_show', {
                initialValue: detail.show,
                rules: [
                  { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                ]
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option key={1} value={1}>显示</Option>
                  <Option key={0} value={0}>隐藏</Option>
                </Select>
              )}
            </FormItem>
          </Form>
        </Modal>

      </PageHeaderLayout>
    )
  }

}
