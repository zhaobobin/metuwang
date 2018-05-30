import {request} from "../utils/request";

//递归
// function func(times){
//   if(times<=0) return;
//   $.get(url, data, function(){
//     times--;
//     func(times);
//   });
// }
// func(5);

export default {
  namespace: 'category',

  state: {
    loading: false,
    submitting: false,
    total: 1,
    list: [],
    tree: [],
    detail: {},
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      const response = yield call(
        (params) => {return request('/api/CateList', {method: 'POST', body: params,})},
        payload
      );
      yield callback(response);

      if(response.status === 1){
        let tree = [],
          list = response.data;
        if(list.length > 0){
          for(let i in list){

            if(!list[i].parent){

              list[i].haschildren = true;
              list[i].children = [];

              tree[i] = {
                _id: list[i]._id,
                index: list[i].index,
                model: list[i].model,
                name: list[i].name,
                catedir: list[i].catedir,
                tags: list[i].tags,
                description: list[i].description,
                show: list[i].show,
                hasparent: false,
                haschildren: false,
                children: []
              };

              for(let j in list){
                if(list[j].parent && list[j].parent._id === tree[i]._id){
                  let children = {
                    _id: list[j]._id,
                    index: list[j].index,
                    model: list[j].model,
                    name: list[j].name,
                    catedir: list[j].catedir,
                    tags: list[j].tags,
                    description: list[j].description,
                    show: list[j].show,
                    hasparent: true,
                    haschildren: false,
                  };
                  tree[i].haschildren = true;
                  tree[i].children.push(children);
                  list[i].children.push(children);
                }
              }

            }

          }
        }
        yield put({
          type: 'changeList',
          payload: {
            list: list,
            tree: tree
          },
        });
      }
    },
    *add({ payload, callback }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(
        (params) => {return request('/api/CateAdd', {method: 'POST', body: params,})},
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
        (params) => {return request('/api/CateUpdate', {method: 'POST', body: params,})},
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
        (params) => {return request('/api/CateDel', {method: 'POST', body: params,})},
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
        list: payload.list,
        tree: payload.tree,
      };
    },
  }

}
