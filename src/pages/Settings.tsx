import { useState } from 'react';
import { store } from '../store';
import { ScoringWeights } from '../types';
import { Settings as SettingsIcon, Save, Globe, Mail, Database, Shield, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const [weights, setWeights] = useState<ScoringWeights>(store.getWeights());
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('scoring');

  const handleSaveWeights = () => {
    store.updateWeights(weights);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Вы уверены? Все данные будут удалены и заменены тестовыми. Это действие необратимо.')) {
      store.resetData();
      setWeights(store.getWeights());
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'scoring', label: 'Скоринг', icon: SettingsIcon },
    { id: 'sources', label: 'Источники', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'database', label: 'База данных', icon: Database },
    { id: 'security', label: 'Безопасность', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Настройки</h2>
        <p className="text-sm text-gray-500">Конфигурация системы, источников и интеграций</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Scoring settings */}
      {activeTab === 'scoring' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Веса скоринга лидов</h3>
          <p className="text-sm text-gray-500 mb-6">Настройте баллы за каждый критерий. Итоговый балл ограничен диапазоном 0–100.</p>
          
          <div className="space-y-4">
            {[
              { key: 'reviews50plus' as const, label: '50+ отзывов', desc: 'Компания с достаточным количеством отзывов' },
              { key: 'reviews100plus' as const, label: '100+ отзывов (дополнительно)', desc: 'Дополнительные баллы за очень высокую активность' },
              { key: 'rating43plus' as const, label: 'Рейтинг от 4.3', desc: 'Компания с хорошим рейтингом' },
              { key: 'rating47plus' as const, label: 'Рейтинг от 4.7 (дополнительно)', desc: 'Дополнительные баллы за отличный рейтинг' },
              { key: 'emailConfirmed' as const, label: 'Подтверждённый email', desc: 'Публичный рабочий email доступен' },
              { key: 'phonePresent' as const, label: 'Телефон присутствует', desc: 'Указан контактный телефон' },
              { key: 'onlyCatalogProfile' as const, label: 'Только профиль в каталоге/соцсети', desc: 'Нет собственного сайта, только сторонние страницы' },
              { key: 'noWebsiteConfirmed' as const, label: 'Подтверждено отсутствие сайта', desc: 'Все проверки выполнены, сайт не обнаружен' },
            ].map(item => (
              <div key={item.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">+ баллов:</span>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={weights[item.key]}
                    onChange={e => setWeights(w => ({ ...w, [item.key]: parseInt(e.target.value) || 0 }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSaveWeights}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <Save className="w-4 h-4" /> Сохранить
            </button>
            {saved && <span className="text-sm text-green-600">✓ Сохранено</span>}
          </div>
        </div>
      )}

      {/* Sources settings */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Источники данных</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">Я</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Яндекс Карты API</p>
                      <p className="text-xs text-gray-500">Коммерческий API организаций</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Не подключён</span>
                </div>
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="API-ключ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-500">Получите ключ в кабинете разработчика Яндекс. Требуется коммерческая лицензия.</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">B</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Bing Web Search API</p>
                      <p className="text-xs text-gray-500">Поиск сайтов компаний</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Не подключён</span>
                </div>
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="API-ключ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <p className="text-xs text-gray-500">Azure Cognitive Services. Используется для поиска официальных сайтов.</p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">✓</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Импорт CSV/XLSX</p>
                      <p className="text-xs text-gray-500">Загрузка готовых баз данных</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Активен</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-600">+</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Ручное добавление</p>
                      <p className="text-xs text-gray-500">Добавление компаний через интерфейс</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Активен</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email settings */}
      {activeTab === 'email' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Настройки email</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Имя отправителя</label>
                <input type="text" placeholder="Ваше имя" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email отправителя</label>
                <input type="email" placeholder="you@example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">SMTP-сервер</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Хост</label>
                  <input type="text" placeholder="smtp.example.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Порт</label>
                  <input type="number" placeholder="587" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Логин</label>
                  <input type="text" placeholder="username" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Пароль</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Ограничения</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Писем в час (макс.)</label>
                  <input type="number" defaultValue={20} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Пауза между письмами (сек)</label>
                  <input type="number" defaultValue={30} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              <Save className="w-4 h-4" /> Сохранить настройки
            </button>
          </div>
        </div>
      )}

      {/* Database settings */}
      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Управление данными</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Экспорт всей базы</p>
                <p className="text-xs text-gray-500 mb-3">Скачать все данные в формате JSON для резервного копирования</p>
                <button
                  onClick={() => {
                    const data = store.getData();
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `leadhunter_backup_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Экспортировать JSON
                </button>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                <p className="text-sm font-medium text-red-900 mb-1">Сброс данных</p>
                <p className="text-xs text-red-700 mb-3">Удалить все данные и загрузить тестовые. Это действие необратимо.</p>
                <button
                  onClick={handleResetData}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  <RotateCcw className="w-4 h-4" /> Сбросить все данные
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security settings */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Безопасность</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Авторизация активна</p>
                <p className="text-xs text-green-700">Доступ к панели защищён сессией</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">SSRF-защита</p>
                <p className="text-xs text-green-700">Запрещён доступ к localhost, приватным IP и метаданным облака</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Валидация входных данных</p>
                <p className="text-xs text-green-700">Все входные данные проверяются на корректность</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Защита от Formula Injection</p>
                <p className="text-xs text-green-700">Экспорт Excel обрабатывает потенциально опасные строки</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900">Журнал аудита</p>
                <p className="text-xs text-green-700">Все важные действия записываются в журнал</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
