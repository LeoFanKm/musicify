import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { Music, Sparkles, Mic, Image, FileText } from 'lucide-react';
import { useEffect } from 'react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, usage, fetchUsage } = useUserStore();

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  const remainingGenerations = usage
    ? Math.max(0, usage.limit - usage.count)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center">
            <Music className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Musicify</h1>
            <p className="text-sm text-gray-500">AI 音乐创作助手</p>
          </div>
        </div>

        {user && (
          <div className="mt-6 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日剩余创作次数</p>
                <p className="text-3xl font-bold text-primary-500 mt-1">
                  {remainingGenerations}
                </p>
              </div>
              {user.tier === 'free' && (
                <button className="btn-primary text-sm py-2 px-4">
                  升级 Pro
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速开始</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* 快速创作 */}
          <button
            onClick={() => navigate('/create')}
            className="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl p-6 text-left active:scale-95 transition-transform shadow-lg"
          >
            <Sparkles className="w-8 h-8 mb-3" />
            <h3 className="font-semibold text-lg mb-1">快速创作</h3>
            <p className="text-sm opacity-90">3 分钟生成歌词</p>
          </button>

          {/* 我的项目 */}
          <button
            onClick={() => navigate('/my-projects')}
            className="bg-white border-2 border-gray-200 text-gray-900 rounded-2xl p-6 text-left active:scale-95 transition-transform"
          >
            <FileText className="w-8 h-8 mb-3 text-primary-500" />
            <h3 className="font-semibold text-lg mb-1">我的项目</h3>
            <p className="text-sm text-gray-500">查看历史创作</p>
          </button>
        </div>
      </div>

      {/* Multimodal Features */}
      <div className="px-6 pb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          多模态创作 <span className="text-xs bg-accent-100 text-accent-600 px-2 py-1 rounded-full">NEW</span>
        </h2>

        <div className="space-y-3">
          {/* 音频分析 */}
          <button
            onClick={() => navigate('/multimodal?type=audio')}
            className="w-full bg-white rounded-xl p-4 flex items-center gap-4 active:scale-98 transition-transform border border-gray-100"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-primary-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">上传参考音频</h3>
              <p className="text-sm text-gray-500">AI 分析风格生成 Prompt</p>
            </div>
          </button>

          {/* 图片分析 */}
          <button
            onClick={() => navigate('/multimodal?type=image')}
            className="w-full bg-white rounded-xl p-4 flex items-center gap-4 active:scale-98 transition-transform border border-gray-100"
          >
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
              <Image className="w-6 h-6 text-accent-600" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold text-gray-900">上传参考图片</h3>
              <p className="text-sm text-gray-500">从画面生成音乐灵感</p>
            </div>
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="px-6 pb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">核心功能</h2>

        <div className="bg-white rounded-2xl p-6 space-y-4 border border-gray-100">
          <Feature
            icon="🎵"
            title="全类型支持"
            description="流行、摇滚、说唱、古风等 10+ 风格"
          />
          <Feature
            icon="✨"
            title="三种创作模式"
            description="教练、快速、混合，满足不同需求"
          />
          <Feature
            icon="🎹"
            title="作曲辅助"
            description="和弦进行、旋律提示、五线谱"
          />
          <Feature
            icon="📤"
            title="一键导出"
            description="支持导出到 Suno、Tunee 等平台"
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
