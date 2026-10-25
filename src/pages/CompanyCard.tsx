import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store } from '../store';
import { Company, ContactStatus, WebsiteStatus } from '../types';
import {
  ArrowLeft, ExternalLink, Copy, RefreshCw, Download,
  Globe, Phone, Mail, MapPin, Star, MessageSquare,
  Calendar, CheckCircle2, XCircle, AlertTriangle, Link2
} from 'lucide-react';

const websiteStatusLabels: Record<string, { label: string; color: string; icon: any }> = {
  found: { label: 'Сайт найден', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2 },
  not_found: { label: 'Сайт не найден', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
  not_specified: { label: 'Не указан в справочнике', color: 'bg-gray-100 text-gray-600 border-gray-200', icon: AlertTriangle },
  needs_review: { label: 'Нужна ручная проверка', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: AlertTriangle },
  unavailable: { label: 'Сайт недоступен', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: XCircle },
  check_error: { label: 'Ошибка проверки', color: 'bg-red-100 text-red-600 border-red-200', icon: AlertTriangle },
};

const contactStatusOptions: { value: ContactStatus; label: string }[] = [
  { value: 'new', label: 'Новый лид' },
  { value: 'verified', label: 'Проверен' },
  { value: 'priority', label: 'Приоритетный' },
  { value: 'demo_in_progress', label: 'Демосайт в работе' },
  { value: 'demo_ready', label: 'Демосайт готов' },
  { value: 'proposal_prepared', label: 'Предложение подготовлено' },
  { value: 'proposal_sent', label: 'Предложение отправлено' },
  { value: 'response_received', label: 'Ответ получен' },
  { value: 'negotiation', label: 'Переговоры' },
  { value: 'client', label: 'Клиент' },
  { value: 'refused', label: 'Отказ' },
  { value: 'do_not_contact', label: 'Не связываться' },
];

export default function CompanyCard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | undefined>(() => store.getCompany(id || ''));
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Company>>({});
  const [comment, setComment] = useState('');

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">Компания не найдена</p>
        <button onClick={() => navigate('/companies')} className="mt-4 text-blue-600 hover:underline">
          Вернуться к списку
        </button>
      </div>
    );
  }

  const updateField = (field: keyof Company, value: any) => {
    const updated = store.updateCompany(company.id, { [field]: value });
    if (updated) setCompany(updated);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRecheck = () => {
    updateField('lastChecked', new Date().toISOString().split('T')[0]);
    updateField('websiteCheckDate', new Date().toISOString().split('T')[0]);
    store.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      module: 'Проверка сайтов',
      message: `Повторная проверка: ${company.name}`,
      details: `Текущий статус: ${company.websiteStatus}`,
    });
  };

  const handleExclude = () => {
    if (confirm('Исключить компанию из дальнейшей работы?')) {
      updateField('excluded', true);
      updateField('contactStatus', 'do_not_contact');
    }
  };

  const handleSaveComment = () => {
    if (comment.trim()) {
      const existing = company.comments ? company.comments + '\n' : '';
      updateField('comments', existing + `[${new Date().toLocaleDateString('ru')}] ${comment.trim()}`);
      setComment('');
    }
  };

  const startEdit = () => {
    setEditData({ ...company });
    setEditing(true);
  };

  const saveEdit = () => {
    const updated = store.updateCompany(company.id, editData);
    if (updated) {
      setCompany(updated);
      setEditing(false);
    }
  };

  const ws = websiteStatusLabels[company.websiteStatus] || websiteStatusLabels.not_specified;
  const StatusIcon = ws.icon;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/companies')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
          <p className="text-sm text-gray-500">{company.category} · {company.city}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRecheck} className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" /> Проверить сайт
          </button>
          <button onClick={handleExclude} className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">
            <XCircle className="w-4 h-4" /> Исключить
          </button>
        </div>
      </div>

      {/* Score & Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <p className="text-sm text-gray-500 mb-2">Приоритет лида</p>
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold ${
            company.score >= 70 ? 'bg-green-100 text-green-700' :
            company.score >= 40 ? 'bg-amber-100 text-amber-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {company.score}
          </div>
          <p className="text-xs text-gray-400 mt-2">из 100 баллов</p>
        </div>
        <div className={`rounded-xl border p-5 flex items-center gap-4 ${ws.color}`}>
          <StatusIcon className="w-8 h-8" />
          <div>
            <p className="text-sm opacity-75">Статус сайта</p>
            <p className="font-semibold text-lg">{ws.label}</p>
            <p className="text-xs opacity-75 mt-1">Проверка: {company.websiteCheckDate || '—'}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-2">Статус контакта</p>
          <select
            value={company.contactStatus}
            onChange={e => updateField('contactStatus', e.target.value as ContactStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium"
          >
            {contactStatusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-2">Последнее действие: {company.lastContactDate || '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main info */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" /> Основная информация
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Адрес</span>
              <span className="text-gray-900 text-right">{company.address}, {company.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Регион</span>
              <span className="text-gray-900">{company.region}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Статус</span>
              <span className="text-gray-900">{company.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Часы работы</span>
              <span className="text-gray-900">{company.workingHours || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Обнаружена</span>
              <span className="text-gray-900">{company.firstSeen}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Последняя проверка</span>
              <span className="text-gray-900">{company.lastChecked}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Источник</span>
              <span className="text-gray-900">{company.dataSource}</span>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-gray-400" /> Контактная информация
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Телефон</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-mono">{company.phone || '—'}</span>
                {company.phone && (
                  <button onClick={() => copyToClipboard(company.phone)} className="p-1 hover:bg-gray-100 rounded" title="Копировать">
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Email</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-900">{company.email || '—'}</span>
                {company.email && (
                  <button onClick={() => copyToClipboard(company.email)} className="p-1 hover:bg-gray-100 rounded" title="Копировать">
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Сайт</span>
              <div className="flex items-center gap-2">
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener" className="text-blue-600 hover:underline truncate max-w-[200px]">
                    {company.website}
                  </a>
                ) : <span className="text-gray-400">—</span>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">VK</span>
              {company.vk ? (
                <a href={company.vk} target="_blank" rel="noopener" className="text-blue-600 hover:underline truncate max-w-[200px]">
                  Профиль VK
                </a>
              ) : <span className="text-gray-400">—</span>}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Контактное лицо</span>
              <span className="text-gray-900">{company.contactName || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">Карточка в справочнике</span>
              <a href={company.directoryUrl} target="_blank" rel="noopener" className="text-blue-600 hover:underline flex items-center gap-1">
                Открыть <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Rating & Reviews */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-400" /> Рейтинг и отзывы
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-amber-600">{company.rating}</p>
              <p className="text-xs text-amber-700 mt-1">Рейтинг</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-blue-600">{company.reviewCount}</p>
              <p className="text-xs text-blue-700 mt-1">Отзывов</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-3xl font-bold text-purple-600">{company.ratingCount}</p>
              <p className="text-xs text-purple-700 mt-1">Оценок</p>
            </div>
          </div>
        </div>

        {/* Demo site */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-400" /> Демосайт
          </h3>
          {company.demoSiteUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-green-500" />
                <a href={company.demoSiteUrl} target="_blank" rel="noopener" className="text-blue-600 hover:underline truncate">
                  {company.demoSiteUrl}
                </a>
              </div>
              <div className="flex gap-2">
                <a
                  href={company.demoSiteUrl}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4" /> Открыть
                </a>
                <button
                  onClick={() => copyToClipboard(company.demoSiteUrl)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  <Copy className="w-4 h-4" /> Копировать
                </button>
              </div>
              <p className="text-xs text-gray-500">Создан: {company.demoSiteCreated}</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm mb-3">Демосайт не добавлен</p>
              <input
                type="url"
                placeholder="Вставьте URL демосайта..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val) {
                      updateField('demoSiteUrl', val);
                      updateField('demoSiteCreated', new Date().toISOString().split('T')[0]);
                    }
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Website check details */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" /> Результаты проверки сайта
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Статус</p>
            <p className="font-medium text-gray-900">{ws.label}</p>
          </div>
          <div>
            <p className="text-gray-500">HTTP-статус</p>
            <p className="font-medium text-gray-900">{company.httpStatus || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">HTTPS</p>
            <p className="font-medium text-gray-900">{company.hasHttps ? 'Да' : 'Нет'}</p>
          </div>
          <div>
            <p className="text-gray-500">Мобильная версия</p>
            <p className="font-medium text-gray-900">{company.hasMobileVersion === null ? 'Не проверено' : company.hasMobileVersion ? 'Да' : 'Нет'}</p>
          </div>
          <div>
            <p className="text-gray-500">Уверенность</p>
            <p className="font-medium text-gray-900">{company.confidenceLevel}%</p>
          </div>
          <div>
            <p className="text-gray-500">Причина</p>
            <p className="font-medium text-gray-900">{company.classificationReason || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Дата проверки</p>
            <p className="font-medium text-gray-900">{company.websiteCheckDate || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">URL сайта</p>
            <p className="font-medium text-gray-900 truncate">{company.websiteUrl || '—'}</p>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" /> Комментарии и задачи
        </h3>
        {company.comments && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-700 whitespace-pre-wrap">
            {company.comments}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Добавить комментарий или задачу..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            onKeyDown={e => e.key === 'Enter' && handleSaveComment()}
          />
          <button onClick={handleSaveComment} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
            Добавить
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Следующая задача</label>
            <input
              type="text"
              value={company.nextTask}
              onChange={e => updateField('nextTask', e.target.value)}
              placeholder="Например: Позвонить для подтверждения"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Дата следующего действия</label>
            <input
              type="date"
              value={company.nextActionDate}
              onChange={e => updateField('nextActionDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
