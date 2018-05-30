import React, { Component } from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Form, Input, Button, Icon, Checkbox, Row, Col } from 'antd';
import styles from './Login.less';
import {Storage} from "../../utils/utils";

const FormItem = Form.Item;

@connect(state => ({
  admin: state.admin,
  login: state.login,
}))
@Form.create()
export default class Login extends Component {

  state = {
    username: Storage.get('metu-username') ? Storage.get('metu-username') : '',
    remember: Storage.get('metu-remember') ? Storage.get('metu-remember') : true,
    captcha: 'api/captcha.png?rnd=' + Math.random(),
  };

  componentDidMount(){
    //本地没有用户信息时，查询管理列表，进而决定注册按钮是否显示
    if(!Storage.get('metu-userinfo')){
      this.queryAdminCount()
    }
  }

  queryAdminCount(){
    this.props.dispatch({
      type: 'admin/count',
      payload: {},
      callback: (res) => {}
    });
  }

  //获取验证码
  getCaptcha = () => {
    this.setState({
      captcha: 'api/captcha.png?rnd=' + Math.random()
    })
  };

  //提交登录
  handleSubmit = (e) => {
    e.preventDefault();

    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        Storage.set('metu-remember', values.remember);
        if(values.remember) Storage.set('metu-username', values.username);
        values.captcha = parseInt(values.captcha);
        this.props.dispatch({
          type: 'login/login',
          payload: values,
          callback: (res) => {
            if(res.status === 1) {
              if(res.data.type === 'admin'){
                this.props.dispatch(routerRedux.push('/system/home'));
              }else{
                this.props.dispatch(routerRedux.push('/'));
              }
            }else{
              this.getCaptcha();
              this.props.form.resetFields(['password', 'captcha']);
            }
          }
        });
      }else{
        this.getCaptcha()
      }
      setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
    });
  };

  render() {
    const { form, admin, login } = this.props;
    const { getFieldDecorator, isFieldsTouched } = form;
    return (
      <div className={styles.main}>

        <Form onSubmit={this.handleSubmit}>

          <FormItem>
            {getFieldDecorator('username', {
              initialValue: this.state.username,
              rules: [
                { required: true, message: '请输入账户名！' },
                { pattern: /^[A-Za-z0-9]+$/, message: '只能输入英文和数字，区分大小写！' },
              ],
            })(
              <Input
                size="large"
                prefix={<Icon type="user" className={styles.prefixIcon} />}
                placeholder="请输入用户名"
              />
            )}
          </FormItem>
          <FormItem>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: '请输入密码！' },
                { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' },
              ],
            })(
              <Input
                size="large"
                prefix={<Icon type="lock" className={styles.prefixIcon} />}
                type="password"
                placeholder="请输入密码"
              />
            )}
          </FormItem>
          <FormItem>
            <Row gutter={8}>
              <Col span={16}>
                {getFieldDecorator('captcha', {
                  rules: [
                    { required: true, message: '请输入验证码！' },
                    { len: 4, message: '验证码输入有误！' },
                    { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' },
                  ],
                })(
                  <Input
                    size="large"
                    prefix={<Icon type="safety" className={styles.prefixIcon} />}
                    placeholder="验证码"
                  />
                )}
              </Col>
              <Col span={8}>
                <Button
                  className={styles.getCaptcha}
                  size="large"
                  onClick={this.getCaptcha}
                >
                  <img src={this.state.captcha} width="100%" height="100%" alt=""/>
                </Button>
              </Col>
            </Row>
          </FormItem>

          <FormItem className={styles.additional}>
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox className={styles.autoLogin}>记住账号</Checkbox>
            )}
            <Button size="large"
              loading={login.submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              登录
            </Button>
            {
              admin.count === 0 ?
                <Button size="large" className={styles.submit}>
                  <Link to="/user/register">注册</Link>
                </Button>
                : ''
            }
          </FormItem>
        </Form>

        {/*<div className={styles.other}>*/}
          {/*其他登录方式*/}
          {/*/!* 需要加到 Icon 中 *!/*/}
          {/*<span className={styles.iconAlipay} />*/}
          {/*<span className={styles.iconTaobao} />*/}
          {/*<span className={styles.iconWeibo} />*/}
          {/*<Link className={styles.register} to="/user/register">注册账户</Link>*/}
        {/*</div>*/}
      </div>
    );
  }
}
