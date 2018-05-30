import {request} from "../utils/request";

export default {
  namespace: 'comment',

  state: {
    aid: '',                            //文章id
    hasMore: true,
    currentPage: 1,
    total: 0,
    list: [],
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/CommentList', {method: 'POST', body: params,})},
        payload
      );
      response.aid = payload.aid;
      yield callback(response);
      yield put({
        type: 'changeList',
        payload: response,
      });
    },
    *replyList({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/CommentReplyList', {method: 'POST', body: params,})},
        payload
      );
      response._id = payload._id;
      yield callback(response);
      yield put({
        type: 'changeReplyList',
        payload: response,
      });
    },
    *replyToggle({ payload, callback }, { call, put }) {
      yield callback(payload);
      yield put({
        type: 'toggleReplyList',
        payload: payload,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/CommentAdd', {method: 'POST', body: params,})},
        payload
      );
      if(payload.commentId) response.commentId = payload.commentId;
      yield callback(response);
      yield put({
        type: 'changeAdd',
        payload: response,
      });
    },
    *del({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/CommentDel', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *report({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/CommentReport', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);
    },
    *like({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/CommentLike', {method: 'POST', body: params,})},
        payload
      );
      response.commentId = payload.commentId;
      yield callback(response);
      yield put({
        type: 'changeLike',
        payload: response,
      });
    },
  },

  reducers: {

    clearList(){
      return {
        aid: '',
        hasMore: true,
        currentPage: 1,
        total: 0,
        list: [],
      };
    },
    changeList(state, { payload }) {
      let list = state.list,
        currentPage = state.currentPage;

      if(payload.hasMore) currentPage += 1;
      list = list.concat(payload.data);
      for(let i in list){
        if(!list[i].replyList) list[i].replyList = [];list[i].currentPage = 1
      }
      return {
        ...state,
        aid: payload.aid,
        currentPage: currentPage,
        list: list,
        hasMore: payload.hasMore,
        total: payload.total,
      };
    },
    changeAdd(state, { payload }) {
      let total = state.total + 1,
        list = state.list,
        data = payload.data;
      //判断是不是对回复对评论
      if(payload.commentId){
        for(let i in list){
          if(list[i]._id === payload.commentId){
            list[i].replyList.unshift(data);
            list[i].reply.unshift(data._id);
          }
        }
      }else{
        list.unshift(data);
      }
      return {
        ...state,
        total: total,
        list: list,
      };
    },
    changeLike(state, { payload }) {
      let list = state.list,
      data = payload.data;
      for(let i in list){
        //判断是不是对回复对评论
        if(payload.commentId){
          if(list[i]._id === payload.commentId){
            for(let j in list[i].replyList){
              if(list[i].replyList[j]._id === data._id) list[i].replyList[j].like = data.like;
            }
          }
        }else{
          if(list[i]._id === data._id) list[i].like = data.like;
        }
      }
      return {
        ...state,
        list: list,
      };
    },
    toggleReplyList(state, { payload, callback }){
      let list = state.list;
      for(let i in list){
        if(list[i]._id === payload._id){
          list[i].isVisible = payload.isVisible;               //是否显示
        }
      }
      return {
        ...state,
        list: list,
      };
    },
    changeReplyList(state, { payload }) {
      let list = state.list;
      for(let i in list){
        if(list[i]._id === payload._id){
          if(payload.hasMore) list[i].currentPage += 1;                               //当前页数
          list[i].hasMore = payload.hasMore;                                          //是否有下一页
          list[i].isVisible = true;                                                   //是否显示
          list[i].replyList = (list[i].currentPage === 1) ? payload.data : list[i].replyList.concat(payload.data);
        }
      }
      return {
        ...state,
        list: list,
      };
    },
  }

}
