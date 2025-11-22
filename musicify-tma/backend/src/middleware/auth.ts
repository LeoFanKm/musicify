import { Context } from 'hono';
import { createHmac } from 'crypto';
import { Env } from '../types/env';

interface TelegramInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  };
  auth_date: number;
  hash: string;
}

/**
 * 验证 Telegram InitData
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function parseTelegramInitData(initData: string): TelegramInitData | null {
  try {
    const params = new URLSearchParams(initData);
    const data: any = {};

    params.forEach((value, key) => {
      if (key === 'user') {
        data.user = JSON.parse(value);
      } else if (key === 'auth_date') {
        data.auth_date = parseInt(value);
      } else {
        data[key] = value;
      }
    });

    return data as TelegramInitData;
  } catch (error) {
    return null;
  }
}

export function verifyTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) return false;

    // 移除 hash 参数
    params.delete('hash');

    // 按字母顺序排序
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // 计算 secret_key
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // 计算 hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram init data verification error:', error);
    return false;
  }
}

/**
 * Telegram 认证中间件
 */
export async function telegramAuth(c: Context<{ Bindings: Env }>, next: () => Promise<void>) {
  const initData = c.req.header('X-Telegram-Init-Data');

  if (!initData) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Missing Telegram init data',
      },
    }, 401);
  }

  // 在开发环境跳过验证
  const isDev = c.env.ENVIRONMENT === 'development';

  if (!isDev) {
    const isValid = verifyTelegramInitData(initData, c.env.TELEGRAM_BOT_TOKEN);

    if (!isValid) {
      return c.json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid Telegram init data',
        },
      }, 401);
    }
  }

  // 解析用户信息
  const data = parseTelegramInitData(initData);

  if (!data?.user) {
    return c.json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid user data',
      },
    }, 401);
  }

  // 将用户信息存储到上下文
  c.set('telegramUser', data.user);

  await next();
}
