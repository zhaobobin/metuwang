import {request} from "../utils/request";
import { routerRedux } from 'dva/router';
import { notification } from 'antd';
import {Storage} from '../utils/utils';

const userinfo = Storage.get('metu-userinfo');

export default {
  namespace: 'login',

  state: {
    isAuth: !!userinfo,
    captcha: '',
    submitting: false,
    currentUser: userinfo ? userinfo : {},
    modalVisible: false,                          //登录modal的显示状态
    tabKey: '',                                   //登录modal中tab的默认key
    lastUsername: Storage.get('metu-username') ? Storage.get('metu-username') : ''
  },

  effects: {
    *session({ payload }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/session', {method: 'POST', body: params,})},
        payload
      );
      yield put({
        type: 'changeLoginStatus',
        payload: {
          userinfo: response.data,
          isAuth: response.status === 1
        },
      });
      if (response.status !== 1) {
        if(Storage.get('metu-userinfo')){
          notification.error({
            message: '登录超时！',
            description: response.msg,
          });
        }
        Storage.remove('metu-userinfo');
      }
    },
    *refresh({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/AdminDetail', {method: 'POST', body: params,})},
        payload
      );
      if (response.status === 1) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            userinfo: response.data,
            isAuth: true
          },
        });
        Storage.set('metu-userinfo', response.data);
      }
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *adminRegister({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/AdminRegister', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *userRegister({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserRegister', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      if (response.status === 1) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            userinfo: response.data,
            isAuth: true
          },
        });
        Storage.set('metu-userinfo', response.data);
      }
    },
    *login({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/AdminLogin', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      //登录成功后的默认跳转
      if (response.status === 1) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            userinfo: response.data,
            isAuth: true
          },
        });
        Storage.set('metu-userinfo', response.data);
      }else{
        notification.error({
          message: '登录失败！',
          description: response.msg,
        });
      }
    },
    *logout({ payload }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/logout', {method: 'POST', body: params,})},
        payload
      );
      if (response.status === 1) {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            userinfo: {},
            isAuth: false
          },
        });
        Storage.remove('metu-userinfo');
      }else{
        notification.error({
          message: '退出失败！',
          description: response.msg,
        });
      }
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserUpdate', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      if (response.status === 1){
        yield put({
          type: 'changeCurrentUser',
          payload: {
            data: response.data
          },
        });
      }else{
        notification.error({
          message: '更新错误！',
          description: response.msg,
        });
      }

    },
    *collect({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserCollect', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeLoginStatus',
        payload: {
          userinfo: response.data,
          isAuth: true
        },
      });
    },
    *banner({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserBanner', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
  },

  reducers: {
    changeAuth(state, { payload }) {
      return {
        ...state,
        isAuth: payload,
      };
    },
    changeLoginStatus(state, { payload }) {
      let lastUsername = payload.isAuth ? payload.userinfo.username : state.lastUsername;
      return {
        ...state,
        currentUser: payload.userinfo,
        isAuth: payload.isAuth,
        submitting: false,
        lastUsername: lastUsername
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
    changeModal(state, { payload }) {
      return {
        ...state,
        modalVisible: payload.modalVisible,
        tabKey: payload.tabKey,
      };
    },
    changeCurrentUser(state, { payload }){
      return {
        ...state,
        currentUser: payload.data,
      };
    }
  },
};
