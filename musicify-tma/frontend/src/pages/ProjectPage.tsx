import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Edit3, Music, Sparkles } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useTelegramStore } from '../stores/telegramStore';
import { api } from '../utils/api';

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentProject, fetchProject, generateLyrics } = useProjectStore();
  const hapticFeedback = useTelegramStore((state) => state.hapticFeedback);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'chords'>('lyrics');

  useEffect(() => {
    if (id) {
      fetchProject(id);
    }
  }, [id, fetchProject]);

  const handleGenerate = async () => {
    if (!id || !currentProject) return;

    setIsGenerating(true);
    hapticFeedback('medium');

    try {
      await generateLyrics(id, 'express');
      hapticFeedback('success');
    } catch (error) {
      alert(error instanceof Error ? error.message : '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = async (format: 'suno' | 'tunee') => {
    if (!id) return;

    setIsExporting(true);
    hapticFeedback('medium');

    try {
      const response = await api.post(`/projects/${id}/export`, { format });

      // 显示导出内容
      const content = response.data?.content;
      if (content) {
        window.Telegram?.WebApp?.showPopup({
          title: `导出到 ${format === 'suno' ? 'Suno' : 'Tunee'}`,
          message: content,
        });
      }

      hapticFeedback('success');
    } catch (error) {
      alert(error instanceof Error ? error.message : '导出失败');
    } finally {
      setIsExporting(false);
    }
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

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
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{currentProject.title}</h1>
            <p className="text-sm text-gray-500">
              {currentProject.spec.type} · {currentProject.spec.mood}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('lyrics')}
            className={`py-3 px-1 border-b-2 transition-colors ${
              activeTab === 'lyrics'
                ? 'border-primary-500 text-primary-600 font-semibold'
                : 'border-transparent text-gray-500'
            }`}
          >
            歌词
          </button>
          <button
            onClick={() => setActiveTab('chords')}
            className={`py-3 px-1 border-b-2 transition-colors ${
              activeTab === 'chords'
                ? 'border-primary-500 text-primary-600 font-semibold'
                : 'border-transparent text-gray-500'
            }`}
          >
            和弦
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {activeTab === 'lyrics' && (
          <div className="space-y-4">
            {/* 歌词内容 */}
            {currentProject.lyrics ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">歌词</h2>
                  <button className="text-primary-500 hover:text-primary-600 active:scale-95">
                    <Edit3 className="w-5 h-5" />
                  </button>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                  {currentProject.lyrics}
                </pre>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-6">还没有生成歌词</p>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="btn-primary disabled:opacity-50"
                >
                  {isGenerating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5 animate-spin" />
                      生成中...
                    </span>
                  ) : (
                    '生成歌词'
                  )}
                </button>
              </div>
            )}

            {/* 导出操作 */}
            {currentProject.lyrics && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">导出</h3>

                <button
                  onClick={() => handleExport('suno')}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 flex items-center justify-between active:scale-98 transition-transform disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-semibold">导出到 Suno</p>
                      <p className="text-sm opacity-90">生成 Suno 提示词</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('tunee')}
                  disabled={isExporting}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl p-4 flex items-center justify-between active:scale-98 transition-transform disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-semibold">导出到 Tunee</p>
                      <p className="text-sm opacity-90">生成对话素材包</p>
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'chords' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            {currentProject.chords ? (
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700">
                {currentProject.chords}
              </pre>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">还没有生成和弦</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
