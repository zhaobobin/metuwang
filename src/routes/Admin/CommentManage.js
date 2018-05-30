/**
 * 评论管理
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

@connect(state => ({
  login: state.login,
  comment: state.comment
}))
@Form.create()
export default class CommentManage extends Component {

  state = {
    role: this.props.login.currentUser.role,
    params: {},                                     //列表查询参数
    sort: '',                                       //列表排序参数
    currentPage: 1,
    pageSize: Storage.get('metu-pageSize') ? Storage.get('metu-pageSize') : 10,
    selectedRowKeys: [],
    modalAddVisible: false,
    modalUpdateVisible: false,
    detail: {},
  };

  //初始化
  componentDidMount(){
    this.queryList();                                     //查询列表
  }

  //查询列表
  queryList(){
    this.props.dispatch({
      type: 'comment/list',
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
    this.props.form.validateFields(['report'], (err, values) => {
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

  //删除评论
  delData = (ids) => {
    if(!checkRole(this.state.role.roleid)) return;
    let aids = [],
      list = this.props.comment.list;
    for(let i in list){
      if(list[i]._id === ids[i] && aids.indexOf(list[i].aid._id) < 0 ) aids.push(list[i].aid._id)
    }
    this.props.dispatch({
      type: 'comment/del',
      payload: {
        ids: ids,                       //评论id集合
        aids: aids                      //文章id集合
      },
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

    const { form, comment } = this.props;
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

    const loading = comment.loading;
    const list = comment.list;
    const total = comment.total;

    const columns = [
      {
        title: '文章',
        dataIndex: 'aid.title',
        key: 'aid.title',
        sorter: true,
      },
      {
        title: '用户',
        dataIndex: 'uid.nickname',
        key: 'uid.nickname',
        sorter: true,
      },
      {
        title: '评论内容',
        dataIndex: 'content',
        key: 'content',
      },
      {
        title: '被举报',
        dataIndex: 'report',
        key: 'report',
        render: (report) => (
          <span>{report === 1 ? '是' : '否'}</span>
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'createtime',
        key: 'createtime',
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
                <FormItem {...formItemLayout} label="被举报">
                  {getFieldDecorator('report', {})(
                    <Select placeholder="请选择" style={{ width: '100%' }}>
                      <Option key={1} value={1}>是</Option>
                      <Option key={0} value={0}>否</Option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col md={8} sm={24}>
                <FormItem>
                  <Button type="primary" htmlType="submit">查询</Button>
                  <Button style={{marginLeft: 20}} onClick={this.handleFormReset}>重置</Button>
                  {
                    this.state.selectedRowKeys.length > 0 ?
                      <Button style={{marginLeft: 20}} onClick={() => this.delAll()}>批量删除</Button>
                      : ''
                  }
                </FormItem>
              </Col>
            </Row>
          </Form>

          <Table
            rowKey="_id"
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

      </PageHeaderLayout>
    )
  }

}
