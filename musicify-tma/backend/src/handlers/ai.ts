import { Hono } from 'hono';
import { Env } from '../types/env';
import { telegramAuth } from '../middleware/auth';
import { analyzeAudio, analyzeImage } from '../services/ai';
import { getUserById } from '../services/db';

export const aiRoutes = new Hono<{ Bindings: Env }>();

aiRoutes.use('/*', telegramAuth);

// 分析音频
aiRoutes.post('/analyze/audio', async (c) => {
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const { audioUrl } = await c.req.json();

  if (!audioUrl) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Missing audioUrl' },
    }, 400);
  }

  const analysis = await analyzeAudio(c.env, audioUrl);

  return c.json({
    success: true,
    data: analysis,
  });
});

// 分析图片
aiRoutes.post('/analyze/image', async (c) => {
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const { imageUrl } = await c.req.json();

  if (!imageUrl) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Missing imageUrl' },
    }, 400);
  }

  const analysis = await analyzeImage(c.env, imageUrl);

  return c.json({
    success: true,
    data: analysis,
  });
});
