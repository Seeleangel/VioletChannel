# VioletChannel

个人网站与内容工具集合，使用 Next.js 16 和 React 19。源码包含主页、博客、照片与旅行展示、后台页面、图片压缩、批量重命名、Markdown 转图及 AI 文案改写等功能。

代码来自关联本仓库的 `imgexpress` 工程，是从备份恢复的历史网站版本。当前个人网站已使用其他源码，本仓库不对应当前线上网站。

## 本地运行

```bash
npm ci
cp .env.example .env.local
# 自行设置 ADMIN_PASSWORD；需要 AI 改写时再配置 ECNU_API_KEY。
npm run dev
```

```bash
npm run build
npm start
npm test       # 先完成生产构建，验证未配置 AI 密钥时的接口行为
npm run lint
```

当前生产构建、AI 配置接口测试通过；代码检查仍有 31 个错误、2 个警告。未完成全部页面、后台权限与线上部署验收。

## 结构与数据

- `src/app/`：页面和服务端接口。
- `src/components/`：照片、音乐、旅行、后台等组件。
- `src/utils/`：图片压缩及内容工具。
- `public/`：界面使用的图片与字体。
- `data/`：运行时 JSON 数据目录。

真实密码和 API 密钥不在仓库中。私人照片集、音乐文件、留言、博客与旅行数据保留在本地备份，可通过后台自行配置。网站运行需要可写的 `data/` 和媒体目录。

配置采用 standalone 构建。如用于独立服务器部署，需要同时提供 `.next/static` 和 `public` 静态资源。
