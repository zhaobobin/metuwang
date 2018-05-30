import {request} from "../utils/request";

export default {
  namespace: 'admin',

  state: {
    loading: false,
    submitting: false,
    total: 1,
    list: [],
    detail: {},
    count: '',
  },

  effects: {
    *count({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/AdminCount', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeCount',
        payload: response,
      });
    },
    *list({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/AdminList', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeList',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *detail({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/AdminDetail', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeDetail',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *add({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/AdminRegister', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    *update({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/AdminUpdate', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    *updatePsd({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/AdminUpdatePsd', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
    *del({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/AdminDel', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeSubmitting',
        payload: false,
      });
    },
  },

  reducers: {
    changeLoading(state, { payload }) {
      return {
        ...state,
        loading: payload,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
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

  }

}
