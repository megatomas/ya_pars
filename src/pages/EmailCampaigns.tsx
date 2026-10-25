import { useState } from 'react';
import { store } from '../store';
import { EmailCampaign } from '../types';
import { Mail, Plus, Send, Eye, Pause, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function EmailCampaigns() {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(store.getCampaigns());
  const [showCreate, setShowCreate] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    subject: 'Концепция сайта для {{company_name}}',
    template: `Здравствуйте!

Подготовил концепцию сайта для {{company_name}}, чтобы показать, как могла бы выглядеть отдельная страница вашей компании в интернете.

Посмотреть демонстрационную версию можно здесь:
{{demo_url}}

Это предварительная концепция, а не официальный сайт вашей компании. Если такой вариант вам интересен, можно обсудить доработку, стоимость и дальнейшее размещение.

Если предложение неактуально, сообщите, пожалуйста, и я больше не буду отправлять вам подобные предложения.

С уважением,
{{sender_name}}`,
  });

  const handleCreate = () => {
    if (!newCampaign.name) return;
    const campaign: EmailCampaign = {
      id: `campaign-${Date.now()}`,
      name: newCampaign.name,
      template: newCampaign.template,
      subject: newCampaign.subject,
      companies: [],
      status: 'draft',
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date().toISOString(),
      sentAt: null,
    };
    store.addCampaign(campaign);
    setCampaigns(store.getCampaigns());
    setShowCreate(false);
    setNewCampaign({ name: '', subject: 'Концепция сайта для {{company_name}}', template: newCampaign.template });
  };

  const previewEmail = (campaign: EmailCampaign, companyName: string = 'ООО «Пример»') => {
    return campaign.template
      .replace(/\{\{company_name\}\}/g, companyName)
      .replace(/\{\{contact_name\}\}/g, 'Уважаемый клиент')
      .replace(/\{\{city\}\}/g, 'Краснодар')
      .replace(/\{\{category\}\}/g, 'Ландшафтный дизайн')
      .replace(/\{\{demo_url\}\}/g, 'https://demo-example.vercel.app')
      .replace(/\{\{sender_name\}\}/g, 'Администратор')
      .replace(/\{\{sender_email\}\}/g, 'admin@leadhunter.ru');
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    draft: { label: 'Черновик', color: 'bg-gray-100 text-gray-700' },
    sending: { label: 'Отправка', color: 'bg-blue-100 text-blue-700' },
    completed: { label: 'Завершена', color: 'bg-green-100 text-green-700' },
    paused: { label: 'Пауза', color: 'bg-amber-100 text-amber-700' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Email-кампании</h2>
          <p className="text-sm text-gray-500">Управление рассылками коммерческих предложений</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Новая кампания
        </button>
      </div>

      {/* SMTP Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${true ? 'bg-amber-100' : 'bg-green-100'}`}>
          <Mail className={`w-5 h-5 ${true ? 'text-amber-600' : 'text-green-600'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">SMTP-подключение</p>
          <p className="text-xs text-gray-500">Не настроено — перейдите в Настройки → Интеграции</p>
        </div>
        <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Не подключено</span>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Новая email-кампания</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Название кампании</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={e => setNewCampaign(c => ({ ...c, name: e.target.value }))}
                  placeholder="Например: Ландшафтный дизайн — Краснодар"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Тема письма</label>
                <input
                  type="text"
                  value={newCampaign.subject}
                  onChange={e => setNewCampaign(c => ({ ...c, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Шаблон письма</label>
                <textarea
                  value={newCampaign.template}
                  onChange={e => setNewCampaign(c => ({ ...c, template: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-800 mb-1">Доступные переменные:</p>
                <div className="flex flex-wrap gap-2">
                  {['{{company_name}}', '{{contact_name}}', '{{city}}', '{{category}}', '{{demo_url}}', '{{sender_name}}', '{{sender_email}}'].map(v => (
                    <code key={v} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{v}</code>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleCreate} disabled={!newCampaign.name} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {showPreview && (() => {
        const camp = campaigns.find(c => c.id === showPreview);
        if (!camp) return null;
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Предпросмотр письма</h3>
                <button onClick={() => setShowPreview(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <p className="text-xs text-gray-500">Тема:</p>
                  <p className="font-medium text-gray-900">{camp.subject.replace('{{company_name}}', 'ООО «Пример»')}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-wrap">
                  {previewEmail(camp)}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end">
                <button onClick={() => setShowPreview(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Campaigns list */}
      <div className="space-y-3">
        {campaigns.map(camp => {
          const sc = statusConfig[camp.status] || statusConfig.draft;
          return (
            <div key={camp.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-medium text-gray-900">{camp.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sc.color}`}>
                      {sc.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {camp.companies.length} получателей · {camp.sentCount} отправлено · {camp.failedCount} ошибок
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Создана: {new Date(camp.createdAt).toLocaleDateString('ru-RU')}
                    {camp.sentAt && ` · Отправлена: ${new Date(camp.sentAt).toLocaleDateString('ru-RU')}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(camp.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Предпросмотр"
                  >
                    <Eye className="w-4 h-4 text-gray-500" />
                  </button>
                  {camp.status === 'draft' && (
                    <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700">
                      <Send className="w-3 h-3" /> Отправить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Нет email-кампаний</p>
          <p className="text-sm text-gray-400 mt-1">Создайте первую кампанию для отправки предложений</p>
        </div>
      )}

      {/* Safety notes */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Правила отправки
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            Тестовая отправка на собственный адрес перед массовой рассылкой
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            Подтверждение перед каждой массовой отправкой
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            Защита от повторной отправки одному получателю
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            Исключение адресов из списка отказов (suppression list)
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            Ограничение частоты отправки для соблюдения лимитов провайдера
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            Журнал всех отправок с результатами доставки
          </li>
        </ul>
      </div>
    </div>
  );
}
