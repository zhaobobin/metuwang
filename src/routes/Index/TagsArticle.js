/*
* 标签文章列表
* */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Row, Col, Tabs} from 'antd';
import {ENV} from "../../utils/utils";
import styles from './TagsArticle.less';

import TagsArticleQuery from '../../components/Tags/TagsArticleQuery'

const TabPane = Tabs.TabPane;

@connect(state => ({
  article: state.article,
}))
export default class TagsArticle extends PureComponent {

  state = {
    tag: this.props.match.params.tag,
    tabKey: '1',
    total: 0
  };

  handleTab = (key) => {
    this.setState({tabKey: key})
  };

  queryResult = (total) => {
    this.setState({total: total})
  };

  render(){

    const {tag, tabKey, total} = this.state;

    return(

      <div className={styles.tagArticle}>

        <div className={styles.head}>
          <span><strong>{tag}</strong></span>
          <span className={styles.total}>{total} 组作品</span>
        </div>

        <Tabs defaultActiveKey={tabKey}
              animated={false}
              onChange={this.handleTab}
        >
          <TabPane tab="热门" key="1">
            {tabKey === '1' ? <TagsArticleQuery tag={tag} sort={{views: -1}} callback={this.queryResult} /> : null}
          </TabPane>
          <TabPane tab="最新" key="2">
            {tabKey === '2' ? <TagsArticleQuery tag={tag} sort={{_id: -1}} callback={this.queryResult} /> : null}
          </TabPane>
        </Tabs>

      </div>

    )
  }

}
