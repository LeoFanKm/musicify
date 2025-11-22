import { Hono } from 'hono';
import { Env } from '../types/env';
import { telegramAuth } from '../middleware/auth';
import { getUserById, createUser, updateUser } from '../services/db';
import { checkUsageLimit } from '../services/usage';
import { User, UserUsage } from '@shared/types';

export const userRoutes = new Hono<{ Bindings: Env }>();

// 所有用户路由都需要认证
userRoutes.use('/*', telegramAuth);

// 获取当前用户信息
userRoutes.get('/me', async (c) => {
  const telegramUser = c.get('telegramUser') as any;

  // 从数据库获取或创建用户
  let user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    user = await createUser(c.env.DB, {
      telegramId: telegramUser.id,
      username: telegramUser.username,
      firstName: telegramUser.first_name,
      lastName: telegramUser.last_name,
      languageCode: telegramUser.language_code,
      tier: 'free',
    });
  } else {
    // 更新最后活跃时间
    await updateUser(c.env.DB, user.id, {
      lastActiveAt: new Date().toISOString(),
    });
  }

  return c.json({
    success: true,
    data: user,
  });
});

// 获取使用量统计
userRoutes.get('/usage', async (c) => {
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      },
    }, 404);
  }

  const usage = await checkUsageLimit(c.env.KV, user.id, user.tier);

  return c.json({
    success: true,
    data: usage,
  });
});
