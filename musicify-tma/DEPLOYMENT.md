# Musicify TMA 部署指南

## 📋 部署前准备

### 1. 注册必要账号

- ✅ [Cloudflare](https://dash.cloudflare.com/sign-up) - 免费计划即可
- ✅ [OpenRouter](https://openrouter.ai/) - 获取 API Key
- ✅ [Telegram Bot](https://t.me/BotFather) - 创建 Bot 并获取 Token

### 2. 安装工具

```bash
# 安装 Cloudflare Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

---

## 🔧 后端部署

### Step 1: 创建 Cloudflare 资源

```bash
cd backend

# 1. 创建 D1 数据库
wrangler d1 create musicify-db
# 输出: database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# 复制 database_id 到 wrangler.toml

# 2. 初始化数据库表
wrangler d1 execute musicify-db --file=./schema.sql

# 3. 创建 R2 存储桶
wrangler r2 bucket create musicify-storage

# 4. 创建 KV 命名空间
wrangler kv:namespace create "musicify-kv"
# 输出: id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
# 复制 id 到 wrangler.toml

# 5. 创建开发环境的 KV 命名空间
wrangler kv:namespace create "musicify-kv" --preview
```

### Step 2: 配置 wrangler.toml

编辑 `backend/wrangler.toml`，填入刚才生成的 ID：

```toml
name = "musicify-tma-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "musicify-db"
database_id = "你的-database-id" # ← 填入 Step 1 生成的 ID

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "musicify-storage"

[[kv_namespaces]]
binding = "KV"
id = "你的-kv-id" # ← 填入 Step 1 生成的 ID
```

### Step 3: 设置 Secrets

```bash
# 设置 OpenRouter API Key
wrangler secret put OPENROUTER_API_KEY
# 提示输入时，粘贴你的 OpenRouter API Key

# 设置 Telegram Bot Token
wrangler secret put TELEGRAM_BOT_TOKEN
# 提示输入时，粘贴你的 Telegram Bot Token
```

### Step 4: 部署后端

```bash
# 部署到生产环境
npm run deploy

# 部署成功后，会输出 Worker URL，例如：
# https://musicify-tma-api.your-subdomain.workers.dev
```

**记录这个 URL**，稍后配置前端时需要用到。

---

## 🎨 前端部署

### Step 1: 配置环境变量

创建 `frontend/.env.production`：

```env
VITE_API_BASE_URL=https://musicify-tma-api.your-subdomain.workers.dev
```

将 `your-subdomain` 替换为上面部署后端时得到的实际域名。

### Step 2: 构建前端

```bash
cd frontend

# 安装依赖
npm install

# 构建生产版本
npm run build
```

### Step 3: 部署到 Cloudflare Pages

#### 方式 1: 使用 Wrangler CLI

```bash
# 在 frontend 目录下执行
npx wrangler pages deploy dist --project-name=musicify-tma

# 首次部署会提示创建项目，选择 "Create a new project"
# 部署成功后会输出访问 URL：
# https://musicify-tma.pages.dev
```

#### 方式 2: 通过 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** → **Create a project**
3. 选择 **Direct Upload**
4. 上传 `frontend/dist` 目录
5. 设置项目名称：`musicify-tma`
6. 点击 **Deploy**

**记录前端 URL**，例如：`https://musicify-tma.pages.dev`

---

## 🤖 配置 Telegram Bot

### Step 1: 设置 Bot 菜单按钮

向 [@BotFather](https://t.me/BotFather) 发送以下命令：

```
/mybots
→ 选择你的 Bot
→ Edit Bot
→ Edit Bot Menu Button
→ Configure Menu Button
```

输入：
```
URL: https://musicify-tma.pages.dev
Text: 🎵 开始创作
```

### Step 2: 设置 Bot 命令

```
/mybots
→ 选择你的 Bot
→ Edit Commands

输入以下内容：
start - 开始使用 Musicify
create - 创作新歌曲
projects - 我的项目
help - 帮助
```

### Step 3: 设置 Bot 描述

```
/mybots
→ 选择你的 Bot
→ Edit Description

输入：
Musicify - AI 驱动的音乐创作助手

✨ 3 分钟从灵感到歌词
🎵 支持 10+ 音乐风格
🎨 多模态创作（音频+图片）
📤 一键导出到 Suno/Tunee
```

---

## 🧪 测试部署

### 1. 测试后端 API

```bash
# 健康检查
curl https://musicify-tma-api.your-subdomain.workers.dev

# 应该返回：
# {"success":true,"data":{"service":"Musicify TMA API","version":"1.0.0","status":"running"}}
```

### 2. 测试前端

1. 在 Telegram 中打开你的 Bot
2. 点击菜单按钮 "🎵 开始创作"
3. 应该打开 Musicify TMA 界面
4. 测试创建新歌曲流程

### 3. 测试完整流程

1. **创建项目**：
   - 选择类型：流行
   - 选择氛围：抒情
   - 输入主题："思念远方的朋友"
   - 点击"开始创作"

2. **生成歌词**：
   - 等待 AI 生成歌词（约 10-30 秒）
   - 检查歌词质量

3. **导出**：
   - 点击"导出到 Suno"
   - 复制 Prompt

4. **多模态测试**：
   - 上传一张图片
   - 查看 AI 分析结果
   - 生成的 Suno Prompt 是否合理

---

## 📊 监控和日志

### 查看 Worker 日志

```bash
# 实时查看日志
wrangler tail musicify-tma-api

# 过滤错误日志
wrangler tail musicify-tma-api --format json | grep error
```

### 查看数据库

```bash
# 查询用户数
wrangler d1 execute musicify-db --command "SELECT COUNT(*) FROM users"

# 查询项目数
wrangler d1 execute musicify-db --command "SELECT COUNT(*) FROM projects"

# 查看最近的项目
wrangler d1 execute musicify-db --command "SELECT * FROM projects ORDER BY created_at DESC LIMIT 10"
```

### 监控 KV 存储

```bash
# 列出所有 KV keys
wrangler kv:key list --namespace-id=你的-kv-id

# 查看特定用户的使用量
wrangler kv:key get "usage:user_xxx:2024-01-20" --namespace-id=你的-kv-id
```

---

## 🔄 更新部署

### 更新后端

```bash
cd backend

# 修改代码后，重新部署
npm run deploy
```

### 更新前端

```bash
cd frontend

# 修改代码后，重新构建和部署
npm run build
npx wrangler pages deploy dist --project-name=musicify-tma
```

### 更新数据库 Schema

```bash
# 如果需要添加新表或字段
cd backend

# 方式 1: 执行 SQL 文件
wrangler d1 execute musicify-db --file=./migrations/001_add_new_table.sql

# 方式 2: 直接执行命令
wrangler d1 execute musicify-db --command "ALTER TABLE users ADD COLUMN avatar_url TEXT"
```

---

## 🛡️ 安全配置

### 1. 限制 CORS

编辑 `backend/src/index.ts`，修改 CORS 配置：

```typescript
app.use('/*', cors({
  origin: 'https://musicify-tma.pages.dev', // 只允许你的前端域名
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Telegram-Init-Data'],
}));
```

### 2. 配置 R2 公共访问

如果需要公开访问上传的文件：

```bash
# 创建自定义域名绑定（需要在 Cloudflare Dashboard 操作）
# 1. 进入 R2 → musicify-storage → Settings
# 2. 点击 "Connect Domain"
# 3. 输入：storage.your-domain.com
# 4. 添加 DNS 记录
```

### 3. 设置速率限制

可以在 Worker 中添加更严格的速率限制：

```typescript
// backend/src/middleware/rate-limit.ts
export async function rateLimit(c: Context, limit: number) {
  const userId = c.get('telegramUser').id;
  const key = `rate_limit:${userId}:${Date.now()}`;

  const count = await c.env.KV.get(key);
  if (count && parseInt(count) >= limit) {
    return c.json({ error: 'Too many requests' }, 429);
  }

  await c.env.KV.put(key, (parseInt(count || '0') + 1).toString(), {
    expirationTtl: 60, // 1 分钟过期
  });
}
```

---

## 💰 成本估算

### Cloudflare Workers（免费计划）

| 资源 | 免费额度 | 超出后价格 |
|------|---------|-----------|
| 请求数 | 100,000 / 天 | $0.50 / 百万请求 |
| CPU 时间 | 10ms / 请求 | $0.02 / 百万 GB-秒 |

### D1 数据库（免费计划）

| 资源 | 免费额度 | 超出后价格 |
|------|---------|-----------|
| 读取 | 500 万 / 天 | $0.001 / 千次读取 |
| 写入 | 10 万 / 天 | $1.00 / 百万次写入 |
| 存储 | 5 GB | $0.75 / GB-月 |

### R2 对象存储（免费计划）

| 资源 | 免费额度 | 超出后价格 |
|------|---------|-----------|
| 存储 | 10 GB | $0.015 / GB-月 |
| 写入 | 100 万 / 月 | $4.50 / 百万请求 |
| 读取 | 1000 万 / 月 | 免费 |

### OpenRouter API

| 模型 | 价格（每百万 tokens） |
|------|---------------------|
| Gemini 3 Flash | 免费（有配额限制） |
| GPT-4.5 | ~$10-20 |

**预估**：1000 个月活用户，每人每天创作 2 次，月成本约 **$5-10**（主要是 AI API 费用）。

---

## 🐛 常见问题

### 1. "Unauthorized" 错误

**原因**：Telegram InitData 验证失败

**解决**：
- 检查 `TELEGRAM_BOT_TOKEN` 是否正确设置
- 确认在开发环境设置了 `ENVIRONMENT=development`（跳过验证）

### 2. 数据库查询失败

**原因**：D1 数据库未正确绑定

**解决**：
```bash
# 检查 wrangler.toml 中的 database_id 是否正确
wrangler d1 list

# 重新绑定
wrangler d1 execute musicify-db --file=./schema.sql
```

### 3. 文件上传失败

**原因**：R2 存储桶未正确配置

**解决**：
```bash
# 检查存储桶是否存在
wrangler r2 bucket list

# 重新创建
wrangler r2 bucket create musicify-storage
```

### 4. AI 生成超时

**原因**：OpenRouter API 响应慢

**解决**：
- 检查网络连接
- 尝试使用更快的模型（如 Gemini 3 Flash）
- 增加请求超时时间

---

## 🎉 部署完成！

恭喜！你的 Musicify TMA 已经成功部署。

**下一步**：
1. 在 Telegram 中测试完整流程
2. 邀请朋友试用并收集反馈
3. 根据反馈迭代优化
4. 考虑推广策略（Telegram 频道、群组等）

**推广建议**：
- 在音乐创作相关的 Telegram 群组分享
- 制作演示视频发布到社交媒体
- 联系音乐博主/UP主合作推广
- 参与 Telegram Mini APP 相关社区

祝你的产品大获成功！🚀
