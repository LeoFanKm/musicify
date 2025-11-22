# Musicify Telegram Mini APP

> AI 驱动的音乐创作助手 - Telegram Mini APP 版本

## 📋 项目概览

Musicify TMA 是 Musicify CLI 的 Telegram Mini APP 版本，让普通用户无需安装即可使用强大的 AI 音乐创作功能。

### 核心特性

- 🎵 **快速创作**：3 分钟从灵感到歌词
- 🎨 **多模态支持**：上传音频/图片生成 Prompt（基于 Gemini 3）
- ✨ **三种创作模式**：教练、快速、混合
- 📤 **一键导出**：导出到 Suno、Tunee 等平台
- 🌍 **全球分发**：Telegram 8 亿用户，零安装成本

### 技术栈

**前端**：
- React 18.2 + TypeScript 5.x
- Tailwind CSS 3.x
- Vite 4.5.0
- Zustand (状态管理)
- Telegram Mini App SDK

**后端**：
- Cloudflare Workers (无服务器边缘计算)
- Hono (轻量级 Web 框架)
- D1 (SQLite 数据库)
- R2 (对象存储)
- KV (键值存储)

**AI 服务**：
- OpenRouter (AI 模型聚合)
- Gemini 3 (多模态理解)
- GPT-4.5 (歌词创作)

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- Cloudflare 账号
- Telegram Bot Token
- OpenRouter API Key

### 1. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd ../backend
npm install
```

### 2. 配置环境变量

**前端 `.env`**：
```env
VITE_API_BASE_URL=https://musicify-api.your-subdomain.workers.dev
```

**后端环境变量**（通过 wrangler secret）：
```bash
# 设置 OpenRouter API Key
wrangler secret put OPENROUTER_API_KEY

# 设置 Telegram Bot Token
wrangler secret put TELEGRAM_BOT_TOKEN
```

### 3. 初始化 Cloudflare 资源

```bash
cd backend

# 创建 D1 数据库
wrangler d1 create musicify-db

# 初始化数据库表
wrangler d1 execute musicify-db --file=./schema.sql

# 创建 R2 存储桶
wrangler r2 bucket create musicify-storage

# 创建 KV 命名空间
wrangler kv:namespace create "musicify-kv"
```

**重要**：将生成的 ID 填入 `wrangler.toml` 中：
```toml
[[d1_databases]]
binding = "DB"
database_name = "musicify-db"
database_id = "你的-database-id" # ← 填入这里

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "musicify-storage"

[[kv_namespaces]]
binding = "KV"
id = "你的-kv-id" # ← 填入这里
```

### 4. 开发模式

```bash
# 启动后端（终端 1）
cd backend
npm run dev

# 启动前端（终端 2）
cd frontend
npm run dev
```

访问 `http://localhost:5173` 查看前端。

### 5. 部署到生产环境

```bash
# 部署后端
cd backend
npm run deploy

# 构建前端
cd ../frontend
npm run build

# 部署前端到 Cloudflare Pages
npx wrangler pages deploy dist --project-name=musicify-tma
```

---

## 📁 项目结构

```
musicify-tma/
├── frontend/                 # Telegram Mini APP 前端
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── pages/           # 页面组件
│   │   │   ├── HomePage.tsx
│   │   │   ├── CreatePage.tsx
│   │   │   ├── ProjectPage.tsx
│   │   │   ├── MyProjectsPage.tsx
│   │   │   └── MultimodalPage.tsx
│   │   ├── stores/          # Zustand 状态管理
│   │   │   ├── telegramStore.ts
│   │   │   ├── userStore.ts
│   │   │   └── projectStore.ts
│   │   ├── utils/           # 工具函数
│   │   │   ├── api.ts
│   │   │   └── date.ts
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                 # Cloudflare Workers 后端
│   ├── src/
│   │   ├── handlers/       # API 路由处理器
│   │   │   ├── user.ts
│   │   │   ├── project.ts
│   │   │   ├── ai.ts
│   │   │   └── upload.ts
│   │   ├── services/       # 业务逻辑
│   │   │   ├── db.ts       # 数据库操作
│   │   │   ├── ai.ts       # AI 服务
│   │   │   └── usage.ts    # 使用量管理
│   │   ├── middleware/     # 中间件
│   │   │   └── auth.ts     # Telegram 认证
│   │   ├── types/
│   │   │   └── env.ts
│   │   └── index.ts        # 入口文件
│   ├── schema.sql          # D1 数据库 Schema
│   ├── wrangler.toml       # Cloudflare 配置
│   └── package.json
│
└── shared/                 # 共享类型定义
    └── types.ts
```

---

## 🎯 核心功能

### 1. 快速创作流程

用户通过 4 步完成歌词创作：
1. 选择歌曲类型（流行、摇滚、说唱等）
2. 选择情绪氛围（抒情、激昂、轻快等）
3. 选择语言和创作模式
4. 输入主题，AI 生成歌词

### 2. 多模态创作（基于 Gemini 3）

**音频分析**：
- 上传参考音频
- AI 分析风格、节奏、乐器
- 生成 Suno 复刻 Prompt

**图片分析**：
- 上传图片
- AI 提取色彩、情绪、场景
- 生成配乐 Prompt

### 3. 导出功能

- **Suno AI**：生成结构化 Prompt
- **Tunee AI**：生成对话素材包
- **通用格式**：纯歌词文本

---

## 🔧 API 文档

### 认证

所有 API 请求需要在 Header 中包含 Telegram InitData：

```http
X-Telegram-Init-Data: query_id=...&user=...&auth_date=...&hash=...
```

### 核心接口

#### 用户相关

```
GET  /api/v1/user/me          获取当前用户信息
GET  /api/v1/user/usage       获取使用量统计
```

#### 项目相关

```
GET    /api/v1/projects             获取所有项目
POST   /api/v1/projects             创建新项目
GET    /api/v1/projects/:id         获取项目详情
PATCH  /api/v1/projects/:id         更新项目
DELETE /api/v1/projects/:id         删除项目
POST   /api/v1/projects/:id/generate  生成歌词
POST   /api/v1/projects/:id/export    导出项目
```

#### AI 相关

```
POST /api/v1/ai/analyze/audio   分析音频
POST /api/v1/ai/analyze/image   分析图片
```

#### 上传相关

```
POST /api/v1/upload/audio   上传音频文件
POST /api/v1/upload/image   上传图片文件
```

---

## 💰 付费模式

| 功能 | 免费版 | Pro 版 |
|------|--------|--------|
| 每日创作次数 | 3 次 | 无限制 |
| AI 模型 | Gemini 3 Flash | Gemini 3 Pro + GPT-4.5 |
| 多模态分析 | ✅ | ✅ |
| 导出功能 | ✅ | ✅ |
| 历史记录 | 7 天 | 永久 |
| 优先支持 | ❌ | ✅ |

---

## 🎨 设计理念

### 用户体验优化

1. **零安装成本**：Telegram 内直接打开，无需下载 APP
2. **3 分钟创作**：简化流程，4 步完成
3. **即时反馈**：Haptic Feedback 提升交互体验
4. **移动优先**：100% 适配移动端

### 技术决策

1. **边缘计算**：Cloudflare Workers 全球部署，延迟 <50ms
2. **无服务器**：零运维成本，按需付费
3. **渐进式增强**：核心功能优先，高级功能按需加载

---

## 📊 数据库设计

### Users 表

```sql
- id: TEXT (PRIMARY KEY)
- telegram_id: INTEGER (UNIQUE)
- username: TEXT
- first_name: TEXT
- last_name: TEXT
- tier: TEXT ('free' | 'pro')
- created_at: TEXT
- last_active_at: TEXT
```

### Projects 表

```sql
- id: TEXT (PRIMARY KEY)
- user_id: TEXT (FOREIGN KEY)
- title: TEXT
- spec: TEXT (JSON)
- theme: TEXT
- lyrics: TEXT
- chords: TEXT
- suno_prompt: TEXT
- tunee_prompt: TEXT
- status: TEXT ('draft' | 'completed' | 'exported')
- created_at: TEXT
- updated_at: TEXT
```

---

## 🔐 安全性

### Telegram 认证

使用 Telegram WebApp InitData 验证：
1. 检查 `hash` 签名
2. 验证 `auth_date` 时效性
3. 解析用户信息

### 数据隔离

- 所有查询都基于 `user_id` 过滤
- 禁止跨用户访问
- 文件上传路径隔离：`{type}/{user_id}/{file_id}`

### 速率限制

- 免费用户：3 次/天
- Pro 用户：999 次/天
- 基于 KV 存储，自动过期

---

## 🚀 未来规划

### Phase 1: MVP（已完成）
- ✅ 快速创作流程
- ✅ 三种创作模式
- ✅ 导出到 Suno/Tunee

### Phase 2: 多模态（进行中）
- ✅ 音频分析（Gemini 3）
- ✅ 图片分析（Gemini 3）
- ⏳ 视频分析
- ⏳ 语音输入

### Phase 3: 社交化
- ⏳ 分享到 Telegram 频道
- ⏳ 好友协作编辑
- ⏳ 作品广场

### Phase 4: 商业化
- ⏳ Telegram Stars 支付集成
- ⏳ Pro 订阅
- ⏳ 推荐系统

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 📄 License

MIT License

---

## 🙏 致谢

- 基于 [Musicify CLI](https://github.com/wordflowlab/musicify) 项目
- 使用 Cloudflare 全栈技术
- 感谢 Gemini 3 的多模态能力

**版本**: v1.0.0
**状态**: ✅ 核心功能完成，可部署测试
