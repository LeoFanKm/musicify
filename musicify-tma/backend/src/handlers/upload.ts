import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { Env } from '../types/env';
import { telegramAuth } from '../middleware/auth';
import { getUserById } from '../services/db';

export const uploadRoutes = new Hono<{ Bindings: Env }>();

uploadRoutes.use('/*', telegramAuth);

// 上传音频文件
uploadRoutes.post('/audio', async (c) => {
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
    }, 400);
  }

  // 验证文件类型
  if (!file.type.startsWith('audio/')) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid file type. Must be audio.' },
    }, 400);
  }

  // 限制文件大小（10MB）
  if (file.size > 10 * 1024 * 1024) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'File too large. Max 10MB.' },
    }, 400);
  }

  // 生成唯一文件名
  const fileId = nanoid();
  const ext = file.name.split('.').pop() || 'mp3';
  const key = `audio/${user.id}/${fileId}.${ext}`;

  // 上传到 R2
  await c.env.STORAGE.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // 生成公开 URL（需要配置 R2 public bucket 或使用 signed URLs）
  const url = `https://storage.musicify.app/${key}`;

  return c.json({
    success: true,
    data: {
      url,
      fileId,
      fileName: file.name,
      fileSize: file.size,
    },
  });
});

// 上传图片文件
uploadRoutes.post('/image', async (c) => {
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'No file uploaded' },
    }, 400);
  }

  // 验证文件类型
  if (!file.type.startsWith('image/')) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'Invalid file type. Must be image.' },
    }, 400);
  }

  // 限制文件大小（5MB）
  if (file.size > 5 * 1024 * 1024) {
    return c.json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'File too large. Max 5MB.' },
    }, 400);
  }

  // 生成唯一文件名
  const fileId = nanoid();
  const ext = file.name.split('.').pop() || 'jpg';
  const key = `images/${user.id}/${fileId}.${ext}`;

  // 上传到 R2
  await c.env.STORAGE.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  // 生成公开 URL
  const url = `https://storage.musicify.app/${key}`;

  return c.json({
    success: true,
    data: {
      url,
      fileId,
      fileName: file.name,
      fileSize: file.size,
    },
  });
});
