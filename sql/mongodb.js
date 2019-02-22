const MongoClient = require('mongodb').MongoClient;
const config = require('../config/index.js')
const tool = require('../tool/index.js');



//mongodb操作库
class MongoDb {
    constructor() {
        //保存mongoDB连接实例
        this.MongoDb = false;
        this.dbName = config.mongodbName
        this.dbUrl = config.mongodbUrl
        //启动
        this._init();
    }

    //初始化
    _init() {
        var self = this;
        MongoClient.connect(self.dbUrl, {
            useNewUrlParser: true
        }, function(err, db) {
            if (err) throw err;
            console.log("数据库已链接!\n");
            self.MongoDb = db;
        });
    }

    /*
    	关闭数据库链接
     */
    close() {
        if (!this.MongoDb) {
            return false;
        }
        this.MongoDb.close();
        console.log("数据库已关闭!");
    }


    /*
        使用sql
        ---------
        .params object =  {
            method  string              sql执行方法
            params  array               sql执行方法传参
            onHook  function            sql执行方法回调
        }
        --------
        return promise
    */
    use(exeParams) {
        var self = this;
        var defer = new Promise(function(resolve, reject) {
            //验证参数
            if (!tool.validateParams(self.MongoDb, exeParams) || tool.isEmptyArray(exeParams)) {
                reject('数据库链接失败,或传入查询条件不正确不正确')
                return false;
            }
            //打开数据库
            var database = self.MongoDb.db(self.dbName)
            if (!database) {
                reject('打开' + self.dbName + '数据库失败')
            }
            var exeLength = exeParams.length;
            //循环执行参数
            exeParams.forEach(function(exeItem, index) {
                //验证执行参数是否正确
                if (!tool.validateParams(exeItem) || !exeItem.method) {
                    reject('数据库执行参数不正确')
                    return false;
                }
                //开始执行
                var {
                    method,
                    params,
                    onHook,
                } = exeItem
                //验证是否存在
                if (!database[method] || !tool.isFunction(database[method])) {
                    reject('数据库执行方法不正确! 错误方法:' + method)
                    return false;
                }
                //修正参数
                if (!tool.isArray(params)) {
                    params = [];
                }
                //执行
                try {
                    database = database[method](...params, function(err, result) {
                        if (err) {
                            reject('数据库执行出现错误!错误方法:' + method + ' 错误内容:' + err)
                            return false;
                        }
                        //如果存在回调
                        if (onHook && tool.isFunction(onHook)) {
                            var newResult = onHook(err, result)
                            return newResult
                        }
                        //执行结束
                        if (index + 1 === exeLength) {
                            resolve(result)
                        }
                        return result
                    });
                } catch (err) {
                    reject('数据库执行出现错误!错误方法:' + method + ' 错误内容:' + err)
                }
            });
        })
        return defer
    }
}




const MongoDbInstance = new MongoDb()



module.exports = MongoDbInstance;