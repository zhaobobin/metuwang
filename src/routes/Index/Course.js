import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import {Row, Col, Card} from 'antd';

import styles from './IndexBase.less';

import ArticleListQuery from '../../components/Article/ArticleListQuery'
import ArticleRank from '../../components/Article/ArticleRank'
import TagsRank from '../../components/Tags/TagsRank'

@connect(state => ({
  article: state.article,
}))
export default class Course extends PureComponent {

  render(){

    const category = "5a700610b6292513d962420a";
    const catedir = "course";

    return(

      <Row>

        <Col xs={0} sm={0} md={2} lg={3} />

        <Col xs={24} sm={24} md={15} lg={13}>

          <Card title="教程">
            <ArticleListQuery category={category} catedir={catedir}/>
          </Card>

        </Col>

        <Col xs={0} sm={0} md={5} lg={5}>
          <div className={styles.slide}>
            <Card title="推荐阅读" className={styles.card}>
              <ArticleRank modelType="article" pageSize={10}/>
            </Card>
            <Card title="热门标签" extra={<Link to="/tags" className={styles.more}>更多</Link>} className={styles.card}>
              <TagsRank itemsPerPage={10}/>
            </Card>
          </div>
        </Col>

        <Col xs={0} sm={0} md={2} lg={3} />

      </Row>

    )
  }

}
