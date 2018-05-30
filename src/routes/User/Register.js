import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import { Form, Input, Button, Icon, Select, Row, Col, Popover, Progress, notification } from 'antd';
import {Storage} from "../../utils/utils";
import styles from './Register.less';

const FormItem = Form.Item;
const { Option } = Select;
const InputGroup = Input.Group;

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
  admin: state.admin,
  role: state.role,
  login: state.login,
}))
@Form.create()
export default class Register extends Component {

  state = {
    confirmDirty: false,
    visible: false,                             //密码强度弹框
    help: '',                                   //辅助提示
    role: ''                                    //记录角色id
  };

  componentDidMount(){
    this.queryAdminCount()
  }

  //查询管理列表
  queryAdminCount(){
    this.props.dispatch({
      type: 'admin/count',
      payload: {},
      callback: (res) => {
        if(res.data === 0){
          this.queryRoleList();
        }else{
          this.props.dispatch(routerRedux.push('/user/login'));
        }
      }
    });
  }

  //查询角色列表
  queryRoleList(){
    this.props.dispatch({
      type: 'role/list',
      payload: {
        params: this.state.params,
        sort: this.state.sort,
        currentPage: this.state.currentPage,
        pageSize: this.state.pageSize
      },
      callback: (res) => {
        if(res.total === 0){
          this.addRole();
        }else{
          this.setState({
            role: res.data[0]._id
          })
        }
      }
    });
  }

  addRole(){
    this.props.dispatch({
      type: 'role/add',
      payload: {
        rolename: '超级管理员',
        roleid: 9,
      },
      callback: (res) => {
        if(res.status === 1) this.queryRoleList()
      }
    });
  }

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'pool';
  };

  //确定提交
  handleSubmit = (e) => {
    e.preventDefault();

    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        //console.log(values)
        values.role = this.state.role;
        this.props.dispatch({
          type: 'login/adminRegister',
          payload: values,
          callback: (res) => {
            if (res.status === 1) {
              notification.success({
                message: '注册成功！',
                description: '',
              });
              this.props.dispatch(routerRedux.push('/user/login'));
            }else{
              notification.error({
                message: '注册失败！',
                description: res.msg,
              });
            }
          }
        });
      }
      setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
    });
  };

  handleConfirmBlur = (e) => {
    const { value } = e.target;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };

  //比对密码
  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
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
    const value = form.getFieldValue('password');
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

  render() {
    const { form, login } = this.props;
    const { getFieldDecorator } = form;

    return (
      <div className={styles.main}>

        <Form onSubmit={this.handleSubmit}>

          <FormItem>
            {getFieldDecorator('username', {
              rules: [
                { required: true, message: '请输入用户名！'},
                { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' },
              ],
            })(
              <Input
                size="large"
                prefix={<Icon type="user" className={styles.prefixIcon} />}
                placeholder="输入用户名"
              />
            )}
          </FormItem>

          <FormItem help={this.state.help}>
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
              {getFieldDecorator('password', {
                rules: [
                  { validator: this.checkPassword }
                ],
              })(
                <Input
                  size="large"
                  type="password"
                  prefix={<Icon type="lock" className={styles.prefixIcon} />}
                  placeholder="至少6位密码，区分大小写"
                />
              )}
            </Popover>
          </FormItem>
          <FormItem>
            {getFieldDecorator('confirm', {
              rules: [
                {
                  required: true,
                  message: '请确认密码！',
                },
                {
                  validator: this.checkConfirm,
                },
              ],
            })(
              <Input size="large"
                type="password"
                prefix={<Icon type="lock" className={styles.prefixIcon} />}
                placeholder="确认密码"
              />
            )}
          </FormItem>

          <FormItem>
            {getFieldDecorator('email', {
              rules: [
                {required: true, message: '请输入邮箱地址！'},
                {type: 'email', message: '邮箱地址格式错误！'},
              ],
            })(
              <Input size="large"
                prefix={<Icon type="mail" className={styles.prefixIcon} />}
                placeholder="邮箱"
              />
            )}
          </FormItem>

          <FormItem>
            <Button
              size="large"
              loading={login.submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              注册
            </Button>
            <Link className={styles.login} to="/user/login">
              使用已有账户登录
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}
