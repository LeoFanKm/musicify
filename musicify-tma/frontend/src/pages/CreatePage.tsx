import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useTelegramStore } from '../stores/telegramStore';
import { useProjectStore } from '../stores/projectStore';
import { SONG_TYPES, SONG_MOODS, LANGUAGES, SongSpec, CreationMode } from '@shared/types';

export default function CreatePage() {
  const navigate = useNavigate();
  const hapticFeedback = useTelegramStore((state) => state.hapticFeedback);
  const createProject = useProjectStore((state) => state.createProject);

  const [step, setStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const [spec, setSpec] = useState<SongSpec>({
    type: '流行',
    mood: '抒情',
    language: '中文',
  });

  const [mode, setMode] = useState<CreationMode>('express');
  const [theme, setTheme] = useState('');

  const handleCreate = async () => {
    if (!theme.trim()) {
      alert('请输入歌曲主题');
      return;
    }

    setIsCreating(true);
    hapticFeedback('medium');

    try {
      const project = await createProject(spec, mode);

      // 导航到项目页面
      navigate(`/project/${project.id}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : '创建失败');
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">创建新歌曲</h1>
            <p className="text-sm text-gray-500">第 {step}/4 步</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div
          className="h-1 bg-primary-500 transition-all duration-300"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="px-6 py-6">
        {/* Step 1: 歌曲类型 */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">选择歌曲类型</h2>
            <p className="text-gray-500 mb-6">选择最符合你想法的音乐风格</p>

            <div className="grid grid-cols-2 gap-3">
              {SONG_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSpec({ ...spec, type });
                    hapticFeedback('light');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    spec.type === type
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-lg font-semibold">{type}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              className="btn-primary w-full mt-8"
            >
              下一步
            </button>
          </div>
        )}

        {/* Step 2: 情绪氛围 */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">选择情绪氛围</h2>
            <p className="text-gray-500 mb-6">这首歌想表达什么情感?</p>

            <div className="grid grid-cols-2 gap-3">
              {SONG_MOODS.map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    setSpec({ ...spec, mood });
                    hapticFeedback('light');
                  }}
                  className={`p-4 rounded-xl border-2 transition-all active:scale-95 ${
                    spec.mood === mood
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className="text-lg font-semibold">{mood}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                上一步
              </button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1">
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 语言和模式 */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">选择语言和模式</h2>

            {/* 语言选择 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                歌词语言
              </label>
              <div className="grid grid-cols-3 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSpec({ ...spec, language: lang });
                      hapticFeedback('light');
                    }}
                    className={`py-3 rounded-xl border-2 transition-all active:scale-95 ${
                      spec.language === lang
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <span className="font-semibold">{lang}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 创作模式 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                创作模式
              </label>
              <div className="space-y-3">
                <ModeOption
                  selected={mode === 'express'}
                  onClick={() => setMode('express')}
                  title="快速模式"
                  description="AI 直接生成完整歌词，适合快速迭代"
                  icon="⚡"
                />
                <ModeOption
                  selected={mode === 'coach'}
                  onClick={() => setMode('coach')}
                  title="教练模式"
                  description="AI 引导你思考，逐段创作，100% 原创"
                  icon="🎓"
                />
                <ModeOption
                  selected={mode === 'hybrid'}
                  onClick={() => setMode('hybrid')}
                  title="混合模式"
                  description="AI 生成框架，你填充细节"
                  icon="🤝"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                上一步
              </button>
              <button onClick={() => setStep(4)} className="btn-primary flex-1">
                下一步
              </button>
            </div>
          </div>
        )}

        {/* Step 4: 主题输入 */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">描述歌曲主题</h2>
            <p className="text-gray-500 mb-6">用几句话描述你想表达的内容</p>

            <textarea
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="例如：想写一首关于异地恋的歌，表达思念和坚持的心情..."
              className="input-field min-h-[200px] resize-none"
              maxLength={500}
            />

            <p className="text-sm text-gray-400 mt-2 text-right">
              {theme.length} / 500
            </p>

            {/* 规格摘要 */}
            <div className="bg-gray-50 rounded-xl p-4 mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">创作配置</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">类型</span>
                  <span className="font-medium">{spec.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">氛围</span>
                  <span className="font-medium">{spec.mood}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">语言</span>
                  <span className="font-medium">{spec.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">模式</span>
                  <span className="font-medium">
                    {mode === 'express' ? '快速' : mode === 'coach' ? '教练' : '混合'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setStep(3)} className="btn-secondary flex-1">
                上一步
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || !theme.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 animate-spin" />
                    创作中...
                  </span>
                ) : (
                  '开始创作'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModeOption({
  selected,
  onClick,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all active:scale-98 ${
        selected
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
}
