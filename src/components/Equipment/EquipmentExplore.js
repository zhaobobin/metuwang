/*
 * 器材列表
 * <EquipmentExplore />
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link, NavLink } from 'dva/router';
import { Card, Table, Pagination, notification } from 'antd';
import {Storage} from "~/utils/utils";

import styles from './Equipment.less';

@connect(state => ({
  equipments: state.equipments,
}))
export default class EquipmentExplore extends PureComponent {

  state = {
    camera: [],
    lens: [],
  };

  componentDidMount(){
    this.queryEquipmentExplore()
  }

  queryEquipmentExplore(){
    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.dispatch({
      type: 'equipments/explore',
      payload: {},
      callback: (res) => {
        window.scrollTo(0, 0);
        Storage.set('metu-ajaxFlag', true);
        this.setState({
          camera: res.camera,
          lens: res.lens
        })
      }

    })
  }

  render(){

    const {camera, lens} = this.state;

    const cameraList = camera.length > 0 ?
        camera.map((item, index) => (
          <dl>
            <dt><Link to="">Canon(佳能)</Link></dt>
            <dd>

            </dd>
          </dl>
        ))
      : null;


    return(
      <div className={styles.explore}>

        <div className={styles.section}>
          <div className={styles.title}>
            <h2>数码单反相机</h2>
            <Link to="/">更多</Link>
          </div>
          <div className={styles.list}>

          </div>
        </div>

      </div>
    )
  }

}
