import { Env } from '../types/env';
import {
  CreationRequest,
  AudioAnalysisResponse,
  ImageAnalysisResponse,
  Project,
  DEFAULT_AI_CONFIG,
} from '@shared/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

/**
 * 调用 OpenRouter API
 */
async function callOpenRouter(
  env: Env,
  messages: Array<{ role: string; content: string }>,
  model?: string
): Promise<string> {
  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://musicify.app',
      'X-Title': 'Musicify TMA',
    },
    body: JSON.stringify({
      model: model || DEFAULT_AI_CONFIG.model,
      messages,
      temperature: DEFAULT_AI_CONFIG.temperature,
      max_tokens: DEFAULT_AI_CONFIG.maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * 生成歌词
 */
export async function generateLyrics(
  env: Env,
  request: CreationRequest
): Promise<string> {
  const { mode, spec, theme } = request;

  let systemPrompt = '';
  let userPrompt = '';

  if (mode === 'express') {
    systemPrompt = `你是一位专业的歌词创作者，擅长各种风格的歌词创作。
你的任务是根据用户提供的规格和主题，直接生成完整的歌词。

歌词要求：
1. 符合指定的音乐类型和情绪氛围
2. 押韵自然，不要为了押韵而牺牲意境
3. 使用意象和隐喻，避免过于直白的表达
4. 结构清晰，标注每个段落（如 [Verse 1], [Chorus], [Bridge]）
5. 可唱性强，注意音节和节奏

请用 ${spec.language} 创作。`;

    userPrompt = `请根据以下信息创作一首完整的歌词：

【歌曲类型】${spec.type}
【情绪氛围】${spec.mood}
【语言】${spec.language}
【主题】${theme || '未指定'}

请直接输出歌词，包含完整结构（Intro/Verse/Chorus/Bridge/Outro）。`;
  } else if (mode === 'coach') {
    systemPrompt = `你是一位专业的歌词创作教练，你的任务是引导用户思考，而不是直接提供答案。
通过提问的方式激发用户的创意，帮助他们完成 100% 原创的歌词。`;

    userPrompt = `我想创作一首${spec.type}风格、${spec.mood}氛围的歌词。
主题：${theme || '未确定'}

请通过 3-5 个问题引导我思考第一段的创作方向。`;
  } else {
    // hybrid mode
    systemPrompt = `你是一位专业的歌词创作助手，你的任务是提供歌词框架和关键句，留出空白让用户填充。
这样既给用户提供了结构指引，又保留了创作空间。`;

    userPrompt = `请为以下歌曲生成一个歌词框架：

【歌曲类型】${spec.type}
【情绪氛围】${spec.mood}
【语言】${spec.language}
【主题】${theme || '未指定'}

框架要求：
1. 提供完整结构
2. 每段给出 1-2 个关键句
3. 标注 [待填充] 的位置
4. 给出押韵提示`;
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  return await callOpenRouter(env, messages);
}

/**
 * 分析音频
 */
export async function analyzeAudio(
  env: Env,
  audioUrl: string
): Promise<AudioAnalysisResponse> {
  const systemPrompt = `你是一位专业的音乐分析师，擅长分析音频的风格、情绪、节奏等特征。
请根据音频内容，分析其音乐风格、情绪氛围、节奏特点、乐器配置等，并生成适合在 Suno AI 中复刻的 Prompt。`;

  const userPrompt = `请分析这段音频：${audioUrl}

请提供以下信息：
1. 音乐风格（如：流行摇滚、电子舞曲、民谣等）
2. 情绪氛围（如：激昂、温暖、忧郁等）
3. 节奏信息（BPM、拍号）
4. 主要乐器
5. Suno AI Prompt（用于复刻这个风格）

请以 JSON 格式返回。`;

  const response = await callOpenRouter(
    env,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    'google/gemini-2.0-flash-exp:free' // 使用 Gemini 3 的多模态能力
  );

  // 解析 JSON 响应
  try {
    return JSON.parse(response);
  } catch {
    // 如果解析失败，返回基本结构
    return {
      description: response,
      sunoPrompt: '根据分析生成的 Prompt',
    };
  }
}

/**
 * 分析图片
 */
export async function analyzeImage(
  env: Env,
  imageUrl: string
): Promise<ImageAnalysisResponse> {
  const systemPrompt = `你是一位专业的视觉音乐顾问，擅长从图片中提取情绪和氛围，并将其转化为音乐创作灵感。
请分析图片的色彩、场景、情绪，并推荐匹配的音乐风格和 Suno Prompt。`;

  const userPrompt = `请分析这张图片：${imageUrl}

请提供以下信息：
1. 主要色彩
2. 场景描述
3. 情绪氛围
4. 推荐的音乐风格
5. Suno AI Prompt（用于配乐）

请以 JSON 格式返回。`;

  const response = await callOpenRouter(
    env,
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    'google/gemini-2.0-flash-exp:free' // 使用 Gemini 3 的视觉能力
  );

  try {
    return JSON.parse(response);
  } catch {
    return {
      colors: [],
      mood: '未知',
      scene: '无法识别',
      musicStyle: '流行',
      sunoPrompt: response,
      description: response,
    };
  }
}

/**
 * 导出到 Suno
 */
export async function exportToSuno(env: Env, project: Project): Promise<string> {
  const systemPrompt = `你是一位 Suno AI 专家，擅长将歌词转换为 Suno AI 可以理解的格式化 Prompt。`;

  const userPrompt = `请将以下歌词转换为 Suno AI Prompt 格式：

【歌曲类型】${project.spec.type}
【情绪氛围】${project.spec.mood}
【语言】${project.spec.language}

【歌词】
${project.lyrics || ''}

请生成：
1. Style Prompt（音乐风格描述）
2. 格式化的歌词（带段落标记）
3. 推荐的 Suno 参数设置`;

  return await callOpenRouter(env, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

/**
 * 导出到 Tunee
 */
export async function exportToTunee(env: Env, project: Project): Promise<string> {
  const systemPrompt = `你是一位 Tunee AI 专家，擅长生成 Tunee 对话素材包。`;

  const userPrompt = `请为 Tunee AI 生成对话素材包：

【歌曲类型】${project.spec.type}
【情绪氛围】${project.spec.mood}
【主题】${project.theme || ''}
【歌词】${project.lyrics || ''}

请生成适合在 Tunee 中使用的分步引导内容。`;

  return await callOpenRouter(env, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}
