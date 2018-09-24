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

文档具体看doc

