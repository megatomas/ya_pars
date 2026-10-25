import { useState, useMemo } from 'react';
import { store } from '../store';
import { Company } from '../types';
import { Globe, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Search } from 'lucide-react';

const statusLabels: Record<string, { label: string; color: string }> = {
  found: { label: 'Сайт найден', color: 'bg-green-100 text-green-700' },
  not_found: { label: 'Сайт не найден', color: 'bg-red-100 text-red-700' },
  not_specified: { label: 'Не указан', color: 'bg-gray-100 text-gray-600' },
  needs_review: { label: 'Нужна проверка', color: 'bg-amber-100 text-amber-700' },
  unavailable: { label: 'Недоступен', color: 'bg-orange-100 text-orange-700' },
  check_error: { label: 'Ошибка', color: 'bg-red-100 text-red-600' },
};

export default function WebsiteCheck() {
  const [companies, setCompanies] = useState<Company[]>(store.getCompanies());
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = companies;
    if (filter !== 'all') result = result.filter(c => c.websiteStatus === filter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q));
    }
    return result;
  }, [companies, filter, search]);

  const stats = useMemo(() => {
    const total = companies.length;
    const found = companies.filter(c => c.websiteStatus === 'found').length;
    const notFound = companies.filter(c => c.websiteStatus === 'not_found').length;
    const notSpecified = companies.filter(c => c.websiteStatus === 'not_specified').length;
    const needsReview = companies.filter(c => c.websiteStatus === 'needs_review').length;
    const unavailable = companies.filter(c => c.websiteStatus === 'unavailable').length;
    return { total, found, notFound, notSpecified, needsReview, unavailable };
  }, [companies]);

  const handleRecheck = (id: string) => {
    store.updateCompany(id, { websiteCheckDate: new Date().toISOString().split('T')[0] });
    setCompanies(store.getCompanies());
    store.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'info',
      module: 'Проверка сайтов',
      message: `Повторная проверка компании #${id}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Проверка наличия сайтов</h2>
        <p className="text-sm text-gray-500">Многоэтапная верификация наличия официального сайта компании</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Всего</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <p className="text-xl font-bold text-green-700">{stats.found}</p>
          <p className="text-xs text-green-600">Найден</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4 text-center">
          <p className="text-xl font-bold text-red-700">{stats.notFound}</p>
          <p className="text-xs text-red-600">Не найден</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-xl font-bold text-gray-700">{stats.notSpecified}</p>
          <p className="text-xs text-gray-500">Не указан</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
          <p className="text-xl font-bold text-amber-700">{stats.needsReview}</p>
          <p className="text-xs text-amber-600">Нужна проверка</p>
        </div>
        <div className="bg-orange-50 rounded-xl border border-orange-200 p-4 text-center">
          <p className="text-xl font-bold text-orange-700">{stats.unavailable}</p>
          <p className="text-xs text-orange-600">Недоступен</p>
        </div>
      </div>

      {/* Process explanation */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Этапы проверки</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              <span className="text-sm font-medium text-blue-900">Карточка</span>
            </div>
            <p className="text-xs text-blue-700">Проверка поля «Сайт» в исходной карточке справочника</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              <span className="text-sm font-medium text-purple-900">Поиск</span>
            </div>
            <p className="text-xs text-purple-700">Поисковые запросы по названию, городу, телефону</p>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              <span className="text-sm font-medium text-amber-900">Анализ</span>
            </div>
            <p className="text-xs text-amber-700">Проверка домена, совпадение данных, исключение агрегаторов</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-green-600 text-white text-xs flex items-center justify-center font-bold">4</span>
              <span className="text-sm font-medium text-green-900">Классификация</span>
            </div>
            <p className="text-xs text-green-700">Финальный статус с указанием уверенности и причин</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="all">Все статусы</option>
          <option value="not_found">Не найден</option>
          <option value="not_specified">Не указан</option>
          <option value="found">Найден</option>
          <option value="needs_review">Нужна проверка</option>
          <option value="unavailable">Недоступен</option>
        </select>
      </div>

      {/* Results table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-medium text-gray-700">Компания</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Город</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Статус</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Уверенность</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Дата проверки</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Причина</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 20).map(company => (
              <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{company.name}</td>
                <td className="px-4 py-3 text-gray-600">{company.city}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusLabels[company.websiteStatus]?.color}`}>
                    {statusLabels[company.websiteStatus]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{ width: `${company.confidenceLevel}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{company.confidenceLevel}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">{company.websiteCheckDate || '—'}</td>
                <td className="px-4 py-3 text-gray-600 text-xs truncate max-w-[200px]">{company.classificationReason || '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRecheck(company.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Проверить повторно"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Configuration note */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">Настройка поискового API</p>
            <p className="text-xs text-amber-700 mt-1">
              Для полноценной проверки сайтов необходимо подключить поисковый API (Bing Web Search или аналог).
              Перейдите в раздел «Настройки» → «Интеграции» для конфигурации.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
