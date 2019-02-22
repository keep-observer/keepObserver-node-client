//打印错误
const handleErrorLog = function(message) {
    console.error(dateFormat('yyyy-MM-dd hh:mm:ss') + message)
}

/**
 * 根据时间搓 返回时间
 * @param date format
 * @return string
 */
function dateFormat(date, format) {
    if (!format || typeof format !== 'string') {
        console.error('format is undefiend or type is Error');
        return '';
    }
    date = date instanceof Date ? date : (typeof date === 'number' || typeof date === 'string') ? new Date(date) : new Date();
    //解析
    var formatReg = {
        'y+': date.getFullYear(),
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
    }
    for (var reg in formatReg) {
        if (new RegExp(reg).test(format)) {
            var match = RegExp.lastMatch;
            format = format.replace(match, formatReg[reg] < 10 ? '0' + formatReg[reg] : formatReg[reg].toString());
        }
    }
    return format;
}


/**
 * 检查script基本数据类型
 * @param mixed value
 * @return boolean
 */
function isNumber(value) {
    return Object.prototype.toString.call(value) == '[object Number]';
}

function isString(value) {
    return Object.prototype.toString.call(value) == '[object String]';
}

function isArray(value) {
    return Object.prototype.toString.call(value) == '[object Array]';
}

function isBoolean(value) {
    return Object.prototype.toString.call(value) == '[object Boolean]';
}

function isUndefined(value) {
    return value === undefined;
}

function isNull(value) {
    return value === null;
}

function isSymbol(value) {
    return Object.prototype.toString.call(value) == '[object Symbol]';
}

function isObject(value) {
    return (
        Object.prototype.toString.call(value) == '[object Object]' ||
        // if it isn't a primitive value, then it is a common object
        (
            !isNumber(value) &&
            !isString(value) &&
            !isBoolean(value) &&
            !isArray(value) &&
            !isNull(value) &&
            !isFunction(value) &&
            !isUndefined(value) &&
            !isSymbol(value)
        )
    );
}

function isEmptyObject(obj) {
    if (!isObject(obj)) {
        return true;
    }
    for (var key in obj) {
        return false;
    }
    return true
}

function isEmptyArray(array) {
    if (!isArray(array)) {
        return true
    }
    return array.length > 0 ? false : true
}

function isFunction(value) {
    return Object.prototype.toString.call(value) == '[object Function]';
}

/**
 * 检查是否是普通空对象
 * @param object obj
 * @return boolean
 */
function isPlainObject(obj) {
    var hasOwn = Object.prototype.hasOwnProperty;
    // Must be an Object.
    if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
        return false;
    }
    try {
        if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
            return false;
        }
    } catch (e) {
        return false;
    }
    var key;
    for (key in obj) {}
    return key === undefined || hasOwn.call(obj, key);
}


/*
  转换工具
 */
function toArray(array) {
    return Array.prototype.slice.call(array)
}

function toString(content) {
    if (!content) {
        return '';
    }
    if (typeof content === 'string') {
        return content
    }
    return content.toString()
}





/*
    深度合并内容
    引用类型克隆合并
    arguments[0] = target
    arguments type is Object Or Array
    多内容合并覆盖优先级: arguments[0]<arguments[1]<arguments[2]..
    如果sources 不是数组或者对象 则直接忽略
 */
function extend() {
    var args = toArray(arguments);
    if (args.length === 0) {
        console.error('extends params is undefined')
        return {};
    }
    if (args.length === 1) {
        return args[0]
    }
    var target = args[0];
    var sources = args.slice(1, args.length)

    if (!isObject(target) && !isArray(target)) {
        target = {};
    }
    sources.map(function(item) {
        //防止死循环
        if (target === item) {
            return false;
        }
        //如果内容是对象 
        if (isObject(item)) {
            //开始遍历
            for (var key in item) {
                //如果内容是对象
                if (isObject(item[key])) {
                    //修正数据
                    target[key] = (target[key] && isObject(target[key])) ? target[key] : {};
                    target[key] = extend(target[key], item[key])
                } else if (isArray(item)) {
                    //修正数据
                    target[key] = (target[key] && isArray(target[key])) ? target[key] : [];
                    target[key] = extend(target[key], item[key])
                } else {
                    //基本类型直接赋值
                    target[key] = item[key]
                }
            }
        } else if (isArray(item)) {
            for (var i = 0; i < item.length; i++) {
                //如果内容是对象
                if (isObject(item[i])) {
                    //修正数据
                    target[i] = (target[i] && isObject(target[i])) ? target[i] : {}
                    target[i] = extend(target[i], item[i])
                } else if (isArray(item)) {
                    //修正数据
                    target[i] = (target[i] && isArray(target[i])) ? target[i] : [];
                    target[i] = extend(target[i], item[i])
                } else {
                    //基本类型直接赋值
                    target[i] = item[i]
                }
            }
        }
        //其他类型直接忽略  
    })
    return target
}

const codeTransMap = {
    '.': '$dot$'
}

const hanleLocation = function(locationURL, reportType, tableName) {
    // console.log('传入的location', locationURL)
    if (!isString(locationURL) || locationURL === null) {
        return ''
    }
    //去掉http/https
    var temp;
    if (!locationURL.match(/(http|https):\/\//)) {
        temp = locationURL
    } else {
        temp = locationURL && locationURL.split(/(http|https):\/\//) ? locationURL.split(/(http|https):\/\//)[2] : locationURL
    }
    //如果有？，取？之前的内容
    var hostLink = temp && temp.match(/(.*)(?=\?)/) ? temp.match(/(.*)(?=\?)/)[0] : temp
    if (reportType === 'simpleH5' || tableName === 'Project_analysis_data_hour' || tableName === 'Project_analysis_data_day') {
        //H5页面，如果有#，取#之前的内容, web单页面项目保留#之后的内容
        hostLink = hostLink && hostLink.match(/(.*)(?=\#)/) ? hostLink.match(/(.*)(?=\#)/)[0] : hostLink
    }
    //去除链接尾部无效斜杠
    hostLink = hostLink.replace(/^(.+?)\/+$/, '$1');
    // console.log('处理后的hostLink', hostLink)
    return hostLink
}

function numberFix(number, gte, fix, char) {
    if (number >= gte) {
        return number
    }
    fix = typeof fix !== 'undefined' ? fix : 1;
    char = typeof char !== 'undefined' ? char : '0';
    let prefix = '';
    for (let i = 0; i < fix; i++) {
        prefix += char;
    }
    return prefix + number
}

function consoleUpdating(dotCount = 8) {
    const readline = require('readline');

    console.log('\n');
    currentDotCount = 0;
    return setInterval(() => {

        readline.clearLine(process.stdout, 0);
        readline.cursorTo(process.stdout, 0)

        var dot = '.';
        for (let i = 0; i < currentDotCount; i++) {
            dot += '.';
        }
        process.stdout.write('版本更新中' + dot, 'utf-8');
        currentDotCount = (currentDotCount + 1) % dotCount;
    }, 800);
}


//验证参数是否存在
const validateParams = function(){
    var args = arguments;
    for(var i = 0; i<args.length; i++){
        var paramsItem = args[i];
        if(this.isUndefined(paramsItem) || this.isNull(paramsItem)){
            return false;
        }
    }
    return true;
}



module.exports = {
    extend,
    dateFormat,
    isNumber,
    isString,
    isArray,
    isBoolean,
    isUndefined,
    isNull,
    isSymbol,
    isObject,
    isEmptyObject,
    isEmptyArray,
    isFunction,
    isPlainObject,
    toArray,
    toString,
    handleErrorLog,
    codeTransMap,
    hanleLocation,
    numberFix,
    consoleUpdating,
    validateParams
}