const tool = require('../../tool/index');
const sqlModel = require('../../sql/sqlModel');
const {
    ajaxResult,
    ajaxFailResult
} = require('../tool/index.js');





//上报埋点操作数据
const filterWebObserverRecord = function(req, res, params) {
    
    var {
        deviceID,
        reportTime,
        reportType,
        project
    } = params;

    var { location, enterFrom} = tool.getLoactionQueryObj(params.location)
    params.location = location;
    params.enterFrom = enterFrom;

    var tableName = 'Project_analysis_report_point_data';

    //判断id是否重复， 重复则不写入数据库
    var query = {
        id: deviceID,
        location: location
    };
    sqlModel.findOne({
        tableName: tableName,
        filter: query
    }).then(function(result) {
        if (result) {
            console.log('正常逻辑是当前用户数据一定存在, 更新')
            //更新useActives
            var existUseActives = result.data.useActives,
                nodeId = params.data.nodeId;

            var oldUseActives = false;
            for (var key in existUseActives) {
                if(key === nodeId){
                    oldUseActives = existUseActives[key]
                }
            }

            if(oldUseActives){
                //有该点击事件则更新,当天多次点击问为无效判断
                // 时间比较
                var oldReportTime = +result.reportTime;
                var minTime = new Date(tool.dateFormat(oldReportTime,'yyyy-MM-dd 00:00:00')).getTime();
                var maxTime = new Date(tool.dateFormat(oldReportTime,'yyyy-MM-dd 23:59:59')).getTime();
                if(reportTime >= minTime && reportTime <= maxTime){
                    //同一天 - 不更新统计表
                    existUseActives[nodeId] = {
                        activeCountAll: oldUseActives.activeCountAll + 1,
                        activeCount: oldUseActives.activeCount + 1
                    }
                    
                    sqlModel.updateOne({
                        tableName: tableName,
                        filter: query,
                        data: {
                            $set: {
                                'data.useActives': existUseActives,
                                reportTime: reportTime
                            }
                        }
                    }).then(function(result) {
                        ajaxResult(res, null, "update report content record Success");
                    }).catch(function(err) {
                        ajaxFailResult(res, 'update record fail error info:' + err)
                    })
                }else{
                    //之后天 - 更新统计表
                    existUseActives[nodeId] = {
                        activeCountAll: oldUseActives.activeCountAll + 1,
                        activeCount: 1
                    }
                    
                    sqlModel.updateOne({
                        tableName: tableName,
                        filter: query,
                        data: {
                            $set: {
                                'data.useActives': existUseActives,
                                reportTime: reportTime
                            }
                        }
                    }).then(function(result) {
                        ajaxResult(res, null, "update report content record Success");
                    }).catch(function(err) {
                        ajaxFailResult(res, 'update record fail error info:' + err)
                    })
                    
                    //有效的埋点操作记录修改统计数据表
                    updatePointOptionStatisticsData(params)
                }
            }else{
                //没有改埋点记录就添加
                existUseActives[nodeId] = {
                    activeCountAll: 1,
                    activeCount: 1
                }
                //更新记录
                sqlModel.updateOne({
                    tableName: tableName,
                    filter: query,
                    data: {
                        $set: {
                            'data.useActives': existUseActives,
                            reportTime: reportTime
                        }
                    }
                }).then(function(result) {
                    ajaxResult(res, null, "update report content record Success");
                }).catch(function(err) {
                    ajaxFailResult(res, 'update record fail error info:' + err)
                })

                //有效的埋点操作记录修改统计数据表
                updatePointOptionStatisticsData(params)
            }
        } else {
            ajaxFailResult(res, 'not find currentUser record error info:' + err)
        }
    })
}

function updatePointOptionStatisticsData(params) {

    var { location } = params;
    var nodeId = params.data.nodeId;

    //更新统计数据表
    var tableName = 'Project_analysis_statistics_point_data';
    sqlModel.findOne({
        tableName: tableName,
        filter: {
            location: location
        }
    }).then(function(result) {
        //原本存在则更新该条记录
        if (result) {
            var existUseActives = result.useActives;
            existUseActives[nodeId] = existUseActives[nodeId] ? existUseActives[nodeId] + 1 : 1;
            //更新统计数据
            sqlModel.updateOne({
                tableName: tableName,
                filter: {
                    location: location
                },
                data: {
                    $set: {
                        useActives: existUseActives
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
            ajaxFailResult(res, 'not find currentPage statistics record error info:' + err)
        }
    })
}










// 获取页面配置时过滤修改操作
const webPageviewFilterRecord = function(req, res,params) {
    // console.log('11111',req)
    params.areaInfo = {
        newIp: req.ip,
        oldIp: null,
    };

    //如果出现错误
    if (!params || !params.location) {
        ajaxFailResult(res, 'request params is undefined')
        return false;
    }
    var { location, enterFrom} = tool.getLoactionQueryObj(params.location)
    params.location = location;
    params.enterFrom = enterFrom;


    sqlModel.findOne({
        tableName: 'Buried_point_config',
        filter: {
            url: location
        }
    }).then((config) => {
        
        var tableName = 'Project_analysis_report_point_data';
        var { deviceID, location, reportTime, enterFrom, areaInfo} = params;

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
                    //有效的页面打开记录修改统计数据表
                    updateWebPageviewStatisticsData(params)
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
                }).then(function() {
                    console.log('更新统计数据表成功!');
                    ajaxResult(res, returnConfig(config ? config.nodeList : []), "get pages config Success");
                    return false;
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
                updateWebPageviewStatisticsData(params);
                sqlModel.insertOne({
                    tableName: tableName,
                    data: insertObj
                }).then(function() {
                    ajaxResult(res, returnConfig(config ? config.nodeList : []), "get pages config Success");
                    return false;
                }).catch(function(err) {
                    ajaxFailResult(res, 'record fail error info:' + err)
                })
            }
        })

    }, (err) => {
        ajaxFailResult(res, 'config fail error info:' + err)
        return false;
    })
}

//处理返回的页面埋点配置
function returnConfig(config){
    var result = [];
    if(config){
        config.forEach(item => {
            var tempObj = {
                nodeId: item.nodeId,
                xPath: item.xPath,
                nodeType: item.nodeType,
                signEventName: item.signEventName,
                inputFlag: item.inputFlag
            };
            result.push(tempObj)
        })
    }
    return result
}

//添加或修改统计数据表
function updateWebPageviewStatisticsData(params){
    var { location } = params;
    // var { deviceID } = params.data;
    // var { location, reportTime, enterFrom, areaInfo} = params;
    //更新统计数据表
    var tableName = 'Project_analysis_statistics_point_data';
    sqlModel.findOne({
        tableName: tableName,
        filter: {
            location: location
        }
    }).then(function(result) {
        //原本存在则更新该条记录的浏览次数字段
        if (result) {
            var pageview = result.pageview + 1;
            //更新统计数据
            sqlModel.updateOne({
                tableName: tableName,
                filter: {
                    location: location
                },
                data: {
                    $set: {
                        pageview: pageview,
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
            var insertData = {
                project: params.project,
                location: location,
                pageview: 1,
                useActives: {}
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







module.exports = {
    filterWebObserverRecord,
    webPageviewFilterRecord
}