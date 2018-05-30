import {request} from "../utils/request";

export default {
  namespace: 'equipments',

  state: {
    loading: false,
    submitting: false,
    list: [],
    detail: {},
  },

  effects: {
    *explore({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/EquipmentExplore', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *list({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/EquipmentList', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/EquipmentAdd', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/EquipmentUpdate', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *del({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/EquipmentDel', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
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
