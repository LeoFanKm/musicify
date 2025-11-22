import { UserUsage, USAGE_LIMITS } from '@shared/types';

/**
 * 获取用户今日使用量
 */
export async function checkUsageLimit(
  kv: KVNamespace,
  userId: string,
  tier: 'free' | 'pro'
): Promise<UserUsage> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const key = `usage:${userId}:${today}`;

  const count = await kv.get(key);

  return {
    userId,
    date: today,
    count: count ? parseInt(count) : 0,
    limit: USAGE_LIMITS[tier],
  };
}

/**
 * 增加使用计数
 */
export async function incrementUsage(
  kv: KVNamespace,
  userId: string
): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  const key = `usage:${userId}:${today}`;

  const currentCount = await kv.get(key);
  const newCount = (currentCount ? parseInt(currentCount) : 0) + 1;

  // 设置过期时间为明天 00:00（自动清理）
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const expirationTtl = Math.floor((tomorrow.getTime() - Date.now()) / 1000);

  await kv.put(key, newCount.toString(), { expirationTtl });

  return newCount;
}
