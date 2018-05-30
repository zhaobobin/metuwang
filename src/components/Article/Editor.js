/**
 * 文章编辑器
 * 图片ossList的两种状态，status: new、del
 * 保存时，删除status = del的图片
 * 取消时，删除status = new的图片
 * 修改时，status = old 变为 del
 */
import React, { PureComponent } from 'react';
import { Redirect, routerRedux } from 'dva/router';
import { connect } from 'dva';
import { Form, Input, Button, Icon, Row, Col, Select, Switch, Table, Divider, Upload, Modal, Popconfirm, notification } from 'antd';

import {Storage, hasErrors, file2base64} from '../../utils/utils';
import styles from './Editor.less'

import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import draftToMarkdown from 'draftjs-to-markdown';
import htmlToDraft from 'html-to-draftjs';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const { TextArea } = Input;
const { Option, OptGroup } = Select;

const keys = ['category', 'title', 'tags', 'description', 'copyright', 'status', 'allow_comment', 'focus'];

@connect(state => ({
  login: state.login,
  article: state.article,
  category: state.category,
  model: state.model,
  oss: state.oss,
  photo: state.photo
}))
@Form.create()
export default class ArticleEditor extends PureComponent {

  state = {
    submitting: false,
    role: this.props.login.currentUser.role,
    uid: this.props.login.currentUser._id,
    modelType: this.props.type ? this.props.type : '',    //模型类型
    editorState: EditorState.createEmpty(),
    help: '',
    photoList: [],                                        //暂存图片列表
    ossList: [],                                          //oss图片文件待删除列表，保存key
    detail: {
      thumb: '',
      category: '',
      parent: '',
      title: '',
      tags: '',
      description: '',
      content: '',
      status: true,
      allow_comment: true,
      focus: false,
      copyright: ''
    },
  };

  //初始化
  componentDidMount(){
    let id = this.props.id;
    if(id) this.queryArticleDetail(id);                                     //查询文章详情
    this.queryCateList();
  }

  componentWillReceiveProps(nextProps){
    if(nextProps.type && nextProps.type !== this.state.modelType){
      this.setState({modelType: nextProps.type});
    }
  }

  componentWillUnmount(){
    //组件卸载时，删除oss列表
    this.clearOssList();
  }

  //查询文章详情
  queryArticleDetail(id){
    this.props.dispatch({
      type: 'article/detail',
      payload: { id: id },
      callback: (res) => {
        if(res.status === 1){
          let modelType = '',
            category = this.props.category.list;
          for(let i in category){
            if(category[i]._id === res.data.category._id){
              modelType = category[i].model.type
            }
          }
          if(modelType === 'article'){

            let html = res.data.content;
            const blocksFromHtml = htmlToDraft(html);
            const { contentBlocks, entityMap } = blocksFromHtml;
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            const editorState = EditorState.createWithContent(contentState);
            this.setState({
              modelType: modelType,
              editorState: editorState,
              detail: res.data
            });
          }
          else if(modelType === 'photo'){
            let photoList = [],
              content = res.data.content;
            if(content) photoList = JSON.parse(content);
            this.setState({
              modelType: modelType,
              photoList: photoList,
              detail: res.data
            });
          }
        }
      }
    });
  }

  queryCateList(){
    this.props.dispatch({
      type: 'category/list',
      payload: { sort: this.state.sort },
      callback: (res) => {}
    });
  }

  //选择分类
  selectCategory = (id) => {
    let parent = '',
      modelType = '',
      category = this.props.category.tree;
    for(let i in category){
      if(category[i]._id === id){
        modelType = category[i].model.type
      }
      if(category[i].haschildren){
        for(let j in category[i].children){
          if(category[i].children[j]._id === id){
            parent = category[i]._id;
            modelType = category[i].children[j].model.type;
          }
        }
      }
    }
    if(parent){
      this.setState({
        modelType: modelType,
        detail: {
          ...this.state.detail,
          parent: parent
        }
      })
    }else{
      this.setState({
        modelType: modelType
      })
    }
  };

  //监控富文本变化
  onEditorStateChange = (editorState) => {
    this.setState({
      editorState: editorState,
      help: ''
    });
  };
  //检查富文本内容
  checkArticleContent = () => {
    let help = '',
      modelType = this.state.modelType;

    if(modelType === 'article'){
      let thumb = '',
        content = draftToMarkdown(convertToRaw(this.state.editorState.getCurrentContent()));
      if(content.length > 1){
        //自动截取缩略图
        let html = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
          reg = /<img[^>]*src[=\'\"\s]+([^\"\']*)[\"\']?[^>]*>/gi,
          src = reg.exec(html);
        if(src) thumb = src[1].split('?')[0];
      }else{
        help = '文章内容不能为空！'
      }
      this.setState({
        help: help,
        detail: {
          ...this.state.detail,
          thumb: thumb
        }
      });
    }
    if(modelType === 'photo'){
      if(this.state.photoList.length === 0){
        help = '图片列表不能为空！'
      }
      this.setState({
        help: help,
      });
    }

    return help;
  };

  //图片上传前检查
  beforeUpload = (file) => {
    const isImg = file.type.split('/')[1] === 'jpeg' || file.type.split('/')[1] === 'png';
    if (!isImg) {
      notification.error({message: '只能上传jpg、png图片文件!'});
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      notification.error({message: '图片文件的大小不能超过2MB!'});
    }
    return isImg && isLt2M;
  };

  //上传缩略图
  handleUploadThumb = ({ file }) => {
    this.setState({ submitting: true, detail: {...this.state.detail, thumb: ''} });
    let option = {
      uid: this.props.login.currentUser._id,
      category: 'thumb',
      name: file.name.split('.')[0],
      unix: new Date().getTime(),
      type: file.name.split('.')[1],
    };
    let key = option.uid + '/' + option.category + '_' + option.unix + '.' + option.type;

    this.props.dispatch({
      type: 'oss/upload',
      payload: {
        key: key,
        file: file
      },
      callback: (url) => {
        let ossList = this.addOssList(key);
        this.setState({
          submitting: false,
          ossList: ossList,
          detail: {...this.state.detail, thumb: url}
        });
      }
    });
  };

  //上传富文本图片
  editorImageUpload = file => {
    return new Promise(
      (resolve, reject) => {
        if(!this.beforeUpload(file)) return;
        let option = {
          uid: this.props.login.currentUser._id,
          category: 'article',
          name: file.name.split('.')[0],
          unix: new Date().getTime(),
          type: file.name.split('.')[1],
        };
        let key = option.uid + '/' + option.category + '_' + option.unix + '.' + option.type;

        this.props.dispatch({
          type: 'oss/upload',
          payload: {
            key: key,
            file: file
          },
          callback: (url) => {
            if(url){
              url += '?x-oss-process=style/thumb_l';
              resolve({ data: { link: url } });
              let ossList = this.addOssList(key);
              this.setState({
                ossList
              });
            }else{
              reject('error')
            }
          }
        });

      }
    );
  };

  //上传图片到oss
  handleUploadPhoto = ({file}) => {

    let photoList = this.state.photoList;
    if(photoList.length > 0){
      for(let i in photoList){
        //上传时排除文件名雷同的文件
        if(photoList[i].name === file.name) {
          notification.error({message: '已存在雷同的图片!', description: file.name});
          return false;
        }
      }
    }

    file2base64(file, (data) => {
      let imgData = {
        loading: true,                                          //加载状态
        key: '',                                                //对应oss中的键值
        name: file.name,                                        //完整文件名
        title: file.name.replace(/(.*\/)*([^.]+).*/ig,"$2"),    //文件标题
        base64: data.base64,                                    //用于显示上传时的缩略图
        url: '',                                                //图片路径，用于显示
        cover: false,                                           //是否作为封面,
      };
      photoList.push(imgData);
      this.setState({ submitting: true, photoList: photoList });
    });

    let option = {
      uid: this.props.login.currentUser._id,
      category: 'photo',
      name: file.name.split('.')[0],
      unix: new Date().getTime(),
      type: file.name.split('.')[1],
    };
    let key = option.uid + '/' + option.category + '_' + option.unix + '.' + option.type;

    this.props.dispatch({
      type: 'oss/upload',
      payload: {
        key: key,
        file: file
      },
      callback: (url) => {

        if(url){
          this.props.dispatch({
            type: 'oss/exif',
            payload: {url: url},
            callback: (exif) => {
              //console.log(exif)
              let name = file.name,
                thumb = this.state.detail.thumb,
                photoList = this.state.photoList,
                ossList = this.addOssList(key);                      //添加ossList列表

              for(let i in photoList){
                if(photoList[i].name === name){
                  photoList[i].key = key;
                  photoList[i].loading = false;
                  photoList[i].url = url;
                  photoList[i].exif = JSON.stringify(exif);
                  photoList[i].camera = exif.Make ? {
                    brand: exif.Make.value.split(' ')[0],
                    brandName: exif.Make.value.split(' ')[0].toLowerCase(),
                    model: exif.Model.value,
                    name: exif.Model.value.replace(/\s|\//g, '-').toLowerCase()
                  } : null ;
                  photoList[i].lens = {
                    brand: exif.LensModel.value.split(' ')[0],
                    brandName: exif.LensModel.value.split(' ')[0].toLowerCase(),
                    model: exif.LensModel.value,
                    name: exif.LensModel.value.replace(/\s|\//g, '-').toLowerCase()
                  };
                  photoList[i].composition = parseFloat((exif.ImageWidth.value / exif.ImageHeight.value).toFixed(2));
                  if(!thumb) {          //自动设置默认缩略图
                    thumb = url;
                    photoList[i].cover = true
                  }
                }
              }
              this.setState({
                submitting: false,
                ossList,
                photoList,
                detail:{
                  ...this.state.detail,
                  thumb: thumb
                }
              });
            }
          })
        }

      }
    });

  };

  //添加ossList列表
  addOssList(key){
    let canAdd = true,                                //避免重复添加
      item = {key: key, status: 'new'},               //save是否被保存，为false时会删除其在oss中对应的文件
      ossList = this.state.ossList;
    for(let i in ossList){
      if(ossList[i].key === key) canAdd = false
    }
    if(canAdd) ossList.push(item);
    return ossList
  }
  //更新ossList
  updateOssList(key){
    let ossList = this.state.ossList;
    for(let i in ossList){
      if(ossList[i].key === key) ossList[i].status = 'del'
    }
    return ossList
  }
  //清空ossList
  clearOssList(){
    let keys = [],
      ossList = this.state.ossList;
    for(let i in ossList){
      keys.push(ossList[i].key)
    }
    if(keys.length > 0) {
      this.props.dispatch({
        type: 'oss/del',
        payload: { keys: keys }
      });
    }
  }
  //删除ossList
  delOssList(cb){
    let keys = [],
      ossList = this.state.ossList;
    for(let i in ossList){
      if(!ossList[i].status === 'del') keys.push(ossList[i].key)
    }
    if(keys.length > 0){
      this.props.dispatch({
        type: 'oss/del',
        payload: { keys: keys }
      });
    }
    this.setState({ossList: []}, () => {
      return cb()
    })
  }
  //删除图片 - 仅删除暂存图片列表
  delPhoto(index){
    let photoList = this.state.photoList,
      key = photoList[index].key,
      url = photoList[index].url,
      thumb = this.state.detail.thumb,
      ossList = this.updateOssList(key);

    photoList.splice(index, 1);
    if(photoList.length > 0 && url === thumb){                     //避免缩略图缺省
      thumb = photoList[0].url
    }
    this.setState({
      ossList,
      photoList,
      detail: {
        ...this.state.detail,
        thumb: thumb
      }
    })
  }

  //修改图片列表标题
  changePhotoTitle(index, e){
    let photoList = this.state.photoList,
      value = e.target.value;
    if(value.length > 20){
      notification.error({message: '图片标题不能超过20个字!'});
      return;
    }
    photoList[index].title = value;
    this.setState({ photoList })
  };
  //修改封面
  changeCover(index){

    let photoList = this.state.photoList,
      thumb = photoList[index].url;

    for(let i in photoList){
      let c = parseInt(i);
      photoList[i].cover = c === index;
    }
    this.setState({
      photoList: photoList,
      detail: {
        ...this.state.detail,
        thumb: thumb
      }
    })
  }

  //添加photo
  addPhoto(id){
    let arr = [],
      uid = this.state.uid,
      photoList = this.state.photoList,
      ossList = this.state.ossList;

    for(let i in ossList){
      for(let j in photoList){
        if(ossList[i].status === 'new' && ossList[i].key === photoList[j].key){
          let photo = {
            uid: uid,
            album: [id],
            key: photoList[j].key,                                                //对应oss中的键值
            name: photoList[j].name,                                              //完整文件名
            title: photoList[j].title,                                            //文件标题
            tags: '',
            description: '',
            copyright: '',
            url: photoList[j].url,                                                //图片路径，用于显示
            exif: photoList[j].exif,                                              //图片路径，用于显示
            camera: photoList[i].camera,                                          //拍摄设备
            lens: photoList[i].lens,                                              //镜头
            composition: photoList[i].composition,                                //构图
            category: 'photo',                                                    //分类：照片
          };
          photo.thumb = photo.url;
          arr.push(photo);
        }
      }
    }

    this.props.dispatch({
      type: 'photo/add',
      payload: arr,
      callback: (res) => {
        if(res.status !== 1){
          notification.error({message: res.msg});
        }
      }
    });
  }

  //保存文章
  saveArticle(params){
    let api = '',
      _this = this,
      id = this.props.id;
    if(id){
      api = 'article/update';
      params.id = id;
    }else{
      api = 'article/add';
    }
    //保存时，执行ossDel列表对应文件的删除操作
    this.props.dispatch({
      type: api,
      payload: params,
      callback: (res) => {
        if(res.status === 1){
          if(res.data._id) id = res.data._id;           //新文章的id
          this.addPhoto(id);
          this.delOssList(function(){
            setTimeout(function(){
              if(_this.props.type){
                _this.props.dispatch(routerRedux.push('/u/'+_this.props.login.currentUser.username));
              }else{
                history.go(-1);
              }
            }, 500)
          });
        }else{
          notification.error({message: res.msg});
        }
      }
    });
  }

  //确认提交
  handleSubmit = (e) => {
    e.preventDefault();

    //if(!checkRole(this.state.role.roleid)) return;

    if(!Storage.get('metu-ajaxFlag')) return;
    Storage.set('metu-ajaxFlag', false);

    this.props.form.validateFields(keys, (err, values) => {
      if(!err){
        let modelType = this.state.modelType;

        values.modelType = modelType;
        values.uid = this.state.uid;                                                    //发布者id
        values.thumb = this.state.detail.thumb;                                         //缩略图
        if(this.state.detail.parent) values.parent = this.state.detail.parent;          //父级分类
        if(values.tags) values.tags = values.tags.join(',');                            //tags

        if(modelType === 'article'){                 //文章类型
          let help = this.checkArticleContent();
          if(help === ''){
            values.content = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
          }else{
            return false;
          }
          if(!values.description){                                                      //字段截取描述(最多200字)
            values.description = values.content.replace(/<\/?.+?>/g,"").substring(0, 197) + '...';
          }
        }

        else if(modelType === 'photo'){
          let help = this.checkArticleContent();
          if(help === ''){
            let arr = [],
              photoList = this.state.photoList;
            for(let i in photoList){
              let photo = {};
              photo.key = photoList[i].key;
              photo.name = photoList[i].name;
              photo.title = photoList[i].title;
              photo.url = photoList[i].url;
              photo.cover = photoList[i].cover;
              photo.exif = photoList[i].exif;
              photo.camera = photoList[i].camera;
              photo.lens = photoList[i].lens;
              arr.push(photo)
            }
            values.content = JSON.stringify(arr);
          }else{
            return false;
          }
        }

        this.saveArticle(values)

      }
    });

    setTimeout(() => { Storage.set('metu-ajaxFlag', true) }, 500);

  };

  //取消
  handleCancel = (e) => {
    e.preventDefault();
    confirm({
      title: '取消编辑?',
      okText: '确定',
      cancelText: '取消',
      content: '所有未保存的数据都将被清除！',
      onOk() {
        history.go(-1)
      },
      onCancel() {},
    });
  };

  render(){

    const { submitting, modelType, editorState, photoList, detail } = this.state;
    const { login, category, form, oss } = this.props;
    const { getFieldDecorator, getFieldsError } = form;

    const tags = ['风光','人像','人文','纪实','静物'];
    const tagsOption = tags.map((topic, index) => (
      <Option key={index} value={topic}>{topic}</Option>
    ));

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
        md: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 19 },
        md: { span: 19 },
      },
    };

    const formItemLayout2 = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
        md: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
        md: { span: 16 },
      },
    };

    const categoryOption = category.tree ?
      category.tree.map((topic, index) => (
        topic.haschildren ?
          <OptGroup key={topic._id} label={topic.name}>
            {
              topic.children.map((child, i) => (
                <Option key={child._id} value={child._id}>{child.name}</Option>
              ))
            }
          </OptGroup>
          :
          <Option key={topic._id} value={topic._id}>{topic.name}</Option>
      )) : null;

    const copyright = [
      {label: '非原创', value: 0},
      {label: '原创,CC0协议共享(非署名)', value: 1},
      {label: '原创,CC协议共享(署名)', value: 2},
      {label: '原创,CC协议共享(署名-非商业性使用)', value: 3},
      {label: '原创,CC协议共享(署名-禁止演绎)', value: 4},
      {label: '原创,CC协议共享(署名-相同方式共享)', value: 5},
      {label: '原创,CC协议共享(署名-非商业性使用-禁止演绎)', value: 6},
      {label: '原创,CC协议共享(署名-非商业性使用-相同方式共享)', value: 7}
    ];

    const copyrightOption = copyright.map((topic, index) => (
      <Option key={index} value={topic.value}>{topic.label}</Option>
    ));

    const Content = modelType === 'photo' ?
      <div className={styles.photoList}>
        <Row gutter={8}>
          {
            photoList.length > 0 ?
              photoList.map((topic, index) => (
                <Col span={6} key={index} className={styles.item}>
                  <div className={styles.imgBox}>
                    <p className={styles.url}>
                      <img src={topic.base64 ? topic.base64 : topic.url + '?x-oss-process=style/thumb_m'} alt={topic.title}/>
                      {
                        topic.loading ?
                          <span className={styles.loading}><Icon type='loading' /></span>
                          : ''
                      }
                    </p>
                    {topic.cover ? <p className={styles.border}/> : null}
                    <p className={styles.action}>
                      <span className={styles.cover} onClick={this.changeCover.bind(this, index)}><i>封</i></span>
                      <span className={styles.del} onClick={this.delPhoto.bind(this, index)}><Icon type="close" /></span>
                      {/*<span className={styles.exif}><i>exif</i></span>*/}
                    </p>
                  </div>
                  <div className={styles.title}>
                    <Input key={index} defaultValue={topic.title}
                      onChange={this.changePhotoTitle.bind(this, index)}
                      placeholder="图片标题不能超过20个字"
                    />
                  </div>
                </Col>
              )) : null
          }
          {
            photoList.length > 30 ?
              null :
              <Col span={6}>
                <Upload
                  accept=".jpg,.png"
                  name="photo"
                  listType="picture-card"
                  className={styles.upload}
                  multiple={true}
                  showUploadList={false}
                  beforeUpload={this.beforeUpload}
                  customRequest={this.handleUploadPhoto}
                >
                  <div>
                    <Icon type='plus' />
                    <div className="ant-upload-text">最多可上传30张图片<br/>文件大小不超过2MB</div>
                  </div>
                </Upload>
              </Col>
          }

        </Row>
      </div>
      :
      <div>
        <Editor
          editorState={editorState}
          toolbarClassName="home-toolbar"
          editorClassName="home-editor"
          onEditorStateChange={this.onEditorStateChange}
          toolbar={{
            image: {
              previewImage: true,
              alignmentEnabled: true,
              uploadCallback: this.editorImageUpload,
              inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
            }
          }}
          placeholder="请输入正文..."
          spellCheck
          onBlur={this.checkArticleContent}
          localization={{ locale: 'zh' }}
        />
        <style>
          {`
            .home-toolbar{
              border:1px solid #d9d9d9;
              border-radius:4px
            }
            .home-editor{
              height:400px;
              padding:10px 0 10px 10px;
              border:1px solid #d9d9d9;
              border-radius:4px
            }
            .home-editor img{max-width:100%;width:auto;height:auto;}
          `}
        </style>
      </div>;

    return(

        <Form onSubmit={this.handleSubmit}>

          <Row gutter={{ md: 8, lg: 24, xl: 48 }}>

            <Col md={16} sm={24}>
              <FormItem>

                { modelType ? Content : <div className={styles.loading}>请先选择分类...</div> }

                <p className="has-error" style={{height: '30px', lineHeight: '30px'}}>
                  <span className="ant-form-explain">{this.state.help}</span>
                </p>
                <Row>
                  <Col span={8}>
                    {
                      login.currentUser.role.roleid === 9 ?
                        <FormItem {...formItemLayout2} label="焦点推荐">
                          {getFieldDecorator('focus', {
                            valuePropName: 'checked',
                            initialValue: detail.focus ? detail.focus : false,
                          })(
                            <Switch />
                          )}
                        </FormItem>
                        : null
                    }
                  </Col>
                  <Col span={8}>
                    {
                      login.currentUser.role.roleid === 9 ?
                        <FormItem {...formItemLayout2} label="公开显示">
                          {getFieldDecorator('status', {
                            valuePropName: 'checked',
                            initialValue: detail.status ? detail.status : false,
                          })(
                            <Switch />
                          )}
                        </FormItem>
                        : null
                    }
                  </Col>
                  <Col span={8}>
                    <FormItem {...formItemLayout2} label="允许评论">
                      {getFieldDecorator('allow_comment', {
                        valuePropName: 'checked',
                        initialValue: detail.allow_comment ? detail.allow_comment : true,
                      })(
                        <Switch />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <p/>
              </FormItem>
            </Col>
            <Col md={8} sm={24}>
              <FormItem {...formItemLayout} label="缩略图">
                {getFieldDecorator('thumb', {})(
                  <Row>
                    <Col span={14}>
                      <Upload
                        accept=".jpg,.png"
                        name="thumb"
                        listType="picture-card"
                        className={styles.thumb}
                        showUploadList={false}
                        beforeUpload={this.beforeUpload}
                        customRequest={this.handleUploadThumb}
                      >
                        {
                          detail.thumb ?
                            <img src={detail.thumb + '?x-oss-process=style/thumb_m'}
                                 width="142px" height="142px" alt="thumb" />
                            :
                            <div>
                              <Icon type={submitting ? 'loading' : 'plus'} />
                              <div className="ant-upload-text">上传</div>
                            </div>
                        }
                      </Upload>
                    </Col>
                    <Col span={10}>
                      <p className="red">只能上传jpg、png图片，文件大小不能超过2MB。</p>
                    </Col>
                  </Row>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="分类">
                {getFieldDecorator('category', {
                  initialValue: detail.category ? detail.category._id : undefined,
                  rules: [
                    { required: true, message: '请选择文章分类！' }
                  ],
                })(
                  <Select style={{ width: '100%' }} placeholder="请选择文章分类" onChange={this.selectCategory}>
                    {categoryOption}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="标题">
                {getFieldDecorator('title', {
                  initialValue: detail.title ? detail.title : undefined,
                  rules: [
                    { required: true, message: '请输入文章标题！' },
                    { max: 20, message: '标题长度不能超过20个字！' },
                    { pattern: /^[\u0391-\uFFE5A-Za-z0-9,.]+$/, message: '不能输入特殊符号！' }
                  ],
                })(
                  <Input style={{ width: '100%' }} placeholder="标题长度不能超过20个字"/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="标签">
                {getFieldDecorator('tags', {
                  initialValue: detail.tags ? detail.tags.split(',') : undefined,
                })(
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="请输入标签并以逗号隔开"
                    tokenSeparators={[',', '，']}
                  >
                    {tagsOption}
                  </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="描述">
                {getFieldDecorator('description', {
                  initialValue: detail.description ? detail.description : undefined,
                  rules: [
                    { max: 200, message: '描述长度不能超过200个字！' },
                  ],
                })(
                  <TextArea style={{ width: '100%' }} placeholder="描述长度不能超过200个字" autosize={{ minRows: 2, maxRows: 4 }}/>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label="版权">
                {getFieldDecorator('copyright', {
                  initialValue: detail.copyright ? detail.copyright : undefined
                })(
                  <Select placeholder="请选择">
                    {copyrightOption}
                  </Select>
                )}
              </FormItem>

              <FormItem wrapperCol={{sm:{ offset: 5, span: 19 }, xs: { offset: 0, span: 24 }}}>
                <Button style={{ width: '100%' }}
                  type="primary"
                  htmlType="submit"
                  disabled={hasErrors(getFieldsError(keys)) || submitting}
                >保存</Button>
              </FormItem>
              <FormItem wrapperCol={{sm:{ offset: 5, span: 19 }, xs: { offset: 0, span: 24 }}}>
                <Button style={{ width: '100%' }} onClick={this.handleCancel}>取消</Button>
              </FormItem>
            </Col>

          </Row>

        </Form>
    )
  }

}
