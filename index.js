
//检查项目更新
const checkVersion = require('./versionUpdate/checkVersion');

checkVersion().then(() => {
    
    const bodyParser = require('body-parser');
    const express = require('express');
    const app = express();

    //获取路由
    const apiRouter = require('./router/api.js');


    //处理设置请求数据
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: false
    }));


    //允许跨域
    app.all('*', function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        if (/Safari/gi.test(req.headers['user-agent'])) {
            res.header("Access-Control-Allow-Headers", 'keepObserver-reportAjax,authorization,Origin, X-Requested-With, Content-Type, Accept');
        } else {
            res.header("Access-Control-Allow-Headers", '*');
        }
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
        res.header("Content-Type", "application/json;charset=utf-8");
        res.header("X-Powered-By", ' 3.2.1')
        if (req.method === 'OPTIONS') {
            res.status(200).send('ok');
        } else {
            next();
        }
    });



    //api路由
    app.use('/api', apiRouter);




    // 开始监听端口
    app.listen(3000);
})
.catch(err => {
    console.log(err);
})