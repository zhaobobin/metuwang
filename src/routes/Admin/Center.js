/**
 * 站点配置
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Card, Tabs, Upload, Popover, Progress, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {ENV, Storage, hasErrors} from '../../utils/utils';
import {uploadOss} from "../../utils/request";
import styles from './Center.less';

import UploadAvatar from '../../components/FormTool/UploadAvatar'

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

const keys1 = ['username', 'nickname', 'email', 'remark', 'avatar'];
const keys2 = ['old_password', 'new_password'];

const passwordStatusMap = {
  ok: <div className={styles.success}>强度：强</div>,
  pass: <div className={styles.warning}>强度：中</div>,
  pool: <div className={styles.error}>强度：太短</div>,
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  pool: 'exception',
};

@connect(state => ({
  login: state.login,
  admin: state.admin,
  oss: state.oss,
}))
@Form.create()
export default class Center extends Component {

  state = {
    loading: false,
    currentUser: this.props.login.currentUser,
    avatar: this.props.login.currentUser.avatar ? this.props.login.currentUser.avatar : '',

    confirmDirty: false,
    visible: false,                             //密码强度弹框
    help: '',                                   //辅助提示
  };

  componentDidMount(){
    this.queryDetail();
  }

  queryDetail(){
    this.props.dispatch({
      type: 'admin/detail',
      payload: {_id: this.state.currentUser._id},
      callback: (res) => {}
    });
  }

  handleSelectPhoto = (value) => {
    this.props.form.setFieldsValue({
      avatar: value
    });
  };

  //修改信息
  handleSubmitInfo = (e) => {
    e.preventDefault();

    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys1, (err, values) => {
      if(!err){
        values._id = this.state.currentUser._id;
        if(this.state.avatar) values.avatar = this.state.avatar;
        this.props.dispatch({
          type: 'admin/update',
          payload: values,
          callback: (res) => {
            setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
            if(res.status === 1){
              notification.success({message: res.msg});
            }else{
              notification.error({message: res.msg});
            }
            //刷新登录信息
            this.props.dispatch({
              type: 'login/refresh',
              payload: {_id: values._id},
            });
          }
        });
      }
    });
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('new_password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'pool';
  };

  //检查密码
  checkPassword = (rule, value, callback) => {
    const { form } = this.props;
    let reg = /^[\u0391-\uFFE5A-Za-z0-9]+$/;
    if (!value) {
      this.setState({
        help: '请输入密码！',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!this.state.visible) {
        this.setState({
          visible: !!value,
        });
      }
      if(!reg.test(value)){
        this.setState({
          help: '不能输入特殊符号！',
        });
        callback('error');
      }
      if(value === form.getFieldValue('old_password')){
        this.setState({
          help: '新密码不能与旧密码相同！',
        });
        callback('error');
      }
      if (value.length < 6) {
        callback('error');
      } else {
        if (value && this.state.confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  //检查密码强度
  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('new_password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  handleConfirmBlur = (e) => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  //比对密码
  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('new_password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  //修改密码
  handleSubmitPsd = (e) => {
    e.preventDefault();

    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys2, (err, values) => {
      if(!err){
        values._id = this.state.currentUser._id;
        this.props.dispatch({
          type: 'admin/updatePsd',
          payload: values,
          callback: (res) => {
            setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
            if(res.status === 1){
              notification.success({message: res.msg});
              this.props.form.resetFields(['old_password', 'new_password', 'confirm']);
            }else{
              notification.error({message: res.msg});
            }
          }
        });
      }
    });
  };

  render(){

    const { form, admin, oss } = this.props;
    const detail = admin.detail;

    const { getFieldDecorator, getFieldsError } = form;

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
        md: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
        md: { span: 18 },
      },
    };

    return(
      <PageHeaderLayout>
        <Card>
          <Tabs defaultActiveKey="1" animated={false}>

            <TabPane tab="修改信息" key="1">
              <Row>
                <Col lg={6} md={24} sm={24}/>
                <Col lg={10} md={24} sm={24}>
                  <Form onSubmit={this.handleSubmitInfo}>
                    <FormItem {...formItemLayout} label="头像">
                      {getFieldDecorator('avatar', {})(
                        <UploadAvatar url={detail.avatar} callback={this.handleSelectPhoto}/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="用户名">
                      {getFieldDecorator('username', {
                        initialValue: detail.username ? detail.username : undefined,
                        rules: [
                          { required: true, message: '用户名不能为空！' },
                        ],
                      })(
                        <Input style={{ width: '100%' }} readOnly/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="昵称">
                      {getFieldDecorator('nickname', {
                        initialValue: detail.nickname ? detail.nickname : undefined,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} />
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="邮箱">
                      {getFieldDecorator('email', {
                        initialValue: detail.email ? detail.email : undefined,
                        rules: [
                          { required: true, message: '邮箱不能为空！' },
                          { type: 'email', message: '输入格式有误！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="备注">
                      {getFieldDecorator('remark', {
                        initialValue: detail.remark ? detail.remark : undefined,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' },
                          { max: 20, message: '不能超过20个文字！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder="不超过20个文字" />
                      )}
                    </FormItem>
                    <FormItem wrapperCol={{ span: 18, offset: 6 }}>
                      <Button style={{ width: '100%' }}
                              size="large"
                              type="primary"
                              htmlType="submit"
                              disabled={hasErrors(getFieldsError(keys1)) || oss.submitting}
                      >保存</Button>
                    </FormItem>
                  </Form>
                </Col>
                <Col lg={8} md={24} sm={24}/>
              </Row>
            </TabPane>

            <TabPane tab="修改密码" key="2">
              <Row>
                <Col lg={6} md={24} sm={24}/>
                <Col lg={10} md={24} sm={24}>
                  <Form onSubmit={this.handleSubmitPsd}>
                    <FormItem {...formItemLayout} label="用户名">
                      {getFieldDecorator('psd-username', {
                        initialValue: detail.username ? detail.username : undefined,
                        rules: [
                          { required: true, message: '用户名不能为空！' },
                        ],
                      })(
                        <Input style={{ width: '100%' }} readOnly/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="旧密码">
                      {getFieldDecorator('old_password', {
                        rules: [
                          { required: true, message: '密码不能为空！' },
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' },
                        ],
                      })(
                        <Input style={{ width: '100%' }} type="password" placeholder="输入旧密码" />
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="新密码" help={this.state.help}>
                      <Popover
                        content={
                          <div style={{ padding: '4px 0' }}>
                            {passwordStatusMap[this.getPasswordStatus()]}
                            {this.renderPasswordProgress()}
                            <div style={{ marginTop: 10 }}>
                              请至少输入 6 个字符。请不要使用容易被猜到的密码。
                            </div>
                          </div>
                        }
                        overlayStyle={{ width: 240 }}
                        placement="right"
                        visible={this.state.visible}
                      >
                        {getFieldDecorator('new_password', {
                          rules: [
                            { required: true, message: '密码不能为空！' },
                            { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' },
                            { validator: this.checkPassword },
                          ],
                        })(
                          <Input type="password" placeholder="至少6位密码，区分大小写" />
                        )}
                      </Popover>
                    </FormItem>
                    <FormItem {...formItemLayout} label="确认密码">
                      {getFieldDecorator('confirm', {
                        rules: [
                          { required: true, message: '请确认密码！' },
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' },
                          { validator: this.checkConfirm },
                        ],
                      })(
                        <Input type="password" placeholder="输入确认密码" />
                      )}
                    </FormItem>
                    <FormItem wrapperCol={{ span: 18, offset: 6 }}>
                      <Button style={{ width: '100%' }}
                        size="large"
                        type="primary"
                        htmlType="submit"
                        disabled={hasErrors(getFieldsError(keys2)) || oss.submitting}
                      >保存</Button>
                    </FormItem>
                  </Form>
                </Col>
                <Col lg={8} md={24} sm={24}/>
              </Row>
            </TabPane>

          </Tabs>
        </Card>
      </PageHeaderLayout>
    )
  }

}
