import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types/env';

// 路由处理器
import { userRoutes } from './handlers/user';
import { projectRoutes } from './handlers/project';
import { aiRoutes } from './handlers/ai';
import { uploadRoutes } from './handlers/upload';

const app = new Hono<{ Bindings: Env }>();

// CORS 配置
app.use('/*', cors({
  origin: '*', // 生产环境应该限制为特定域名
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Telegram-Init-Data'],
}));

// 健康检查
app.get('/', (c) => {
  return c.json({
    success: true,
    data: {
      service: 'Musicify TMA API',
      version: '1.0.0',
      status: 'running',
    },
  });
});

// 路由
app.route('/api/v1/user', userRoutes);
app.route('/api/v1/projects', projectRoutes);
app.route('/api/v1/ai', aiRoutes);
app.route('/api/v1/upload', uploadRoutes);

// 404 处理
app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  }, 404);
});

// 错误处理
app.onError((err, c) => {
  console.error('Error:', err);

  return c.json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error',
    },
  }, 500);
});

export default app;
