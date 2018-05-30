import {request} from "../utils/request";

export default {
  namespace: 'photo',

  state: {
    total: 0,
    list: [],
    detail: {},
    swiper: {},
    hasMore: true,
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/PhotoList', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      // yield put({
      //   type: 'changeList',
      //   payload: response,
      // });
    },
    *listByUser({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/PhotoListByUser', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *detail({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/PhotoDetail', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      // yield put({
      //   type: 'changeDetail',
      //   payload: response,
      // });
    },
    *swiper({ payload }, { call, put }) {
      yield put({
        type: 'changeSwiper',
        payload: payload,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/PhotoAdd', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/PhotoUpdate', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *del({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/PhotoDel', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *delkey({ payload }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/PhotoDelKey', {method: 'POST', body: params,})},
        payload
      );
    },
  },

  reducers: {
    changeList(state, { payload }) {
      return {
        ...state,
        total: payload.total,
        list: payload.data,
        hasMore: payload.hasMore
      };
    },
    changeDetail(state, { payload }) {
      return {
        ...state,
        detail: payload.data,
      };
    },
    changeSwiper(state, { payload }) {
      return {
        ...state,
        detail: payload,
      };
    },
  }

}
