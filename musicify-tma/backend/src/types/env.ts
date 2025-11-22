export interface Env {
  // Cloudflare 绑定
  DB: D1Database;
  STORAGE: R2Bucket;
  KV: KVNamespace;

  // 环境变量
  ENVIRONMENT: string;
  OPENROUTER_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;

  // Secrets（通过 wrangler secret 设置）
  // wrangler secret put OPENROUTER_API_KEY
  // wrangler secret put TELEGRAM_BOT_TOKEN
}
