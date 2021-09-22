const https = require('https');
const url = require('url');
const querystring = require('querystring');
var logger = require('./logger').logger;

var try_count = 5;
var bUrl = null, bData = null, bCall = null;

var httptool = {
    post: function (_url, data, callback) {
        try_count = 5;
        bUrl = _url, bData = data, bCall = callback;
        let options = url.parse(_url)
        options.method = "POST";
        let reqBody = querystring.stringify(data);
        options.headers = {
            "accept-Encoding": "gzip",
            "user-Agent": "Dalvik/2.1.0 (Linux; U; Android 10; EVR-AL00 Build/HUAWEIEVR-AL00)",
            "content-Length": reqBody.length,
            "content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "host": "app.wefitos.com",
            "connection": "Keep-Alive",
        }

        logger.info('post->url: ', _url);
        // logger.info('post->options: ', JSON.stringify(options));
        logger.info('post->reqBody: ', reqBody);

        let req = https.request(options, (res)=>{
            // console.log(res);
            res.on('data', (buffer)=>{
                let resData = JSON.parse(buffer.toString())
                logger.info('resData: ', buffer.toString())
                try_count = 0;
                if (callback) {
                    callback(resData)
                }
                // console.log(resData);
            })
        })
        req.setTimeout(10*1000);    // 10s 请求超时
        req.write(reqBody)
        req.on('timeout', ()=>{
            logger.info('timeout: 请求超时', try_count);
            if (try_count>0) {
                httptool.post(bUrl, bData, bCall);
                try_count--;
            }
        });
        req.on('error', (e)=>{
            logger.info('error: ', e);
        })
        req.end();
    }
}

exports.httptool = httptool;