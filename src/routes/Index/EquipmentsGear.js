/*
 * 器材详情 品牌列表、设备列表
 */
import React, { PureComponent } from 'react';
import { Link } from 'dva/router';
import { Row, Col } from 'antd';

import styles from './IndexBase.less';

export default class EquipmentsGear extends PureComponent {

  state = {
    keyword: this.props.match.params.keyword ? this.props.match.params.keyword : null,
  };

  componentDidMount(){
    let {keyword} = this.state;
    //console.log(keyword)
    if(keyword.split('/')[1]){
      this.queryModelList()                       //查询型号
    }else{
      this.queryBrandList()                       //查询品牌
    }
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.match.params.keyword !== this.state.keyword) {

    }
  }

  queryBrandList(){

  }

  queryModelList(){

  }

  render(){

    const {name} = this.state;

    return(

      <div className={styles.container}>

        设备详情

      </div>

    )

  }

}
