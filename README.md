# 微健(wefitos) 自动约课系统

### 每天凌晨00：01：00 定时开始约课

1. 执行 install.sh 安装node依赖
2. `npm run start` 运行

#### 免费节假日 API http://timor.tech/api/holiday

一、利用 forever

forever是一个nodejs守护进程，完全由命令行操控。forever会监控nodejs服务，并在服务挂掉后进行重启。

1、安装 forever

npm install forever -g
2、启动服务

service forever start
3、使用 forever 启动 js 文件

forever start index.js
4、停止 js 文件

forever stop index.js
5、启动js文件并输出日志文件

forever start -l forever.log -o out.log -e err.log index.js
6、重启js文件

forever restart index.js
7、查看正在运行的进程

forever list
