import { useState } from 'react';
import { store } from '../store';
import { LogEntry } from '../types';
import { ScrollText, Info, AlertTriangle, XCircle, CheckCircle2, Filter } from 'lucide-react';

const levelConfig: Record<string, { label: string; color: string; icon: any }> = {
  info: { label: 'Информация', color: 'bg-blue-100 text-blue-700', icon: Info },
  warning: { label: 'Предупреждение', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  error: { label: 'Ошибка', color: 'bg-red-100 text-red-700', icon: XCircle },
  success: { label: 'Успех', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
};

export default function Logs() {
  const [logs] = useState<LogEntry[]>(store.getLogs());
  const [levelFilter, setLevelFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  const modules = [...new Set(logs.map(l => l.module))];

  const filtered = logs.filter(l => {
    if (levelFilter !== 'all' && l.level !== levelFilter) return false;
    if (moduleFilter !== 'all' && l.module !== moduleFilter) return false;
    return true;
  });

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Журнал событий</h2>
        <p className="text-sm text-gray-500">Логи системы, ошибки и важные события</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="all">Все уровни</option>
            <option value="info">Информация</option>
            <option value="warning">Предупреждения</option>
            <option value="error">Ошибки</option>
            <option value="success">Успех</option>
          </select>
        </div>
        <select
          value={moduleFilter}
          onChange={e => setModuleFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">Все модули</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4 text-center">
          <p className="text-xl font-bold text-blue-700">{logs.filter(l => l.level === 'info').length}</p>
          <p className="text-xs text-blue-600">Информация</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <p className="text-xl font-bold text-green-700">{logs.filter(l => l.level === 'success').length}</p>
          <p className="text-xs text-green-600">Успешных</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
          <p className="text-xl font-bold text-amber-700">{logs.filter(l => l.level === 'warning').length}</p>
          <p className="text-xs text-amber-600">Предупреждений</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <p className="text-xl font-bold text-red-700">{logs.filter(l => l.level === 'error').length}</p>
          <p className="text-xs text-red-600">Ошибок</p>
        </div>
      </div>

      {/* Log entries */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map(log => {
            const config = levelConfig[log.level] || levelConfig.info;
            const Icon = config.icon;
            return (
              <div key={log.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {log.module}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{log.message}</p>
                    {log.details && (
                      <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">
                    {formatTime(log.timestamp)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Нет записей в журнале</p>
          <p className="text-sm text-gray-400 mt-1">События системы будут отображаться здесь</p>
        </div>
      )}
    </div>
  );
}
