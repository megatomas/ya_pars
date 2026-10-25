import { useState } from 'react';
import { store } from '../store';
import { CollectionJob } from '../types';
import { Clock, CheckCircle2, AlertTriangle, Loader2, XCircle, Pause, RefreshCw } from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  queued: { label: 'В очереди', color: 'bg-gray-100 text-gray-700', icon: Clock },
  running: { label: 'Выполняется', color: 'bg-blue-100 text-blue-700', icon: Loader2 },
  completed: { label: 'Завершено', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  completed_with_errors: { label: 'С ошибками', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  stopped: { label: 'Остановлено', color: 'bg-orange-100 text-orange-700', icon: Pause },
  error: { label: 'Ошибка', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function Tasks() {
  const [jobs, setJobs] = useState<CollectionJob[]>(store.getJobs());

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (job: CollectionJob) => {
    const start = new Date(job.startTime).getTime();
    const end = job.endTime ? new Date(job.endTime).getTime() : Date.now();
    const mins = Math.round((end - start) / 60000);
    if (mins < 1) return '< 1 мин';
    if (mins < 60) return `${mins} мин`;
    return `${Math.floor(mins / 60)} ч ${mins % 60} мин`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Задания на сбор данных</h2>
          <p className="text-sm text-gray-500">Управление фоновыми задачами сбора информации</p>
        </div>
        <button
          onClick={() => setJobs(store.getJobs())}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Обновить
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
          <p className="text-xs text-gray-500">Всего заданий</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{jobs.filter(j => j.status === 'running').length}</p>
          <p className="text-xs text-gray-500">Выполняется</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{jobs.filter(j => j.status === 'completed').length}</p>
          <p className="text-xs text-gray-500">Завершено</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{jobs.filter(j => j.status === 'completed_with_errors' || j.status === 'error').length}</p>
          <p className="text-xs text-gray-500">С ошибками</p>
        </div>
      </div>

      {/* Jobs list */}
      <div className="space-y-3">
        {jobs.map(job => {
          const config = statusConfig[job.status] || statusConfig.queued;
          const Icon = config.icon;

          return (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color} ${job.status === 'running' ? 'animate-pulse' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{job.query}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {job.source} · {formatTime(job.startTime)} · Длительность: {getDuration(job)}
                  </p>
                  
                  {/* Progress stats */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-lg font-bold text-gray-900">{job.foundCount}</p>
                      <p className="text-xs text-gray-500">Найдено</p>
                    </div>
                    <div className="bg-green-50 rounded-lg px-3 py-2">
                      <p className="text-lg font-bold text-green-700">{job.newCount}</p>
                      <p className="text-xs text-green-600">Новых</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg px-3 py-2">
                      <p className="text-lg font-bold text-blue-700">{job.updatedCount}</p>
                      <p className="text-xs text-blue-600">Обновлено</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg px-3 py-2">
                      <p className="text-lg font-bold text-amber-700">{job.duplicateCount}</p>
                      <p className="text-xs text-amber-600">Дубликатов</p>
                    </div>
                    <div className="bg-red-50 rounded-lg px-3 py-2">
                      <p className="text-lg font-bold text-red-700">{job.errorCount}</p>
                      <p className="text-xs text-red-600">Ошибок</p>
                    </div>
                  </div>

                  {/* Current stage */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Этап:</span>
                    <span className="text-xs font-medium text-gray-700">{job.currentStage}</span>
                  </div>

                  {/* Error message */}
                  {job.errorMessage && (
                    <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-2 text-xs text-red-700">
                      {job.errorMessage}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {job.status === 'running' && (
                    <button className="px-3 py-1.5 text-xs border border-red-200 text-red-600 rounded-lg hover:bg-red-50">
                      Остановить
                    </button>
                  )}
                  {(job.status === 'error' || job.status === 'stopped') && (
                    <button className="px-3 py-1.5 text-xs border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50">
                      Повторить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Нет заданий на сбор данных</p>
          <p className="text-sm text-gray-400 mt-1">Создайте задание в разделе «Поиск компаний»</p>
        </div>
      )}
    </div>
  );
}
