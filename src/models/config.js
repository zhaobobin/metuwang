import {request} from "../utils/request";

export default {
  namespace: 'config',

  state: {
    loading: false,
    submitting: false,
    data: ''
  },

  effects: {
    *queryConfig({ payload }, { call, put }) {
      yield put({
        type: 'changeLoading',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/ConfigIndex', {method: 'POST', body: params,})},
        payload
      );
      yield put({
        type: 'changeData',
        payload: response,
      });
      yield put({
        type: 'changeLoading',
        payload: false,
      });
    },
    *saveConfig({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/ConfigSave', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      yield put({
        type: 'changeData',
        payload: response,
      });
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
    changeData(state, { payload }) {
      return {
        ...state,
        data: payload.data,
      };
    },
  }

}
