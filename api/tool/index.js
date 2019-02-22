// AJAX 正确响应
var ajaxResult = function(Res, data, message) {
    //如果没有响应对象
    if (!Res) {
        return false;
    }
    //修正参数
    data = data ? data : null;
    message = message ? message : 'ok';
    Res.json({
        code: '00000',
        data: data,
        message: message
    })
}


//ajax 错误响应
var ajaxFailResult = function(Res, message, code) {
    //如果没有响应对象
    if (!Res) {
        return false;
    }
    //修正参数
    code = (code && typeof code === 'string') ? code : '99999';
    message = message ? message : 'unkown error';
    Res.json({
        code: code,
        message: message
    })
}


module.exports = {
    ajaxResult,
    ajaxFailResult
}