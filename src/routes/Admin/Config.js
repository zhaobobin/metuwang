/**
 * 站点配置
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Card, Tabs, Divider, Upload, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {ENV, Storage, checkRole, hasErrors} from '../../utils/utils';
import {uploadOss} from '../../utils/request';

import UploadPhoto from '../../components/FormTool/UploadPhoto'

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const { TextArea } = Input;

const keys1 = [
  'appname', 'siteurl', 'sitekeywords', 'sitedesc', 'logourl',
  'company', 'address', 'tel', 'siteemail', 'qq', 'copyright'
];

@connect(state => ({
  login: state.login,
  config: state.config,
  oss: state.oss,
}))
@Form.create()
export default class Config extends Component {

  state = {
    role: this.props.login.currentUser.role,
    loading: false,
    logourl: '',
  };

  componentDidMount(){
    this.props.dispatch({
      type: 'config/queryConfig',
      payload: {}
    });
  }

  beforeUpload = (file) => {
    const isImg = file.type.split('/')[1] === 'jpeg' || file.type.split('/')[1] === 'png';
    if (!isImg) {
      notification.error({message: '只能上传jpg、png图片文件!'});
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      Message.error('图片文件的大小不能超过2MB!');
    }
    return isImg && isLt2M;
  };

  //上传OSS
  handleUpload = ({ file }) => {
    this.setState({ loading: true, logourl: '' });
    let option = {
      uid: this.props.login.currentUser._id,
      category: 'logo',
      name: file.name.split('.')[0],
      unix: new Date().getTime(),
      type: file.name.split('.')[1],
    };
    let key = option.uid + '/' + option.category + '_' + option.unix + '.' + option.type;
    this.props.dispatch({
      type: 'oss/upload',
      payload: {
        key: key,
        file: file
      },
      callback: (url) => {
        this.setState({loading: false, logourl: url});
      }
    });
  };

  handleSelectPhoto = (value) => {
    this.props.form.setFieldsValue({
      logourl: value
    });
  };

  handleSubmitBasic = (e) => {
    e.preventDefault();

    if(!checkRole(this.state.role.roleid)) return;
    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys1, (err, values) => {
      if(!err){
        values._id = this.props.config.data._id;
        values.logourl = this.state.logourl;
        this.props.dispatch({
          type: 'config/saveConfig',
          payload: values,
          callback: (res) => {
            setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);
          }
        });
      }
    });
  };

  handleSubmitAdv = (e) => {
    e.preventDefault();

    if(!checkRole(this.state.role.roleid)) return;

    this.props.form.validateFields(keys1, (err, values) => {
      if(!err){
        console.log(values);
      }
    });
  };

  render(){

    const { form, config, oss } = this.props;
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

    const logourl = config.data ? config.data.logourl : this.state.logourl;

    return(
      <PageHeaderLayout>
        <Card>
          <Tabs defaultActiveKey="1" animated={false}>

            <TabPane tab="基本配置" key="1">
              <Row>
                <Col lg={6} md={24} sm={24}/>
                <Col lg={10} md={24} sm={24}>
                  <Form onSubmit={this.handleSubmitBasic}>
                    <FormItem {...formItemLayout} label="站点名称">
                      {getFieldDecorator('appname', {
                        initialValue: config.data ? config.data.appname : ENV.appname,
                        rules: [
                          { required: true, message: '站点名称不能为空！' },
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="网站地址">
                      {getFieldDecorator('siteurl', {
                        initialValue: config.data ? config.data.siteurl : ENV.siteurl,
                        rules: [
                          { required: true, message: '站点名称不能为空！' },
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="关键词">
                      {getFieldDecorator('sitekeywords', {
                        initialValue: config.data ? config.data.sitekeywords : null,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="描述">
                      {getFieldDecorator('sitedesc', {
                        initialValue: config.data ? config.data.sitedesc : null,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <TextArea autosize={{minRows: 4, maxRows: 8}} placeholder=""/>
                      )}
                    </FormItem>

                    <Divider dashed />

                    <FormItem {...formItemLayout} label="网站logo">
                      {getFieldDecorator('logourl', {})(
                        <UploadPhoto category="logo" url={logourl} callback={this.handleSelectPhoto} />
                      )}
                    </FormItem>

                    <Divider dashed />

                    <FormItem {...formItemLayout} label="公司名称">
                      {getFieldDecorator('company', {
                        initialValue: config.data ? config.data.company : null,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="公司地址">
                      {getFieldDecorator('address', {
                        initialValue: config.data ? config.data.address : null,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="公司电话">
                      {getFieldDecorator('tel', {
                        initialValue: config.data ? config.data.tel : null,
                        rules: [
                          { pattern: /^[0-9-]+$/, message: '输入格式有误！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>

                    <Divider dashed />

                    <FormItem {...formItemLayout} label="电子邮箱">
                      {getFieldDecorator('siteemail', {
                        initialValue: config.data ? config.data.siteemail : null,
                        rules: [
                          { type: 'email', message: '输入格式有误！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="QQ号码">
                      {getFieldDecorator('qq', {
                        initialValue: config.data ? config.data.qq : null,
                        rules: [
                          { pattern: /^[0-9]+$/, message: '输入格式有误！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="备案信息">
                      {getFieldDecorator('copyright', {
                        initialValue: config.data ? config.data.copyright : null,
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9-,.]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
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

            <TabPane tab="高级配置" key="2">
              <Row>
                <Col lg={6} md={24} sm={24}/>
                <Col lg={10} md={24} sm={24}>
                  <Form onSubmit={this.handleSubmitAdv}>
                    <FormItem {...formItemLayout} label="数据库">
                      {getFieldDecorator('database', {
                        rules: [
                          { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                        ],
                      })(
                        <Input style={{ width: '100%' }} placeholder=""/>
                      )}
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
