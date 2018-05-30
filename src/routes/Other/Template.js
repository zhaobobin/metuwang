/**
 * 站点配置
 */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Card, Tabs, Divider, Upload, notification } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import {ENV, hasErrors} from '../../utils/utils';

const TabPane = Tabs.TabPane;
const FormItem = Form.Item;

@connect(state => ({
  login: state.login,
  admin: state.admin,
}))
@Form.create()
export default class Template extends Component {

  state = {
    role: this.props.login.currentUser.role,
  };

  componentDidMount(){
    this.props.dispatch({
      type: 'admin/list',
      payload: {},
      callback: (res) => {

      }
    });
  }

  render(){

    const { form } = this.props;
    const { getFieldDecorator, getFieldsError } = form;

    return(
      <PageHeaderLayout>
        <Card>
          <Tabs defaultActiveKey="1" animated={false}>

            <TabPane tab="标签一" key="1">
              空模版111
            </TabPane>

            <TabPane tab="标签二" key="2">
              空模版222
            </TabPane>

          </Tabs>
        </Card>
      </PageHeaderLayout>
    )
  }

}
