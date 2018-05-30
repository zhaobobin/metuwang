import React, { PureComponent } from 'react';
import { Layout, Row, Col, Form, Input, Icon, Button, Checkbox, Tabs, Modal, Menu, Dropdown, notification } from 'antd';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Storage} from "../../utils/utils";
import styles from './UserModal.less';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const confirm = Modal.confirm;

const keys1 = ['username', 'password', 'captcha', 'remember'];
const keys2 = ['r_username', 'r_password', 'r_rpassword', 'r_email'];

@connect(state => ({
  login: state.login
}))
@Form.create()
export default class UserModal extends PureComponent {

  constructor(props){
    super(props);
    this.state = {
      windowHeight: '',                                                               //窗口高度
      remember: Storage.get('metu-remember') !== null ? Storage.get('metu-remember') : true,
      captcha: 'api/captcha.png?rnd=' + Math.random(),
    };
  }

  componentDidMount(){
    Storage.set('metu-ajaxFlag', true);
    this.checkSession();
  }

  checkSession(){
    this.props.dispatch({
      type: 'login/session',
      payload: {},
    });
  }

  //验证码
  getCaptcha = () => {
    this.setState({
      captcha: 'api/captcha.png?rnd=' + Math.random()
    })
  };

  //登录注册modal状态
  setUserModal(value, key){
    this.getCaptcha();
    this.props.form.resetFields();															                //重置所有表单
    //this.setState({userModal: value, tabKey: key});						//tab标签状态
    this.props.dispatch({
      type: 'login/changeModal',
      payload: {
        modalVisible: value,
        tabKey: key,
      }
    });
  }
  //tab切换
  changeTabKey(key){
    this.setUserModal(true, key)
  }

  //记住我
  rememberChange = () => {
    let rememberState = !this.state.remember;
    Storage.set('metu-remember', rememberState);
    this.setState({remember: rememberState});
  };

  //检查注册密码输入
  checkPassword(rule, value, callback){
    const form = this.props.form;
    if (value && value !== form.getFieldValue('r_password')) {
      callback('请重新确认密码！');
    } else {
      callback();
    }
  }
  checkConfirm(rule, value, callback){
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['r_rpassword'], { force: true });
    }
    callback();
  }

  regeditSubmit = (e) => {
    e.preventDefault();

    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys2, (err, values) => {
      if (!err) {
        //console.log(values)
        let data = {
          username: values.r_username,
          password: values.r_password,
          email: values.r_email,
        };
        this.props.dispatch({
          type: 'login/userRegister',
          payload: data,
          callback: (res) => {
            if (res.status === 1) {
              notification.success({
                message: '注册成功！',
                description: '',
              });
              this.setUserModal(false, '2')
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

  loginSubmit = (e) => {
    e.preventDefault();

    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys1, (err, values) => {
      if (!err) {
        if(values.remember){
          Storage.set('metu-username', values.username)
        }else{
          Storage.set('metu-username', '')
        }
        Storage.set('metu-remember', values.remember);
        values.captcha = parseInt(values.captcha);
        this.props.dispatch({
          type: 'login/login',
          payload: values,
          callback: (res) => {
            if(res.status === 1) {
              this.setUserModal(false, '1');
            }else{
              this.getCaptcha();
              this.props.form.resetFields(keys1);
            }
          }
        });
      }else{
        this.getCaptcha()
      }
      setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
    });
  };

  logout = () => {
    let _this = this;
    confirm({
      title: '退出登录?',
      okText: '确定',
      cancelText: '取消',
      onOk() {
        _this.props.dispatch({
          type: 'login/logout',
        });
      },
      onCancel() {},
    });
  };

  render() {

    const { form, login } = this.props;
    const { getFieldDecorator } = form;
    const { isAuth, currentUser, lastUsername } = login;

    const userMenu = (
      <Menu>
        <Menu.Item>
          <Link to={`/u/${currentUser.username}`}>我的主页</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/setting">设置</Link>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.logout}>退出</a>
        </Menu.Item>
      </Menu>
    );

    const publishMenu = (
      <Menu>
        <Menu.Item>
          <Link to="/publish/photo">发布图片</Link>
        </Menu.Item>
        <Menu.Item>
          <Link to="/publish/article">发布文章</Link>
        </Menu.Item>
      </Menu>
    );

    //判断是否登录
    const userShow = isAuth ?
      <div key="logout" className="user-info logout">
        <Dropdown overlay={userMenu}>
          <Link className={styles.username} to={`/u/${currentUser.username}`}>
            {currentUser.avatar ? <img src={currentUser.avatar + '?x-oss-process=style/thumb_s'} /> : <Icon type="user" />}
            <span>{currentUser.username}</span>
          </Link>
        </Dropdown>
        <Dropdown overlay={publishMenu}>
          <Link to="/publish/photo"><Button className={styles.userBtn} type="primary">发布</Button></Link>
        </Dropdown>
      </div>
      :
      <div key="login" className="user-info login">
        <Button className={styles.userBtn} onClick={ () => this.setUserModal(true, '1') }>登录</Button>
        <Button className={styles.userBtn} type="primary" onClick={ () => this.setUserModal(true, '2') }>注册</Button>
      </div>;

    return(
      <div className={styles.userAction}>
        {userShow}

        {/*登陆注册Modal begin! */}
        <Modal title=""
               width="320px"
               wrapClassName="vertical-center-modal"
               visible={login.modalVisible}
               onCancel={ () => this.setUserModal(false, "1") }
               footer={null}
               className={styles.userModal}
        >
          <Tabs type="card" activeKey={login.tabKey} onChange={this.changeTabKey.bind(this)}>

            <TabPane tab="登录" key="1">
              <Form onSubmit={this.loginSubmit} className="login-form">
                <FormItem>
                  {getFieldDecorator('username', {
                    initialValue: lastUsername,
                    rules: [
                      { required: true, message: '请输入用户名！' },
                      { pattern: /^[A-Za-z0-9]+$/, message: '只能输入字母和数字！' }
                    ],
                  })(
                    <Input prefix={<Icon type="user" />} placeholder="邮箱、手机、用户名" />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('password', {
                    rules: [
                      { required: true, message: '请输入密码！' },
                      { pattern: /^[A-Za-z0-9]+$/, message: '只能输入字母和数字！' }
                    ],
                  })(
                    <Input prefix={<Icon type="lock" />} type="password" placeholder="请输入密码" />
                  )}
                </FormItem>
                <FormItem>
                  <Row gutter={10}>
                    <Col span={16}>
                      {getFieldDecorator('captcha', {
                        rules: [
                          { required: true, message: '请输入验证码！' },
                          { pattern: /^[A-Za-z0-9]+$/, message: '只能输入字母和数字！' }
                        ]
                      })(
                        <Input prefix={<Icon type="lock" />} placeholder="请输入验证码" />
                      )}
                    </Col>
                    <Col span={8}>
                      <img src={this.state.captcha} onClick={this.getCaptcha} className='captcha' width="auto" height="32px" />
                    </Col>
                  </Row>
                </FormItem>
                <FormItem>
                  {getFieldDecorator('remember', {
                    valuePropName: 'checked',
                    initialValue: this.state.remember,
                  })(
                    <Checkbox onChange={this.rememberChange}>记住账号</Checkbox>
                  )}
                  <a className={styles.forgotPsd}>忘记密码</a><br/>
                  <Button type="primary" htmlType="submit" className="form-button">登录</Button>
                </FormItem>
                <FormItem>
                  <Button type="default" className="form-button" onClick={ () => this.setUserModal(false, "1") }>取消</Button>
                </FormItem>
              </Form>
            </TabPane>

            <TabPane tab="注册" key="2">
              <Form onSubmit={this.regeditSubmit} className="regedit-form">
                <FormItem>
                  {getFieldDecorator('r_username', {
                    rules: [
                      { required: true, message: '请输入用户名！' },
                      { pattern: /^[A-Za-z0-9]+$/, message: '只能输入字母和数字！' }
                    ],
                  })(
                    <Input prefix={<Icon type="user" />} placeholder="邮箱、手机、用户名" />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('r_password', {
                    validateTrigger: 'onBlur',
                    rules: [
                      { required: true, message: '请输入密码！' },
                      { min: 6, message: '密码长度不能小于6位！' },
                      { validator: this.checkConfirm.bind(this) },
                      { pattern: /^[A-Za-z0-9]+$/, message: '只能输入字母和数字！' }
                    ],
                  })(
                    <Input prefix={<Icon type="lock" />} type="password" placeholder="请输入密码" />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('r_rpassword', {
                    validateTrigger: 'onBlur',
                    rules: [
                      { required: true, message: '请确认密码！' },
                      { validator: this.checkPassword.bind(this) },
                      { pattern: /^[A-Za-z0-9]+$/, message: '只能输入字母和数字！' }
                    ],
                  })(
                    <Input prefix={<Icon type="lock" />} type="password" placeholder="确认密码" onBlur={this.handleConfirmBlur} />
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('r_email', {
                    validateTrigger: 'onBlur',
                    rules: [{ required: true, message: '确输入邮箱！' }],
                  })(
                    <Input prefix={<Icon type="lock" />} type="email" placeholder="确输入邮箱" />
                  )}
                </FormItem>
                <FormItem>
                  <Button type="primary" htmlType="submit" className="form-button">注册</Button>
                </FormItem>
                <FormItem>
                  <Button type="default" className="form-button" onClick={ () => this.setUserModal(false, "2") }>取消</Button>
                </FormItem>
              </Form>
            </TabPane>
          </Tabs>

        </Modal>
        {/*登陆注册Modal end! */}


      </div>
    )

  }

}
