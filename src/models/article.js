import {request} from "../utils/request";

export default {
  namespace: 'article',

  state: {
    loading: false,
    submitting: false,
    total: 1,
    list: [],
    welcome: '',
    rank: [],
    detail: {},
    currentPhoto: '',
    hasMore: true,
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/ArticleList', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      // yield put({
      //   type: 'changeList',
      //   payload: response,
      // });
    },
    *welcome({ payload }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/ArticleWel', {method: 'POST', body: params,})},
        payload
      );
      if(response.status === 1){
        yield put({
          type: 'changeWel',
          payload: response,
        });
      }
    },
    *rank({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/ArticleRank', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
      // yield put({
      //   type: 'changeRank',
      //   payload: response,
      // });
    },
    *detail({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/ArticleDetail', {method: 'POST', body: params,})},
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
        (params) => {return request('/api/ArticleAdd', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/ArticleUpdate', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *del({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/ArticleDel', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *like({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/ArticleLike', {method: 'POST', body: params,})},
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
        total: payload.total,
        list: payload.data,
        hasMore: payload.hasMore
      };
    },
    changeWel(state, { payload }) {
      return {
        ...state,
        welcome: payload.data
      };
    },
    changeRank(state, { payload }) {
      return {
        ...state,
        rank: payload.data
      };
    },
    changeDetail(state, { payload }) {
      let data = payload.data;
      if(typeof(data.content) === 'string') data.content = JSON.parse(data.content);			//转换图片列表数据
      if(data.tags && typeof(data.tags) === 'string') data.tags = data.tags.split(',');
      return {
        ...state,
        detail: data,
        currentPhoto: data.content[0],
      };
    },
    changeCurrent(state, { payload }) {
      return {
        ...state,
        currentPhoto: payload
      };
    }
  }

}
