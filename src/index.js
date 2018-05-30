import 'babel-polyfill';
import dva from 'dva';
import 'moment/locale/zh-cn';
import './rollbar';
import './base.less';
import router from './router';
import browserHistory from 'history/createBrowserHistory';

const history = process.env.NODE_ENV === 'production' ? {history: browserHistory()} : {};

// 1. Initialize
const app = dva(history);

// 2. Plugins
// app.use({});

// 3. Register global model
app.model(require('./models/global'));

// 4. Router
app.router(router);

// 5. Starta
app.start('#root');
