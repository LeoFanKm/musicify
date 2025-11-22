import { nanoid } from 'nanoid';
import { User, Project } from '@shared/types';

// ============================================================================
// User Operations
// ============================================================================

export async function getUserById(db: D1Database, id: string): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first();

  if (!result) return null;

  return parseUser(result);
}

export async function getUserByTelegramId(db: D1Database, telegramId: number): Promise<User | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE telegram_id = ?')
    .bind(telegramId)
    .first();

  if (!result) return null;

  return parseUser(result);
}

export async function createUser(
  db: D1Database,
  data: {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
    languageCode?: string;
    tier: 'free' | 'pro';
  }
): Promise<User> {
  const id = nanoid();
  const now = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO users (id, telegram_id, username, first_name, last_name, language_code, tier, created_at, last_active_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      data.telegramId,
      data.username || null,
      data.firstName || null,
      data.lastName || null,
      data.languageCode || null,
      data.tier,
      now,
      now
    )
    .run();

  return {
    id,
    telegramId: data.telegramId,
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    languageCode: data.languageCode,
    tier: data.tier,
    createdAt: now,
    lastActiveAt: now,
  };
}

export async function updateUser(
  db: D1Database,
  id: string,
  updates: Partial<User>
): Promise<User> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.tier !== undefined) {
    fields.push('tier = ?');
    values.push(updates.tier);
  }

  if (updates.lastActiveAt !== undefined) {
    fields.push('last_active_at = ?');
    values.push(updates.lastActiveAt);
  }

  if (fields.length > 0) {
    values.push(id);

    await db
      .prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();
  }

  const user = await getUserById(db, id);
  if (!user) throw new Error('User not found after update');

  return user;
}

function parseUser(row: any): User {
  return {
    id: row.id,
    telegramId: row.telegram_id,
    username: row.username || undefined,
    firstName: row.first_name || undefined,
    lastName: row.last_name || undefined,
    languageCode: row.language_code || undefined,
    tier: row.tier,
    createdAt: row.created_at,
    lastActiveAt: row.last_active_at,
  };
}

// ============================================================================
// Project Operations
// ============================================================================

export async function getProjectById(db: D1Database, id: string): Promise<Project | null> {
  const result = await db
    .prepare('SELECT * FROM projects WHERE id = ?')
    .bind(id)
    .first();

  if (!result) return null;

  return parseProject(result);
}

export async function getUserProjects(db: D1Database, userId: string): Promise<Project[]> {
  const results = await db
    .prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
    .bind(userId)
    .all();

  return results.results.map(parseProject);
}

export async function createProject(
  db: D1Database,
  data: {
    userId: string;
    title: string;
    spec: any;
    theme?: string;
    status: string;
  }
): Promise<Project> {
  const id = nanoid();
  const now = new Date().toISOString();

  await db
    .prepare(`
      INSERT INTO projects (id, user_id, title, spec, theme, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    .bind(
      id,
      data.userId,
      data.title,
      JSON.stringify(data.spec),
      data.theme || null,
      data.status,
      now,
      now
    )
    .run();

  return {
    id,
    userId: data.userId,
    title: data.title,
    spec: data.spec,
    theme: data.theme,
    status: data.status as any,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateProject(
  db: D1Database,
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.title !== undefined) {
    fields.push('title = ?');
    values.push(updates.title);
  }

  if (updates.spec !== undefined) {
    fields.push('spec = ?');
    values.push(JSON.stringify(updates.spec));
  }

  if (updates.theme !== undefined) {
    fields.push('theme = ?');
    values.push(updates.theme);
  }

  if (updates.lyrics !== undefined) {
    fields.push('lyrics = ?');
    values.push(updates.lyrics);
  }

  if (updates.chords !== undefined) {
    fields.push('chords = ?');
    values.push(updates.chords);
  }

  if (updates.sunoPrompt !== undefined) {
    fields.push('suno_prompt = ?');
    values.push(updates.sunoPrompt);
  }

  if (updates.tuneePrompt !== undefined) {
    fields.push('tunee_prompt = ?');
    values.push(updates.tuneePrompt);
  }

  if (updates.status !== undefined) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  fields.push('updated_at = ?');
  values.push(new Date().toISOString());

  values.push(id);

  await db
    .prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`)
    .bind(...values)
    .run();

  const project = await getProjectById(db, id);
  if (!project) throw new Error('Project not found after update');

  return project;
}

export async function deleteProject(db: D1Database, id: string): Promise<void> {
  await db.prepare('DELETE FROM projects WHERE id = ?').bind(id).run();
}

function parseProject(row: any): Project {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    spec: JSON.parse(row.spec),
    theme: row.theme || undefined,
    lyrics: row.lyrics || undefined,
    chords: row.chords || undefined,
    sunoPrompt: row.suno_prompt || undefined,
    tuneePrompt: row.tunee_prompt || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
