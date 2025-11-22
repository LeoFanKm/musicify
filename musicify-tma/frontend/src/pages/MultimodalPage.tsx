import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Upload, Mic, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useTelegramStore } from '../stores/telegramStore';
import { api } from '../utils/api';

export default function MultimodalPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'audio';

  const hapticFeedback = useTelegramStore((state) => state.hapticFeedback);

  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      hapticFeedback('light');
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setUploadProgress(0);
    hapticFeedback('medium');

    try {
      // 上传文件
      const uploadResponse = await api.upload(
        `/upload/${type}`,
        file,
        setUploadProgress
      );

      const fileUrl = uploadResponse.data?.url;

      // 分析
      const analyzeResponse = await api.post(`/analyze/${type}`, {
        [type === 'audio' ? 'audioUrl' : 'imageUrl']: fileUrl,
      });

      setResult(analyzeResponse.data);
      hapticFeedback('success');
    } catch (error) {
      alert(error instanceof Error ? error.message : '分析失败');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const isAudio = type === 'audio';

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
            <h1 className="text-xl font-bold text-gray-900">
              {isAudio ? '音频分析' : '图片分析'}
            </h1>
            <p className="text-sm text-gray-500">
              {isAudio ? '上传参考音频生成 Prompt' : '从图片提取音乐灵感'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* 上传区域 */}
        <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-gray-300 text-center">
          <input
            type="file"
            id="file-upload"
            accept={isAudio ? 'audio/*' : 'image/*'}
            onChange={handleFileSelect}
            className="hidden"
          />

          <label
            htmlFor="file-upload"
            className="cursor-pointer block"
          >
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {isAudio ? (
                <Mic className="w-10 h-10 text-primary-600" />
              ) : (
                <ImageIcon className="w-10 h-10 text-primary-600" />
              )}
            </div>

            {file ? (
              <div>
                <p className="font-semibold text-gray-900 mb-1">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  点击上传{isAudio ? '音频' : '图片'}
                </p>
                <p className="text-sm text-gray-500">
                  {isAudio ? '支持 MP3, WAV, M4A 等格式' : '支持 JPG, PNG 等格式'}
                </p>
              </div>
            )}
          </label>

          {file && !isAnalyzing && (
            <button
              onClick={handleAnalyze}
              className="btn-primary mt-6"
            >
              开始分析
            </button>
          )}

          {isAnalyzing && (
            <div className="mt-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary-500 animate-spin" />
                <span className="text-primary-600 font-medium">
                  {uploadProgress < 100 ? `上传中 ${uploadProgress}%` : '分析中...'}
                </span>
              </div>
              {uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 分析结果 */}
        {result && (
          <div className="mt-6 space-y-4 animate-fade-in">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-4">分析结果</h2>

              {isAudio ? (
                <div className="space-y-3">
                  {result.style && (
                    <div>
                      <p className="text-sm text-gray-500">音乐风格</p>
                      <p className="font-medium">{result.style}</p>
                    </div>
                  )}
                  {result.mood && (
                    <div>
                      <p className="text-sm text-gray-500">情绪氛围</p>
                      <p className="font-medium">{result.mood}</p>
                    </div>
                  )}
                  {result.rhythm?.bpm && (
                    <div>
                      <p className="text-sm text-gray-500">节奏</p>
                      <p className="font-medium">{result.rhythm.bpm} BPM</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {result.scene && (
                    <div>
                      <p className="text-sm text-gray-500">场景</p>
                      <p className="font-medium">{result.scene}</p>
                    </div>
                  )}
                  {result.mood && (
                    <div>
                      <p className="text-sm text-gray-500">情绪</p>
                      <p className="font-medium">{result.mood}</p>
                    </div>
                  )}
                  {result.musicStyle && (
                    <div>
                      <p className="text-sm text-gray-500">推荐风格</p>
                      <p className="font-medium">{result.musicStyle}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {result.sunoPrompt && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                <h2 className="font-semibold text-gray-900 mb-3">Suno Prompt</h2>
                <p className="text-gray-700 leading-relaxed">{result.sunoPrompt}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result.sunoPrompt);
                    hapticFeedback('success');
                    alert('已复制到剪贴板');
                  }}
                  className="btn-primary mt-4 w-full"
                >
                  复制 Prompt
                </button>
              </div>
            )}
          </div>
        )}

        {/* 功能说明 */}
        {!result && (
          <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="font-semibold text-blue-900 mb-2">
              {isAudio ? '🎵 音频分析功能' : '🎨 图片分析功能'}
            </h3>
            <ul className="space-y-1 text-sm text-blue-700">
              {isAudio ? (
                <>
                  <li>• 分析音乐风格和节奏</li>
                  <li>• 识别乐器配置</li>
                  <li>• 生成 Suno 复刻 Prompt</li>
                  <li>• 提供改编建议</li>
                </>
              ) : (
                <>
                  <li>• 提取图片色彩和情绪</li>
                  <li>• 分析场景氛围</li>
                  <li>• 推荐匹配的音乐风格</li>
                  <li>• 生成配乐 Prompt</li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
