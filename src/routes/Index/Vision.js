/*
 * 影像
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link } from 'dva/router';
import { Row, Col, Menu } from 'antd';

import styles from './IndexBase.less';

import AlbumListQuery from '../../components/Photo/AlbumListQuery';

@connect(state => ({
  category: state.category,
}))
export default class Vision extends PureComponent {

  state = {
    currentKey: this.props.match.params.category ? this.props.match.params.category : 'popular',
    headerFixed: '',
  };

  componentDidMount(){
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.match.params.category !== this.state.currentKey) {
      this.setState({currentKey: nextProps.match.params.category})
    }
  }

  //监控滚动
  handleScroll(){
    let top = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
    if(top > 64){
      this.setState({headerFixed: styles.fixed})
    }else{
      this.setState({headerFixed: ''})
    }
  }

  render(){

    const {currentKey} = this.state;
    const {list} = this.props.category;
    let category = currentKey;

    for(let i in list){
      if(currentKey === list[i].name){
        category = list[i]._id
      }
    }

    return(

      <div className={styles.container}>

        <div className={styles.menu+" "+this.state.headerFixed}>
          <Row>
            <Col xs={0} sm={0} md={1} lg={1} />
            <Col xs={24} sm={24} md={22} lg={22}>

              <Menu
                mode="horizontal"
                selectedKeys={[currentKey]}
                style={{background: 'none', border: 'none'}}
              >
                <Menu.Item key="popular">
                  <Link to="/vision/popular">热门</Link>
                </Menu.Item>
                <Menu.Item key="editor">
                  <Link to="/vision/editor">推荐</Link>
                </Menu.Item>
                <Menu.Item key="new">
                  <Link to="/vision/new">最新</Link>
                </Menu.Item>
                <Menu.Item key="人像">
                  <Link to="/vision/人像">人像</Link>
                </Menu.Item>
                <Menu.Item key="人文">
                  <Link to="/vision/人文">人文</Link>
                </Menu.Item>
                <Menu.Item key="风光">
                  <Link to="/vision/风光">风光</Link>
                </Menu.Item>
              </Menu>

            </Col>
            <Col xs={0} sm={0} md={1} lg={1} />
          </Row>
        </div>

        <div className={styles.content}>
          <AlbumListQuery category={category} />
        </div>

      </div>

    )
  }

}
