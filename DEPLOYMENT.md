# 宝塔面板部署指南 - imgexpress 项目

## 前提条件
- 已购买云服务器（阿里云/腾讯云/华为云等）
- 服务器操作系统：CentOS 7+ / Ubuntu 18.04+
- 已安装宝塔面板（官网：https://www.bt.cn）
- 已备案域名（如果需要）

---

## 第一步：服务器环境准备

### 1.1 登录宝塔面板
```
访问：http://你的服务器IP:8888
输入宝塔用户名和密码登录
```

### 1.2 安装必要软件
在宝塔面板左侧菜单点击 **软件商店**，安装以下软件：

#### 必须安装：
- **Node.js 版本管理器（PM2管理器）** - 安装
- **Nginx 1.22+** - 安装
- **Node.js 18.x 或 20.x** - 推荐 20.x（在PM2管理器中安装）

#### 可选安装：
- **宝塔SSH终端** - 方便命令行操作

### 1.3 验证 Node.js 安装
1. 点击左侧菜单 **终端**
2. 输入以下命令验证：
```bash
node -v  # 应显示 v18.x.x 或 v20.x.x
npm -v   # 应显示 npm 版本
```

---

## 第二步：创建网站目录

### 2.1 创建项目目录
1. 点击左侧菜单 **文件**
2. 进入 `/www/wwwroot/` 目录
3. 点击 **新建目录**，输入 `imgexpress`
4. 进入新建的 `imgexpress` 目录

### 2.2 上传项目文件
有三种方式：

#### 方式一：通过宝塔面板上传（推荐小项目）
1. 在本地项目根目录，打包需要上传的文件：
   - 排除 `node_modules/`、`.next/`、`.git/` 这些文件夹
2. 压缩为 `.zip` 文件
3. 在宝塔文件管理中点击 **上传**
4. 上传完成后点击压缩包右键 → **解压**

#### 方式二：通过 Git（推荐）
```bash
# 在宝塔终端中执行
cd /www/wwwroot/imgexpress
git clone https://github.com/你的用户名/imgexpress.git .
# 或者使用国内镜像
git clone https://gitee.com/你的用户名/imgexpress.git .
```

#### 方式三：使用 FTP/SFTP 工具
- 使用 FileZilla 或 WinSCP
- 连接信息在宝塔面板 → **FTP** 中查看

### 2.3 确认文件结构
上传后，在 `/www/wwwroot/imgexpress/` 目录应包含：
```
imgexpress/
├── src/
├── public/
├── data/
├── package.json
├── next.config.mjs
├── .env.local (需要手动创建)
└── README.md
```

---

## 第三步：配置环境变量

### 3.1 创建生产环境配置
1. 在宝塔文件管理中，进入项目根目录
2. 点击 **新建文件**，文件名：`.env.local`
3. 编辑文件，添加以下内容：

```env
# 生产环境配置
NODE_ENV=production

# 网站域名（替换为你的实际域名）
NEXT_PUBLIC_SITE_URL=https://www.yourdomain.com

# 管理员密码（修改为你的密码）
ADMIN_PASSWORD=your_secure_password_here

# 其他配置
NEXT_PUBLIC_API_URL=https://www.yourdomain.com/api
```

### 3.2 设置文件权限
在宝塔终端中执行：
```bash
cd /www/wwwroot/imgexpress
chmod 755 data/
chmod 666 data/*.json
```

---

## 第四步：安装依赖和构建

### 4.1 安装项目依赖
在宝塔终端中执行：
```bash
cd /www/wwwroot/imgexpress
npm install --production
# 如果速度慢，使用国内镜像
npm install --production --registry=https://registry.npmmirror.com
```

等待安装完成（可能需要 2-5 分钟）

### 4.2 构建生产版本
```bash
npm run build
```

构建成功会显示类似信息：
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## 第五步：使用 PM2 启动应用

### 5.1 通过宝塔 PM2 管理器启动（推荐）

#### 方法A：使用宝塔界面
1. 点击左侧菜单 **软件商店** → 已安装 → **Node.js版本管理器** → **设置**
2. 点击 **项目列表** 标签
3. 点击 **添加项目**
4. 填写信息：
   - **项目名称**：imgexpress
   - **启动文件**：留空（我们用启动命令）
   - **运行目录**：/www/wwwroot/imgexpress
   - **端口**：3000
   - **启动方式**：npm
   - **启动命令**：start
5. 点击 **提交**

#### 方法B：使用命令行
在宝塔终端执行：
```bash
cd /www/wwwroot/imgexpress

# 安装 PM2（如果未安装）
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'imgexpress',
    script: 'npm',
    args: 'start',
    cwd: '/www/wwwroot/imgexpress',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# 启动应用
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 5.2 验证启动状态
```bash
pm2 status
# 应显示 imgexpress 状态为 online

pm2 logs imgexpress
# 查看日志，应显示 "Ready on http://localhost:3000"
```

---

## 第六步：配置 Nginx 反向代理

### 6.1 添加网站
1. 点击左侧菜单 **网站**
2. 点击 **添加站点**
3. 填写信息：
   - **域名**：www.yourdomain.com,yourdomain.com
   - **根目录**：/www/wwwroot/imgexpress
   - **PHP版本**：纯静态
4. 点击 **提交**

### 6.2 配置反向代理
1. 在网站列表中找到刚添加的网站
2. 点击 **设置** → **反向代理**
3. 点击 **添加反向代理**
4. 填写信息：
   - **代理名称**：imgexpress
   - **目标URL**：http://127.0.0.1:3000
   - **发送域名**：$host
5. 在 **高级配置** 中添加：
```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_http_version 1.1;
proxy_buffering off;
```
6. 点击 **保存**

### 6.3 配置 SSL 证书（HTTPS）
1. 在网站设置中点击 **SSL** 标签
2. 选择 **Let's Encrypt**
3. 勾选你的域名
4. 点击 **申请**
5. 申请成功后，开启 **强制HTTPS**

---

## 第七步：配置文件上传大小限制

由于项目涉及图片上传，需要调整上传限制：

### 7.1 修改 Nginx 配置
1. 网站设置 → **配置文件**
2. 在 `server` 块中添加：
```nginx
client_max_body_size 100M;
```
3. 点击 **保存**

### 7.2 修改 PHP 配置（如果使用 PHP 上传）
1. 软件商店 → PHP → **设置**
2. 配置文件中修改：
```ini
upload_max_filesize = 100M
post_max_size = 100M
```

---

## 第八步：测试和验证

### 8.1 测试网站访问
1. 在浏览器访问：`https://www.yourdomain.com`
2. 检查以下功能：
   - ✅ 首页正常显示
   - ✅ 导航栏正常工作
   - ✅ 图片正常加载
   - ✅ PhotoGallery 能打开
   - ✅ TravelMap 能显示
   - ✅ Blog 页面正常
   - ✅ Tools 页面正常

### 8.2 测试 API 接口
```bash
# 在终端测试
curl https://www.yourdomain.com/api/images/list
curl https://www.yourdomain.com/api/travels
curl https://www.yourdomain.com/api/posts
```

### 8.3 查看日志
```bash
# PM2 日志
pm2 logs imgexpress

# Nginx 访问日志
tail -f /www/wwwroot/imgexpress/logs/access.log

# Nginx 错误日志
tail -f /www/wwwroot/imgexpress/logs/error.log
```

---

## 第九步：常见问题和解决方案

### 问题1：页面显示 502 Bad Gateway
**原因**：Node.js 应用未启动或端口不对
**解决**：
```bash
pm2 status  # 检查应用状态
pm2 restart imgexpress  # 重启应用
pm2 logs imgexpress  # 查看错误日志
```

### 问题2：样式丢失或图片不显示
**原因**：静态资源路径配置问题
**解决**：检查 `next.config.mjs` 中的配置，确保没有 basePath

### 问题3：API 接口 404
**原因**：反向代理配置不正确
**解决**：检查 Nginx 反向代理配置，确保所有请求都代理到 3000 端口

### 问题4：上传功能不工作
**原因**：文件权限或目录不存在
**解决**：
```bash
cd /www/wwwroot/imgexpress
mkdir -p public/img public/uploads data
chmod -R 755 public/
chmod -R 755 data/
chown -R www:www public/ data/
```

### 问题5：端口被占用
**原因**：3000 端口已被其他程序使用
**解决**：
```bash
# 查看端口占用
lsof -i:3000
# 或使用其他端口，修改 ecosystem.config.js 中的 PORT
```

### 问题6：更新代码后不生效
**原因**：需要重新构建和重启
**解决**：
```bash
cd /www/wwwroot/imgexpress
git pull  # 拉取最新代码
npm install  # 更新依赖
npm run build  # 重新构建
pm2 restart imgexpress  # 重启应用
```

---

## 第十步：日常维护

### 10.1 更新项目代码
```bash
cd /www/wwwroot/imgexpress
git pull
npm install
npm run build
pm2 restart imgexpress
pm2 save
```

### 10.2 查看运行状态
```bash
pm2 status
pm2 monit  # 实时监控
```

### 10.3 备份重要数据
定期备份：
- `data/*.json` 文件
- `public/img/` 图片文件
- `.env.local` 配置文件

在宝塔面板：
1. 计划任务 → 添加任务
2. 类型：备份网站
3. 周期：每天
4. 保留：7 份

### 10.4 设置开机自启
```bash
pm2 startup
pm2 save
```

### 10.5 性能优化建议
1. **启用 Gzip 压缩**：网站设置 → 配置文件 → 添加 gzip 配置
2. **配置缓存**：设置静态资源缓存时间
3. **CDN 加速**：将图片等静态资源放到 CDN
4. **数据库优化**：如果使用数据库，定期优化

---

## 第十一步：安全加固

### 11.1 防火墙配置
1. 宝塔面板 → **安全**
2. 只开放必要端口：
   - 80 (HTTP)
   - 443 (HTTPS)
   - 8888 (宝塔面板，可改端口)
   - 22 (SSH，建议改端口)

### 11.2 修改默认端口
- 修改宝塔面板端口（非 8888）
- 修改 SSH 端口（非 22）

### 11.3 定期更新
- 定期更新宝塔面板
- 定期更新 Node.js 版本
- 定期更新项目依赖

---

## 故障排查清单

当网站出现问题时，按顺序检查：

1. ✅ 服务器是否在线？
   ```bash
   ping 你的服务器IP
   ```

2. ✅ Node.js 应用是否运行？
   ```bash
   pm2 status
   ```

3. ✅ 端口是否监听？
   ```bash
   netstat -tlnp | grep 3000
   ```

4. ✅ Nginx 是否运行？
   ```bash
   systemctl status nginx
   ```

5. ✅ 域名解析是否正确？
   ```bash
   nslookup yourdomain.com
   ```

6. ✅ SSL 证书是否过期？
   宝塔面板 → 网站 → SSL

7. ✅ 磁盘空间是否充足？
   ```bash
   df -h
   ```

8. ✅ 查看错误日志
   ```bash
   pm2 logs imgexpress --lines 100
   tail -n 100 /www/server/nginx/logs/error.log
   ```

---

## 联系方式和资源

- 宝塔面板官网：https://www.bt.cn
- Next.js 文档：https://nextjs.org/docs
- PM2 文档：https://pm2.keymetrics.io

---

## 快速命令参考

```bash
# 进入项目目录
cd /www/wwwroot/imgexpress

# PM2 常用命令
pm2 start ecosystem.config.js  # 启动
pm2 stop imgexpress            # 停止
pm2 restart imgexpress         # 重启
pm2 delete imgexpress          # 删除
pm2 logs imgexpress            # 查看日志
pm2 monit                      # 监控
pm2 list                       # 列表

# 更新部署
git pull
npm install
npm run build
pm2 restart imgexpress

# 查看端口
netstat -tlnp | grep 3000
lsof -i:3000

# 重启 Nginx
nginx -t           # 测试配置
systemctl restart nginx
```

---

**部署完成！如有问题，查看上述故障排查清单。**
