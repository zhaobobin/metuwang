/*
 * 器材列表
 * <EquipmentExplore />
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Link, NavLink } from 'dva/router';
import { Card, Table, Pagination, notification } from 'antd';
import {Storage} from "../../utils/utils";

@connect(state => ({
  equipments: state.equipments,
}))
export default class EquipmentExplore extends PureComponent {

  render(){
    return(
      <div>
        器材管理
      </div>
    )
  }

}
