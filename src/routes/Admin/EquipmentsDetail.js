/**
 * 器材详情
 */
import React, { PureComponent } from 'react';
import { Card } from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import Editor from '../../components/Article/Editor';

export default class EquipmentsDetail extends PureComponent {

  render(){

    return(
      <PageHeaderLayout>

        <Card>
          <Editor id={this.props.match.params.id}/>
        </Card>

      </PageHeaderLayout>
    )
  }

}
