/*
 * 器材
 */
import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { Row, Col, Menu } from 'antd';

import styles from './IndexBase.less';

import EquipmentExplore from '../../components/Equipment/EquipmentExplore'
import EquipmentList from '../../components/Equipment/EquipmentList'

export default class Equipments extends PureComponent {

  state = {
    keyword: this.props.match.params.keyword ? this.props.match.params.keyword.split('-')[0] : 'explore', //type-brand-model 类型-品牌-型号
    headerFixed: '',
  };

  componentDidMount(){
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.match.params.keyword !== this.state.keyword) {
      this.setState({keyword: nextProps.match.params.keyword})
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

    const {keyword} = this.state;
    const current = keyword.split('-')[0];
    //console.log(current)

    return(

      <div className={styles.container}>

        <div className={styles.menu+" "+this.state.headerFixed}>
          <Row>
            <Col xs={0} sm={0} md={3} lg={5} />
            <Col xs={24} sm={24} md={18} lg={14}>

              <Menu
                mode="horizontal"
                selectedKeys={[current]}
                style={{background: 'none', border: 'none'}}
              >
                <Menu.Item key="explore">
                  <Link to="/equipments/explore">全部</Link>
                </Menu.Item>
                <Menu.Item key="camera">
                  <Link to="/equipments/camera">相机</Link>
                </Menu.Item>
                <Menu.Item key="lens">
                  <Link to="/equipments/lens">镜头</Link>
                </Menu.Item>
                {/*<Menu.Item key="phone">*/}
                  {/*<Link to="/equipments/phone">手机</Link>*/}
                {/*</Menu.Item>*/}
              </Menu>

            </Col>
            <Col xs={0} sm={0} md={3} lg={5} />
          </Row>
        </div>

        <div className={styles.content}>
          <Row>
            <Col xs={0} sm={0} md={3} lg={5} />
            <Col xs={24} sm={24} md={18} lg={14}>

              {
                keyword === 'explore' ?
                  <EquipmentExplore />
                  :
                  <EquipmentList keyword={this.state.keyword}/>
              }

            </Col>
            <Col xs={0} sm={0} md={3} lg={5} />
          </Row>
        </div>

      </div>

    )

  }

}
