

const config = require('../config/index')
const tool = require('../tool/index');
const sqlModel = require('../sql/sqlModel.js');
const MongoDbServer = require('../sql/mongodb.js')


const checkVersion = function() {
    return new Promise((resolve, reject) => {
        debugger
        let timer = setInterval(() => {
            if (MongoDbServer.MongoDb) {
                clearInterval(timer);
                var currentVersion = config.project_node_version

                var tableName = 'Project_Config_Version';
                console.log('==========检查版本更新==========');
                console.log('最新版本：' + currentVersion);

                var query = {
                    version: currentVersion
                }
                sqlModel.findOne({
                    tableName: tableName,
                }).then(function(result) {
                    if (result) {
                        var oldVersion = result.version
                        //比较两个版本号
                        if (currentVersion <= oldVersion) {
                            console.log('当前版本：' + result.version);
                            console.log('========当前已是最新版本========\n');
                            return resolve();
                        } else {
                            console.log('当前版本：' + result.version);
                            console.log('即将从当前版本 ' + result.version + ' 更新到最新版本 ' + currentVersion);
                            var file = `${oldVersion}_${currentVersion}` //VX.X.X_VX.X.X
                            //此版本的更新操作...
                            console.time('更新耗时');

                            const updatePromise = require(`./${file}`);
                            updatePromise().then(() => {
                                sqlModel.updateStatisticsRecord({
                                    tableName: tableName,
                                    filter: {
                                        version: oldVersion
                                    },
                                    data: {
                                        $set: {
                                            version: currentVersion
                                        }
                                    }
                                }).then(function(result) {
                                    console.timeEnd('更新耗时');
                                    console.log('==========版本更新完成==========\n');
                                    resolve();
                                })
                            }).catch(err => {
                                // console.log(err);
                                reject(err);
                            })
                        }
                    }/* else {
                        console.log('不存在版本，插入')
                        sqlModel.inserStatisticsRecord({
                            tableName: tableName,
                            data: query
                        }).then(function(result) {
                            console.log('insert version success')
                            //此版本的更新操作
                            // removeProtocal()
                            resolve();
                        })
                    }*/
                }).catch(function(err) {
                    // console.log('更新版本操作出现错误' + err)
                    reject('更新版本操作出现错误' + err);
                })
            } else {
                console.log('数据库未初始化完成');
            }
        }, 500);


    })
}

module.exports = checkVersion;