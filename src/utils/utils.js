import moment from 'moment';
import { notification } from 'antd';

export const ENV = {
  appname: '迷图网',
  sysname: '迷图网管理系统',
  siteurl: 'www.metuwang.com',
  sitelink: 'http://www.metuwang.com',
  copyright: '2017 掘金者科技出品'
};

export const Storage = {
  set: function(key, data) {	//保存
    return window.localStorage.setItem(key, window.JSON.stringify(data));
  },
  get: function(key) {			//查询
    return window.JSON.parse(window.localStorage.getItem(key));
  },
  remove: function(key) {	//删除
    return window.localStorage.removeItem(key);
  }
};

/*************************** 工具函数 ***************************/

//浏览器后退
export function goBack(){
  if ((navigator.userAgent.indexOf('MSIE') >= 0) && (navigator.userAgent.indexOf('Opera') < 0)){ // IE
    if(window.history.length > 0){
      window.history.go(-1);
    }else{
      window.location.href = this.ENV.siteUrl
    }
  }else{ //非IE浏览器
    if (navigator.userAgent.indexOf('Firefox') >= 0 ||
      navigator.userAgent.indexOf('Opera') >= 0 ||
      navigator.userAgent.indexOf('Safari') >= 0 ||
      navigator.userAgent.indexOf('Chrome') >= 0 ||
      navigator.userAgent.indexOf('WebKit') >= 0){

      if(window.history.length > 1){
        window.history.go(-1);
      }else{
        window.location.href = this.ENV.siteUrl
      }
    }else{ //未知的浏览器
      window.history.go(-1);
    }
  }
}

//检查操作权限
export function checkRole(roleid) {
  if(roleid === 9){
    return true;
  }else{
    notification.error({ message: '只有超级管理员有权操作！' });
    return false;
  }
}

//过滤文字中的特殊符号
export function filterStr(str){
  let pattern = new RegExp("[`~@#$^&|\\<>/~@#￥&]");
  let specialStr = "";
  for(let i=0;i<str.length;i++){
    specialStr += str.substr(i, 1).replace(pattern, '');
  }
  return specialStr;
}

export function hasErrors(fieldsError) {
  return Object.keys(fieldsError).some(field => fieldsError[field]);
}

//文件转为base64
export function file2base64(file, cb){

  let base64 = '', reader = new FileReader();

  reader.readAsDataURL(file);
  reader.onload = function(e) {

    base64 = e.target.result;

    let img = new Image();
    img.src = base64;
    img.onload = function(){
      let data = {
        base64: base64,
        width: this.width,
        height: this.height
      };
      return cb(data);
    };

  };
}

export function toBase64(file){

  return new Promise(function(resolve, reject){
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(e) {
      resolve(e.target.result)
    };
  })

}

export function img2base64(imgUrl, cb){

  let base64 = '',
    img = new Image(),
    cav = document.createElement('canvas'),
    ctx = cav.getContext('2d');

  img.src = imgUrl;
  img.onload = function() {
    cav.width = img.width;
    cav.height = img.height;
    ctx.drawImage(img, 0, 0);					//img转换为canvas
    base64 = cav.toDataURL('images/jpeg');
    return cb(base64);
  };
}

export function fixedZero(val) {
  return val * 1 < 10 ? `0${val}` : val;
}

export function getTimeDistance(type) {
  const now = new Date();
  const oneDay = 1000 * 60 * 60 * 24;

  if (type === 'today') {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return [moment(now), moment(now.getTime() + (oneDay - 1000))];
  }

  if (type === 'week') {
    let day = now.getDay();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);

    if (day === 0) {
      day = 6;
    } else {
      day -= 1;
    }

    const beginTime = now.getTime() - (day * oneDay);

    return [moment(beginTime), moment(beginTime + ((7 * oneDay) - 1000))];
  }

  if (type === 'month') {
    const year = now.getFullYear();
    const month = now.getMonth();
    const nextDate = moment(now).add(1, 'months');
    const nextYear = nextDate.year();
    const nextMonth = nextDate.month();

    return [moment(`${year}-${fixedZero(month + 1)}-01 00:00:00`), moment(moment(`${nextYear}-${fixedZero(nextMonth + 1)}-01 00:00:00`).valueOf() - 1000)];
  }

  if (type === 'year') {
    const year = now.getFullYear();

    return [moment(`${year}-01-01 00:00:00`), moment(`${year}-12-31 23:59:59`)];
  }
}

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach((node) => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;

    if(item.children){
      arr.push(...getPlainNode(item.children, item.path));
    }
    if (item.children && !item.component){
      item.exact = false;
    }
    arr.push(item);

    // if (item.children && !item.component) {
    //   arr.push(...getPlainNode(item.children, item.path));
    // } else {
    //   if (item.children && item.component) {
    //     item.exact = false;
    //   }
    //   arr.push(item);
    // }

  });
  return arr;
}

export function digitUppercase(n) {
  const fraction = ['角', '分'];
  const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
  const unit = [
    ['元', '万', '亿'],
    ['', '拾', '佰', '仟'],
  ];
  let num = Math.abs(n);
  let s = '';
  fraction.forEach((item, index) => {
    s += (digit[Math.floor(num * 10 * (10 ** index)) % 10] + item).replace(/零./, '');
  });
  s = s || '整';
  num = Math.floor(num);
  for (let i = 0; i < unit[0].length && num > 0; i += 1) {
    let p = '';
    for (let j = 0; j < unit[1].length && num > 0; j += 1) {
      p = digit[num % 10] + unit[1][j] + p;
      num = Math.floor(num / 10);
    }
    s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
  }

  return s.replace(/(零.)*零元/, '元').replace(/(零.)+/g, '零').replace(/^整$/, '零元整');
}





