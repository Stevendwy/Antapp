/* converted by appconverter    	      		  
   on Tuesday, November 7th, 2017, 4:14:24 PM
*/
var mdfive = require('./md5.js');
const formatTime = date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return [
        year,
        month,
        day
    ].map(formatNumber).join('/') + ' ' + [
        hour,
        minute,
        second
    ].map(formatNumber).join(':');
};
const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n;
};
module.exports = { formatTime: formatTime };
function json2Form(json) {
    var str = [];
    for (var p in json) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p]));
    }
    return str.join('&');
}
module.exports = { json2Form: json2Form };
function headAdd(url) {
    var timestamp = Date.parse(new Date());
    let obj = {
        'time': timestamp,
        'secret_auth': 1,
        'sign': mdfive.hexMD5('xiaochengxu' + url + timestamp)
    };
    return obj;
}
module.exports = { headAdd: headAdd };