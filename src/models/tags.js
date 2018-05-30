import {request} from "../utils/request";

export default {
  namespace: 'tags',

  state: {
    loading: false,
    submitting: false,
    tagsTotal: 1,
    tagsList: [],
    articleTotal: 1,
    articleList: [],
    detail: {},
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/TagsList', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *rank({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/TagsRank', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *article({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/TagsArticle', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/TagsAdd', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/TagsUpdate', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *del({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/TagsDel', {method: 'POST', body: params,})},
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

    changeTagsList(state, { payload }) {
      return {
        ...state,
        tagsTotal: payload.total,
        tagsList: payload.data,
      };
    },
    changeArticleList(state, { payload }) {
      return {
        ...state,
        articleTotal: payload.total,
        articleList: payload.data,
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
