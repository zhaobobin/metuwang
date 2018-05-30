import {request} from "../utils/request";

export default {
  namespace: 'role',

  state: {
    loading: false,
    submitting: false,
    total: 1,
    list: [],
    detail: {},
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/RoleList', {method: 'POST', body: params,})},
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
    *add({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/RoleAdd', {method: 'POST', body: params,})},
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
        (params) => {return request('/api/RoleUpdate', {method: 'POST', body: params,})},
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
        (params) => {return request('/api/RoleDel', {method: 'POST', body: params,})},
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
    changeList(state, { payload }) {
      return {
        ...state,
        total: payload.total,
        list: payload.data,
      };
    },
  }

}
