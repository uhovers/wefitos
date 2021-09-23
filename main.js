var logger = require('./logger').logger;
const httptool = require('./httpTool').httptool;
const fs = require('fs')

function loadJson(path) {
  let data;
  try {
    let rawdata = fs.readFileSync(path);
    data = JSON.parse(rawdata);
  } catch (error) {
    console.log(error);
  }
  return data
}
const holiday = loadJson('json/holiday2021.json');

/* 质朴长存法 补0 */
function pad(num, n) {
    var len = num.toString().length;
    while(len < n) {
        num = "0" + num;
        len++;
    }
    return num;
}

/** 约定几天后 */
const timeNum = 6

/**
 * num是正数表示之后的时间，num负数表示之前的时间，0表示今天
 * @param {*} num 
 * @returns 
 */
function fun_date(num) { 
    let date1 = new Date();
    //今天时间
    let time1 = date1.getFullYear() + "-" + (date1.getMonth() + 1) + "-" + date1.getDate()
    // console.log(time1);
    
    let date2 = new Date(date1);
    date2.setDate(date1.getDate() + num);

    let day1 = pad(date2.getMonth() + 1, 2) + "-" + pad(date2.getDate(), 2);
    // console.log(day1);
    let isDayOff = false;  // 是否为调休日
    if (holiday && holiday.holiday) {
        let day_list = holiday.holiday;
        let day_info = day_list[day1];
        if (day_info) {
            if (day_info.holiday) {
                logger.info(day_info.date + ' ' + day_info.name +' 不用约课');
                return false;
            } else {
                isDayOff = true;
                logger.info(day_info.date + ' ' + day_info.name +' 需要约课');
            }
        }
    }

    //num是正数表示之后的时间，num负数表示之前的时间，0表示今天
    let time2 = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate(); 
    // console.log(time2);
    // 返回值是 0（周日） 到 6（周六） 之间的一个整数。
    let day = date2.getDay();
    // console.log('day: ', day);
    if (!isDayOff && (day===0 || day===6)) {
        logger.info(time2 + ' 周六、周日不需要约课');
        return false
    }
    return time2;
}

function getTargetTime(t){
    // console.log(t);
    var d = t.split(" ")[0],
        h = t.split(" ")[1],
        date = new Date()

    date.setYear(d.split("-")[0])
    date.setMonth(d.split("-")[1] - 1)
    date.setDate(d.split("-")[2])

    date.setHours(h.split(":")[0])
    date.setMinutes(h.split(":")[1])
    date.setSeconds(h.split(":")[2])
    return date.getTime()
}

// const tableUrl = "https://app.wefitos.com/app/club/coache/coach-time-table"
const tableUrl = "https://app.wefitos.com/app/club/coache/coach-time-table"
let tableData = {
    cli_v: 1952,
    sys_p: "a",
    currentDay: Date.now()/1000,
    sys_m: "EVR-AL00",
    sess: "b7fb0K5aj9mi+2bC/tS9MNTwjIe5eFPATC9mCEbWlomImPn1",
    sys_v: 29,
    language: "Simplified",
    sys_c: 1111,
    coachId: 21,
}

// 查询当天的课表
function queryTableList(callback) {
    httptool.post(tableUrl, tableData, (data)=>{
        logger.info(data.data.coll);
    });
}

const bookUrl = "https://app.wefitos.com/app/club/coache/book"
let bookData = {
    cli_v: 1952,
    phone: 18981896938,
    sys_p: "a",
    dayFromTime: Date.now()/1000,
    sys_m: "EVR-AL00",
    sess: "b7fb0K5aj9mi+2bC/tS9MNTwjIe5eFPATC9mCEbWlomImPn1",
    sys_v: 29,
    language: "Simplified",
    sys_c: 1111,
    coachId: 21,
}
// 开始约课
function book(time) {
    // let d = fun_date(timeNum)
    // console.log(d);
    // let t = `${d} ${time}`

    bookData.dayFromTime = time
    // bookData.dayFromTime = 1631786400
    // console.log(bookData);
    httptool.post(bookUrl, bookData, (data)=>{
        logger.info(data);
    });
}

function main() {
    let d = fun_date(timeNum);
    if (!d) {
        return;
    }

    // 每天20点的时间戳 s
    let time_20 = parseInt(getTargetTime(`${d} 20:00:00`)/1000);
    // console.log(time_20);

    // 每天21点的时间戳 s
    let time_21 = parseInt(getTargetTime(`${d} 21:00:00`)/1000);
    // console.log(time_21);
    logger.info('开始预约：' + d)

    tableData.currentDay = parseInt(getTargetTime(`${d} 00:01:00`)/1000)
    httptool.post(tableUrl, tableData, (data)=>{
        // logger.info(JSON.stringify(data.data.coll));
        if (!data) {
            return
        }
        let coll = data.data.coll
        let has20 = false,
            has21 = false;
        for (let i = 0; i < coll.length; i++) {
            const c = coll[i];
            if (c.fromTime==time_20) {
                has20 = true;
            }else if (c.fromTime==time_21) {
                has21 = true
            }
        }

        if (!has20) {
            // 20 点没有课
            logger.info('20 点没有课');
            book(time_20)
            return;
        }
        if (!has21) {
            // 21 点没有课
            logger.info('21 点没有课');
            book(time_21)
            return
        }

        logger.info(d, '没有课可以约了!')
    });

}
// main()
// book()
// book("20:00:00")


// 每天 0 点定时执行
const schedule = require('node-schedule');

// 定义规则
let rule = new schedule.RecurrenceRule();
// rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次

// 每天 00:01:00 执行
rule.hour = 0;
rule.minute = 1;
rule.second = 0;

// 启动任务
let job = schedule.scheduleJob(rule, () => {
//   console.log(new Date());
    main();
});