const tool = require('../../tool/index');
const sqlModel = require('../../sql/sqlModel');
// const statisticModel = require('../../sql/statisticData.js')
const {
    ajaxResult,
    ajaxFailResult
} = require('../tool/index.js');

//上报埋点数据过滤修改操作
const filterWebObserverRecord = function(res, params) {
    var {
        id,
        useActives,
        repeatCountAll
    } = params.data;
    var {
        reportTime,
        reportType,
        project,
        location
    } = params;
    // console.log('params', params)
    var tableName = 'Project_analysis_report_data';

    var channel = location.match(/(?<=\?)(.*)/) ? location.match(/(?<=\?)(.*)/)[0] : '';
    if (reportType.indexOf('H5') > -1) {
        channel = location.match(/^.*\?(.*?)(?:#.*)?$/) ? location.match(/^.*\?(.*?)(?:#.*)?$/)[1] : '';
    }

    const hostLink = tool.hanleLocation(location, reportType);

    //判断id是否重复， 重复则不写入数据库
    var query = {
        id: id,
        location: hostLink
    };
    sqlModel.findOne({
        tableName: tableName,
        filter: query
    }).then(function(result) {
        if (result) {
            console.log('存在, 更新')
            //更新频道
            // var enterFrom = result.enterFrom
            // var obj = {}
            // if (channel) {
            //     var channelArr = channel.split('&')
            //     channelArr.forEach(item => {
            //         var temp = item.split('=')
            //         obj[temp[0]] = temp[1]
            //     })
            // }
            //更新useActives
            var newUseActives = {},
                existUseActives = result.data.useActives,
                validUseActivesKeys = [];
            for (var key in useActives) {
                var active = useActives[key]
                for (var item in tool.codeTransMap) {
                    key = key.replace(item, tool.codeTransMap[item])
                }
                //过滤有效点击事件，便于更新统计表
                existUseActives[key].activeCount === 0 && active.activeCount > 0 && validUseActivesKeys.push(key);
                newUseActives[key] = active
            }
            //更新统计数据表
            updateStatisticsData(project, hostLink, validUseActivesKeys, false);

            // for (var key in obj) {
            //     if (enterFrom[key]) {
            //         enterFrom[key] = Array.from(new Set([...obj[key], ...enterFrom[key]]))
            //     } else {
            //         enterFrom[key] = obj[key]
            //     }
            // }
            //更新记录
            sqlModel.updateStatisticsRecord({
                tableName: tableName,
                filter: query,
                data: {
                    $set: {
                        'data.useActives': newUseActives,
                        'data.repeatCountAll': repeatCountAll,
                        // enterFrom: enterFrom,
                        updateTime: reportTime
                    }
                }
            }).then(function(result) {
                ajaxResult(res, null, "update report content record Success");
            }).catch(function(err) {
                ajaxFailResult(res, 'update record fail error info:' + err)
            })
        } else {
            console.log('不存在,插入')
            var obj = {}

            if (channel) {
                var channelArr = channel.split('&')
                channelArr.forEach(item => {
                    var temp = item.split('=')
                    temp[0] = temp[0].replace(/\./g, '$dot$')
                    obj[temp[0]] = temp[1]
                })
            }

            var enterFrom = {
                enterFrom: obj
            } //进入的入口
            var location = {
                location: hostLink
            }
            //更新useActives
            var newUseActives = {},
                validUseActivesKeys = [];
            for (var key in useActives) {
                var active = useActives[key]
                for (var item in tool.codeTransMap) {
                    key = key.replace(item, tool.codeTransMap[item])
                }
                active.activeCount > 0 && validUseActivesKeys.push(key);
                newUseActives[key] = active;
            }
            //更新统计数据表
            updateStatisticsData(project, hostLink, validUseActivesKeys, true);

            var id = params.data.id;
            delete params.data.id;

            var insertObj = tool.extend(params, enterFrom, location, {
                id
            })
            insertObj.data.useActives = newUseActives
            sqlModel.inserStatisticsRecord({
                tableName: tableName,
                data: insertObj
            }).then(function(result) {
                if (result) {
                    ajaxResult(res, null, "report content record Success");
                }
            }).catch(function(err) {
                ajaxFailResult(res, 'record fail error info:' + err)
            })
        }
    })
}

function updateStatisticsData(project, location, validUseActivesKeys, isFirstView) {

    //既非第一次浏览又无新点击事件，直接访问，无须更新统计数据表
    if (validUseActivesKeys.length === 0 && !isFirstView) return;

    //更新统计数据表
    var tableName = 'Project_analysis_statistics_data';
    sqlModel.findOne({
        tableName: tableName,
        filter: {
            location: location
        }
    }).then(function(result) {
        //原本存在则更新该条记录
        if (result) {
            var useActives = result.useActives;
            //第一次访问页面浏览量加一
            var pageview = isFirstView ? result.pageview + 1 : result.pageview;
            //更新有效点击事件统计次数
            for (let i = 0; i < validUseActivesKeys.length; i++) {
                const validKey = validUseActivesKeys[i];
                useActives[validKey] = useActives[validKey] ? useActives[validKey] + 1 : 1;
            }
            //更新统计数据
            sqlModel.updateOne({
                tableName: tableName,
                filter: {
                    location: location
                },
                data: {
                    $set: {
                        pageview: pageview,
                        useActives: useActives
                    }
                }
            }).then(function(result) {
                console.log('更新统计数据表成功!');
            }).catch(function(err) {
                console.log('更新统计数据表失败!');
                console.log('失败原因：' + err);
                ajaxFailResult(res, 'report fail. error info:' + err)
            })

        } else {
            //原本不存在则插入一条新纪录
            var useActives = {};
            for (let i = 0; i < validUseActivesKeys.length; i++) {
                const validKey = validUseActivesKeys[i];
                useActives[validKey] = 1;
            }
            var insertData = {
                project: project,
                location: location,
                pageview: 1,
                useActives: useActives
            }
            //插入统计数据
            sqlModel.insertOne({
                tableName: tableName,
                data: insertData
            }).then(function(result) {
                console.log('更新统计数据表成功!');
            }).catch(function(err) {
                console.log('更新统计数据表失败!');
                console.log('失败原因：' + err);
                ajaxFailResult(res, 'report fail. error info:' + err)
            })
        }
    })
}


// 获取页面配置时过滤修改操作
const webPageviewFilterRecord = function(res, params,callback) {
    var tableName = 'Project_analysis_report_point_data'
    var { deviceID } = params.data;
    var { location, reportTime, enterFrom, areaInfo} = params;

    //判断id是否重复， 重复则不写入数据库
    var query = {
        id: deviceID,
        location: location
    };
    sqlModel.findOne({
        tableName: tableName,
        filter: query
    }).then(function(result) {
        if(result){
            // 有数据就初始化当前用户的数据记录
            console.log('=====查到有数据，更新数据=====');
            var data = result.data;
            // 时间比较
            var oldReportTime = +result.reportTime;
            var minTime = new Date(tool.dateFormat(oldReportTime,'yyyy-MM-dd 00:00:00')).getTime();
            var maxTime = new Date(tool.dateFormat(oldReportTime,'yyyy-MM-dd 23:59:59')).getTime();
            if(reportTime >= minTime && reportTime <= maxTime){
                //同一天
                data.repeatCountAll++;
                data.repeatCount++;
            }else{
                //之后天
                data.repeatCountAll++;
                data.repeatCount = 1;
            }
            var oldIP = result.areaInfo.newIp;
            //更新存储数据
            sqlModel.updateOne({
                tableName: tableName,
                filter: query,
                data: {
                    $set: {
                        reportTime: reportTime,
                        data: data,
                        enterFrom: enterFrom,
                        'areaInfo.newIp': areaInfo.newIp,
                        'areaInfo.oldIp': oldIP
                    }
                }
            }).then(function(result) {
                console.log('更新统计数据表成功!');
                callback()
            }).catch(function(err) {
                console.log('更新统计数据表失败!');
                console.log('失败原因：' + err);
                ajaxFailResult(res, 'report fail. error info:' + err)
            })
        }else{
            // 没有数据就插入
            var insertObj = params;
            insertObj.location = location;
            insertObj.data = {
                repeatCountAll: 1,
                repeatCount: 1,
                useActives: {}
            };
            insertObj.id = deviceID;

            sqlModel.insertOne({
                tableName: tableName,
                data: insertObj
            }).then(function(result) {
                if (result) {
                    callback()
                }
            }).catch(function(err) {
                ajaxFailResult(res, 'record fail error info:' + err)
            })
        }
    })


    
}


function updateWebPageviewStatisticsData(params,isFirstView){

}





module.exports = {
    filterWebObserverRecord,
    webPageviewFilterRecord
}