# Nginx 404 错误排查和修复

## 当前问题分析

你的 Nginx 配置文件显示：
- 反向代理端口：`3001`
- 服务器 IP：`47.98.55.60`

## 立即执行的排查步骤

### 步骤1：检查 Node.js 应用是否运行
在宝塔终端执行：
```bash
pm2 status
```

查看 imgexpress (或 VioletChannel) 是否显示 `online` 状态。

### 步骤2：检查端口监听情况
```bash
netstat -tlnp | grep 3001
# 或者
lsof -i:3001
```

**如果没有输出，说明 3001 端口没有程序监听！**

### 步骤3：查看应用日志
```bash
pm2 logs
```

查看是否有错误信息。

---

## 解决方案

根据你的情况，有两种可能：

### 情况A：应用运行在 3000 端口（部署文档默认）

**修改 Nginx 配置：**

将这一行：
```nginx
proxy_pass http://127.0.0.1:3001;
```

改为：
```nginx
proxy_pass http://127.0.0.1:3000;
```

**具体操作：**
1. 宝塔面板 → 网站 → 点击你的网站设置
2. 配置文件
3. 找到 `proxy_pass http://127.0.0.1:3001;`
4. 改为 `proxy_pass http://127.0.0.1:3000;`
5. 点击保存
6. 重载 Nginx：`nginx -s reload`

### 情况B：应用未启动

**启动应用：**

```bash
# 进入项目目录
cd /www/wwwroot/vviii.aisa/VioletChannel

# 检查是否已构建
ls -la .next/

# 如果没有 .next 目录，需要先构建
npm run build

# 启动应用
pm2 start npm --name "VioletChannel" -- start
pm2 save
```

---

## 完整修复步骤

### 1. 确认项目路径和构建状态
```bash
cd /www/wwwroot/vviii.aisa/VioletChannel
pwd
ls -la
```

确认以下文件/目录存在：
- `package.json`
- `next.config.mjs`
- `.next/` 目录（构建后生成）

### 2. 如果未构建，执行构建
```bash
npm install
npm run build
```

### 3. 启动应用（选择一种方式）

**方式A：使用 PM2 命令行**
```bash
pm2 delete VioletChannel  # 删除旧进程（如果有）
pm2 start npm --name "VioletChannel" -- start
pm2 save
pm2 startup
```

**方式B：使用宝塔 PM2 管理器**
1. 软件商店 → Node.js版本管理器 → 设置
2. 项目列表 → 添加项目
3. 填写：
   - 项目名称：VioletChannel
   - 运行目录：/www/wwwroot/vviii.aisa/VioletChannel
   - 端口：3000（或 3001，取决于你的配置）
   - 启动方式：npm
   - 启动命令：start

### 4. 验证应用启动
```bash
pm2 status
pm2 logs VioletChannel
```

应该看到类似输出：
```
Ready on http://localhost:3000
```

记住这个端口号！

### 5. 修改 Nginx 配置匹配端口

如果应用运行在 `3000` 端口，Nginx 配置改为：
```nginx
location / {
    proxy_pass http://127.0.0.1:3000;  # 改这里
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_buffering off;
}
```

### 6. 测试 Nginx 配置并重载
```bash
nginx -t
nginx -s reload
```

### 7. 测试访问
```bash
# 测试本地访问
curl http://127.0.0.1:3000

# 测试外网访问
curl http://47.98.55.60
```

---

## 推荐的完整 Nginx 配置

```nginx
server {
    listen 80;
    server_name 47.98.55.60;
    
    # 如果有域名，添加到这里
    # server_name yourdomain.com www.yourdomain.com;
    
    # 客户端上传文件大小限制
    client_max_body_size 100M;
    
    # SSL证书申请验证
    location /.well-known/ {
        root /www/wwwroot/vviii.aisa/VioletChannel;
    }
    
    # 禁止访问敏感文件
    location ~ ^/(\.user.ini|\.htaccess|\.git|\.svn|\.env|node_modules|\.next/cache) {
        return 404;
    }
    
    # Next.js 应用反向代理
    location / {
        proxy_pass http://127.0.0.1:3000;  # 确保端口正确
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_http_version 1.1;
        proxy_buffering off;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # 日志
    access_log /www/wwwlogs/VioletChannel.log;
    error_log /www/wwwlogs/VioletChannel.error.log;
}
```

---

## 快速诊断命令

一键执行以下命令，输出所有诊断信息：

```bash
echo "=== 项目目录检查 ==="
ls -la /www/wwwroot/vviii.aisa/VioletChannel/

echo -e "\n=== PM2 进程状态 ==="
pm2 status

echo -e "\n=== 端口监听检查 ==="
netstat -tlnp | grep -E "3000|3001"

echo -e "\n=== PM2 日志（最后20行）==="
pm2 logs --lines 20

echo -e "\n=== Nginx 状态 ==="
systemctl status nginx | head -10

echo -e "\n=== 测试本地访问 ==="
curl -I http://127.0.0.1:3000 2>&1 | head -5
```

将这个命令的完整输出发给我，我可以帮你准确定位问题。

---

## 常见原因总结

1. ❌ **端口不匹配**：应用运行在 3000，Nginx 代理到 3001
2. ❌ **应用未启动**：PM2 进程不存在或状态为 stopped/error
3. ❌ **未构建项目**：缺少 `.next` 目录
4. ❌ **防火墙阻止**：服务器防火墙未开放端口
5. ❌ **依赖未安装**：node_modules 不完整

---

## 如果还是 404

检查这些：

1. **查看 Next.js 错误日志**
```bash
pm2 logs VioletChannel --lines 100
```

2. **查看 Nginx 错误日志**
```bash
tail -50 /www/wwwlogs/VioletChannel.error.log
```

3. **测试 Next.js 是否响应**
```bash
curl -v http://127.0.0.1:3000
```

4. **检查防火墙**
宝塔面板 → 安全 → 确保 80、443 端口已放行

5. **检查 SELinux（CentOS）**
```bash
getenforce
# 如果是 Enforcing，临时关闭测试
setenforce 0
```

---

把上面"快速诊断命令"的输出发给我，我帮你精确定位问题！
