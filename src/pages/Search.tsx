import { useState } from 'react';
import { store } from '../store';
import { Link2, Search as SearchIcon, Globe, MapPin, Tag } from 'lucide-react';

export default function SearchPage() {
  const [mode, setMode] = useState<'params' | 'url'>('params');
  const [url, setUrl] = useState('');
  const [form, setForm] = useState({
    country: 'Россия',
    region: 'Краснодарский край',
    city: 'Краснодар',
    district: '',
    category: '',
    query: '',
    targetCount: 100,
    minReviews: 0,
    maxReviews: '',
    minRating: 0,
    maxRating: 5,
    noWebsite: true,
    withPhone: false,
    withEmail: false,
    activeOnly: true,
  });
  const [submitted, setSubmitted] = useState(false);

  const handleUrlAnalysis = () => {
    if (!url) return;
    setSubmitted(true);
    store.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      module: 'Поиск',
      message: `Анализ URL: ${url}`,
      details: 'Определение типа ссылки и извлечение параметров',
    });
  };

  const handleSubmitSearch = () => {
    setSubmitted(true);
    const jobId = `job-${Date.now()}`;
    store.addJob({
      id: jobId,
      source: 'Яндекс Карты',
      query: `${form.category}, ${form.city}`,
      filters: { ...form },
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'queued',
      foundCount: 0,
      newCount: 0,
      updatedCount: 0,
      duplicateCount: 0,
      errorCount: 0,
      currentStage: 'В очереди',
      errorMessage: '',
    });
    store.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      module: 'Сбор данных',
      message: `Задание ${jobId} создано`,
      details: `${form.category}, ${form.city}, целевой объём: ${form.targetCount}`,
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Поиск компаний</h2>
        <p className="text-sm text-gray-500">Найдите потенциальных клиентов по параметрам или ссылке на Яндекс Карты</p>
      </div>

      {/* Mode tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1">
        <button
          onClick={() => { setMode('params'); setSubmitted(false); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${mode === 'params' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <SearchIcon className="w-4 h-4" /> По параметрам
        </button>
        <button
          onClick={() => { setMode('url'); setSubmitted(false); }}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${mode === 'url' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Link2 className="w-4 h-4" /> По ссылке
        </button>
      </div>

      {mode === 'url' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Анализ ссылки</h3>
          <p className="text-sm text-gray-500 mb-4">
            Вставьте URL карточки организации или страницы результатов поиска на Яндекс Картах.
            Сервис определит тип ссылки и извлечёт доступные параметры.
          </p>
          <div className="flex gap-3">
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://yandex.ru/maps/..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleUrlAnalysis}
              disabled={!url}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Анализировать
            </button>
          </div>

          {submitted && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Результат анализа</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>• Тип ссылки: <strong>Страница результатов поиска</strong></p>
                <p>• Категория: <strong>Ландшафтный дизайн</strong></p>
                <p>• Город: <strong>Краснодар</strong></p>
                <p>• Доступно организаций: <strong>~25</strong></p>
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleSubmitSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  Создать задание на сбор
                </button>
                <button
                  onClick={() => { setMode('params'); setSubmitted(false); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Настроить параметры вручную
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Важно:</strong> Автоматический сбор данных с Яндекс Карт ограничен условиями сервиса.
              Для полноценной работы рекомендуется использовать коммерческий API или альтернативные источники.
              Настройте источники данных в разделе «Настройки».
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Параметры поиска</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 text-gray-400" /> Страна
              </label>
              <input
                type="text"
                value={form.country}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Регион</label>
              <input
                type="text"
                value={form.region}
                onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Город *</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Район / область</label>
              <input
                type="text"
                value={form.district}
                onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Необязательно"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Tag className="w-4 h-4 text-gray-400" /> Категория бизнеса *
              </label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Например: ландшафтный дизайн"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Доп. запросы</label>
              <input
                type="text"
                value={form.query}
                onChange={e => setForm(f => ({ ...f, query: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Дополнительные ключевые слова"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 mt-6 pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Критерии фильтрации</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Целевой объём</label>
                <input
                  type="number"
                  value={form.targetCount}
                  onChange={e => setForm(f => ({ ...f, targetCount: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Мин. отзывов</label>
                <input
                  type="number"
                  value={form.minReviews}
                  onChange={e => setForm(f => ({ ...f, minReviews: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Мин. рейтинг</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={5}
                  value={form.minRating}
                  onChange={e => setForm(f => ({ ...f, minRating: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Макс. рейтинг</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  max={5}
                  value={form.maxRating}
                  onChange={e => setForm(f => ({ ...f, maxRating: parseFloat(e.target.value) || 5 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.noWebsite} onChange={e => setForm(f => ({ ...f, noWebsite: e.target.checked }))} className="rounded border-gray-300" />
                Только без сайта
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.withPhone} onChange={e => setForm(f => ({ ...f, withPhone: e.target.checked }))} className="rounded border-gray-300" />
                Только с телефоном
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.withEmail} onChange={e => setForm(f => ({ ...f, withEmail: e.target.checked }))} className="rounded border-gray-300" />
                Только с email
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.activeOnly} onChange={e => setForm(f => ({ ...f, activeOnly: e.target.checked }))} className="rounded border-gray-300" />
                Только действующие
              </label>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmitSearch}
              disabled={!form.city || !form.category}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SearchIcon className="w-4 h-4" /> Создать задание на сбор
            </button>
          </div>

          {submitted && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">✓ Задание создано и добавлено в очередь</p>
              <p className="text-xs text-green-700 mt-1">Перейдите в раздел «Задания сбора» для отслеживания прогресса</p>
            </div>
          )}
        </div>
      )}

      {/* Sources info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" /> Доступные источники
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="font-medium text-sm text-gray-900">Яндекс Карты API</p>
            <p className="text-xs text-gray-500 mt-1">Требуется API-ключ. Коммерческая лицензия.</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">Нужна настройка</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="font-medium text-sm text-gray-900">Импорт CSV/XLSX</p>
            <p className="text-xs text-gray-500 mt-1">Загрузка готовых баз данных.</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Доступно</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <p className="font-medium text-sm text-gray-900">Ручное добавление</p>
            <p className="text-xs text-gray-500 mt-1">Добавление компаний по одной.</p>
            <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Доступно</span>
          </div>
        </div>
      </div>
    </div>
  );
}
