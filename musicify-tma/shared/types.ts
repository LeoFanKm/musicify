// ============================================================================
// Musicify Telegram Mini APP - 共享类型定义
// ============================================================================

// ---------------------------------------------------------------------------
// 用户相关
// ---------------------------------------------------------------------------

export interface User {
  id: string;
  telegramId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
  languageCode?: string;
  tier: 'free' | 'pro';
  createdAt: string;
  lastActiveAt: string;
}

export interface UserUsage {
  userId: string;
  date: string;
  count: number;
  limit: number;
}

// ---------------------------------------------------------------------------
// 歌曲项目相关
// ---------------------------------------------------------------------------

export type SongType =
  | '流行' | '摇滚' | '说唱' | '民谣' | '电子'
  | '古风' | 'R&B' | '爵士' | '乡村' | '金属';

export type SongMood =
  | '抒情' | '激昂' | '轻快' | '忧郁' | '治愈'
  | '浪漫' | '励志' | '怀旧' | '叛逆';

export type Language = '中文' | '英文' | '粤语' | '日语' | '韩语' | '混合';

export interface SongSpec {
  type: SongType;
  mood: SongMood;
  language: Language;
  duration?: string; // e.g., "3:30"
  targetPlatform?: string; // e.g., "Suno", "Tunee"
  targetAudience?: string;
  customStyle?: string;
}

export interface SongStructure {
  parts: SongPart[];
}

export interface SongPart {
  type: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'pre-chorus';
  label: string; // e.g., "Verse 1", "Chorus"
  lyrics: string;
  rhymeScheme?: string;
  notes?: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  spec: SongSpec;
  theme?: string;
  structure?: SongStructure;
  lyrics?: string;
  fullLyrics?: string; // 完整歌词文本

  // 作曲辅助
  chords?: string;
  melodyHint?: string;
  abcNotation?: string;

  // 导出
  sunoPrompt?: string;
  tuneePrompt?: string;

  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'exported';
}

// ---------------------------------------------------------------------------
// 创作模式
// ---------------------------------------------------------------------------

export type CreationMode = 'coach' | 'express' | 'hybrid';

export interface CreationRequest {
  mode: CreationMode;
  spec: SongSpec;
  theme?: string;
  referenceAudio?: string; // R2 URL
  referenceImage?: string; // R2 URL
  userInput?: string; // 用户额外输入
}

export interface CreationResponse {
  projectId: string;
  lyrics?: string;
  structure?: SongStructure;
  suggestions?: string[];
  nextStep?: string;
}

// ---------------------------------------------------------------------------
// 多模态功能
// ---------------------------------------------------------------------------

export interface AudioAnalysisRequest {
  audioUrl: string;
  analysisType: 'style' | 'mood' | 'rhythm' | 'all';
}

export interface AudioAnalysisResponse {
  style?: string;
  mood?: string;
  rhythm?: {
    bpm?: number;
    timeSignature?: string;
  };
  instruments?: string[];
  sunoPrompt?: string;
  description: string;
}

export interface ImageAnalysisRequest {
  imageUrl: string;
}

export interface ImageAnalysisResponse {
  colors: string[];
  mood: string;
  scene: string;
  musicStyle: string;
  sunoPrompt: string;
  description: string;
}

// ---------------------------------------------------------------------------
// 导出功能
// ---------------------------------------------------------------------------

export type ExportFormat = 'suno' | 'tunee' | 'generic' | 'lyrics-only';

export interface ExportRequest {
  projectId: string;
  format: ExportFormat;
}

export interface ExportResponse {
  format: ExportFormat;
  content: string;
  downloadUrl?: string; // For file exports
}

// ---------------------------------------------------------------------------
// API 请求/响应
// ---------------------------------------------------------------------------

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface GenerateLyricsRequest {
  projectId: string;
  mode: CreationMode;
  spec: SongSpec;
  theme?: string;
  partType?: SongPart['type'];
  context?: string; // 之前的歌词内容作为上下文
}

export interface GenerateLyricsResponse {
  lyrics: string;
  rhymeAnalysis?: {
    scheme: string;
    quality: number; // 0-100
    suggestions?: string[];
  };
}

// ---------------------------------------------------------------------------
// Telegram Mini APP 相关
// ---------------------------------------------------------------------------

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

// ---------------------------------------------------------------------------
// AI 配置
// ---------------------------------------------------------------------------

export interface AIModelConfig {
  provider: 'openrouter';
  model: 'google/gemini-2.0-flash-exp:free' | 'openai/gpt-4.5-preview' | string;
  temperature?: number;
  maxTokens?: number;
}

export const DEFAULT_AI_CONFIG: AIModelConfig = {
  provider: 'openrouter',
  model: 'google/gemini-2.0-flash-exp:free', // Gemini 3 (免费)
  temperature: 0.7,
  maxTokens: 4096,
};

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

export const USAGE_LIMITS = {
  free: 3,    // 免费用户每天 3 次
  pro: 999,   // 付费用户无限制
} as const;

export const SONG_TYPES: SongType[] = [
  '流行', '摇滚', '说唱', '民谣', '电子',
  '古风', 'R&B', '爵士', '乡村', '金属',
];

export const SONG_MOODS: SongMood[] = [
  '抒情', '激昂', '轻快', '忧郁', '治愈',
  '浪漫', '励志', '怀旧', '叛逆',
];

export const LANGUAGES: Language[] = [
  '中文', '英文', '粤语', '日语', '韩语', '混合',
];
