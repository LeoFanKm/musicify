import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { Env } from '../types/env';
import { telegramAuth } from '../middleware/auth';
import {
  getUserById,
  createProject,
  getProjectById,
  getUserProjects,
  updateProject as dbUpdateProject,
  deleteProject as dbDeleteProject,
} from '../services/db';
import { checkUsageLimit, incrementUsage } from '../services/usage';
import { generateLyrics, generateChords, exportToSuno, exportToTunee } from '../services/ai';
import { Project } from '@shared/types';

export const projectRoutes = new Hono<{ Bindings: Env }>();

// 所有项目路由都需要认证
projectRoutes.use('/*', telegramAuth);

// 获取用户的所有项目
projectRoutes.get('/', async (c) => {
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const projects = await getUserProjects(c.env.DB, user.id);

  return c.json({
    success: true,
    data: projects,
  });
});

// 获取单个项目
projectRoutes.get('/:id', async (c) => {
  const projectId = c.req.param('id');
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const project = await getProjectById(c.env.DB, projectId);

  if (!project) {
    return c.json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    }, 404);
  }

  // 验证所有权
  if (project.userId !== user.id) {
    return c.json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Access denied' },
    }, 403);
  }

  return c.json({
    success: true,
    data: project,
  });
});

// 创建新项目
projectRoutes.post('/', async (c) => {
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  // 检查使用限制
  const usage = await checkUsageLimit(c.env.KV, user.id, user.tier);
  if (usage.count >= usage.limit) {
    return c.json({
      success: false,
      error: {
        code: 'USAGE_LIMIT_EXCEEDED',
        message: `Daily limit reached (${usage.limit} generations/day)`,
      },
    }, 429);
  }

  const body = await c.req.json();
  const { spec, mode, title, theme } = body;

  const project = await createProject(c.env.DB, {
    userId: user.id,
    title: title || `${spec.type}歌曲 - ${new Date().toLocaleDateString()}`,
    spec,
    theme,
    status: 'draft',
  });

  return c.json({
    success: true,
    data: project,
  });
});

// 更新项目
projectRoutes.patch('/:id', async (c) => {
  const projectId = c.req.param('id');
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const project = await getProjectById(c.env.DB, projectId);

  if (!project || project.userId !== user.id) {
    return c.json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    }, 404);
  }

  const updates = await c.req.json();
  const updatedProject = await dbUpdateProject(c.env.DB, projectId, updates);

  return c.json({
    success: true,
    data: updatedProject,
  });
});

// 删除项目
projectRoutes.delete('/:id', async (c) => {
  const projectId = c.req.param('id');
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const project = await getProjectById(c.env.DB, projectId);

  if (!project || project.userId !== user.id) {
    return c.json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    }, 404);
  }

  await dbDeleteProject(c.env.DB, projectId);

  return c.json({
    success: true,
    data: { deleted: true },
  });
});

// 生成歌词
projectRoutes.post('/:id/generate', async (c) => {
  const projectId = c.req.param('id');
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  // 检查使用限制
  const usage = await checkUsageLimit(c.env.KV, user.id, user.tier);
  if (usage.count >= usage.limit) {
    return c.json({
      success: false,
      error: {
        code: 'USAGE_LIMIT_EXCEEDED',
        message: `Daily limit reached (${usage.limit} generations/day)`,
      },
    }, 429);
  }

  const project = await getProjectById(c.env.DB, projectId);

  if (!project || project.userId !== user.id) {
    return c.json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    }, 404);
  }

  const { mode, spec, theme } = await c.req.json();

  // 生成歌词
  const lyrics = await generateLyrics(c.env, {
    mode: mode || 'express',
    spec: spec || project.spec,
    theme: theme || project.theme,
  });

  // 更新项目
  const updatedProject = await dbUpdateProject(c.env.DB, projectId, {
    lyrics,
    status: 'completed',
  });

  // 增加使用计数
  await incrementUsage(c.env.KV, user.id);

  return c.json({
    success: true,
    data: { lyrics },
  });
});

// 导出项目
projectRoutes.post('/:id/export', async (c) => {
  const projectId = c.req.param('id');
  const telegramUser = c.get('telegramUser') as any;
  const user = await getUserById(c.env.DB, telegramUser.id.toString());

  if (!user) {
    return c.json({
      success: false,
      error: { code: 'USER_NOT_FOUND', message: 'User not found' },
    }, 404);
  }

  const project = await getProjectById(c.env.DB, projectId);

  if (!project || project.userId !== user.id) {
    return c.json({
      success: false,
      error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found' },
    }, 404);
  }

  const { format } = await c.req.json();

  let content = '';

  if (format === 'suno') {
    content = await exportToSuno(c.env, project);
  } else if (format === 'tunee') {
    content = await exportToTunee(c.env, project);
  } else {
    content = project.lyrics || '';
  }

  // 更新状态
  await dbUpdateProject(c.env.DB, projectId, {
    status: 'exported',
  });

  return c.json({
    success: true,
    data: { format, content },
  });
});
