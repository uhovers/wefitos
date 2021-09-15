// const schedule = require('node-schedule');

// // 定义规则
// let rule = new schedule.RecurrenceRule();
// // rule.second = [0, 10, 20, 30, 40, 50]; // 每隔 10 秒执行一次

// // 每天 0 点执行
// rule.hour =0;
// rule.minute =0;
// rule.second =0;

// // 启动任务
// let job = schedule.scheduleJob(rule, () => {
//   console.log(new Date());
// });



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

let d = loadJson('json/holiday2021.json')
console.log(d);