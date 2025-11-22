import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Music, Trash2 } from 'lucide-react';
import { useProjectStore } from '../stores/projectStore';
import { useTelegramStore } from '../stores/telegramStore';
import { formatDistance } from '../utils/date';

export default function MyProjectsPage() {
  const navigate = useNavigate();
  const { projects, fetchProjects, deleteProject } = useProjectStore();
  const { showConfirm, hapticFeedback } = useTelegramStore();

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = await showConfirm(`确定要删除「${title}」吗?`);
    if (!confirmed) return;

    try {
      await deleteProject(id);
      hapticFeedback('success');
    } catch (error) {
      alert(error instanceof Error ? error.message : '删除失败');
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
            <h1 className="text-xl font-bold text-gray-900">我的项目</h1>
            <p className="text-sm text-gray-500">{projects.length} 个项目</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {projects.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
            <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-6">还没有创作任何歌曲</p>
            <button
              onClick={() => navigate('/create')}
              className="btn-primary"
            >
              开始创作
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl p-4 border border-gray-100 active:scale-98 transition-transform"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="flex-1 text-left"
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {project.spec.type} · {project.spec.mood} · {project.spec.language}
                    </p>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          project.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : project.status === 'exported'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {project.status === 'completed'
                          ? '已完成'
                          : project.status === 'exported'
                          ? '已导出'
                          : '草稿'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistance(project.updatedAt)}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDelete(project.id, project.title)}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 active:scale-95 transition-all text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
