import {request} from '../utils/request';

export default {
  namespace: 'user',

  state: {
    total: 1,
    list: [],
    detail: {},
    count: '',
  },

  effects: {
    *count({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserCount', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeCount',
        payload: response,
      });
    },
    *list({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserList', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeList',
        payload: response,
      });
    },
    *detail({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserDetail', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      // yield put({
      //   type: 'changeDetail',
      //   payload: response,
      // });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserRegister', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserUpdate', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *updatePsd({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserUpdatePsd', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *del({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/UserDel', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
  },

  reducers: {
    changeCount(state, { payload }) {
      return {
        ...state,
        count: payload.data,
      };
    },

    changeList(state, { payload }) {
      return {
        ...state,
        total: payload.total,
        list: payload.data,
      };
    },
    changeDetail(state, { payload }) {
      return {
        ...state,
        detail: payload.data,
      };
    },
  },
};
