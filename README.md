# node
由于环境原因，固定版本控制为`9.11.2`。

# Nginx
Ubuntu 的 80 端口属于保留端口。通过 nginx 作为反向路由做端口转发。
```
// 安装nginx
sudo apt-get install nginx
// nginx 配置
cp ./nginx/mp /etc/nginx/site-available/mp
// 软链接
sudo ln -s /etc/nginx/sites-available/mp /etc/nginx/sites-enabled/mp
sudo service nginx restart
```

# pm2
pm2 作为守护进程。利用`npm start`脚本启动。
```
npm install -g pm2
pm2 start npm --start
```
# 说明
`config/index.js` -- 存放微信公众号的相关信息

`wechat/api.js` -- 微信公众号提供的api方法
`wechat/menu.js` -- 微信公众号自定义菜单模板
`wechat/wechat.js` -- 分装签名和回复等方法

`index.js` -- 生成自定义菜单、回复不同类型的消息

`access_token.txt` -- 存放access_token
> access_token是公众号的全局唯一接口调用凭据，公众号调用各接口时都需使用access_token。开发者需要进行妥善保存。access_token的存储至少要保留512个字符空间。
access_token的有效期目前为2个小时*(7200秒)*，需定时刷新，重复获取将导致上次获取的access_token失效

