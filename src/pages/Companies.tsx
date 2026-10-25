import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import { Company } from '../types';
import {
  Search, Filter, Download, Plus, ChevronUp, ChevronDown,
  ExternalLink, Copy, MoreHorizontal, Eye, Trash2, X
} from 'lucide-react';

const ITEMS_PER_PAGE = 15;

const websiteStatusLabels: Record<string, { label: string; color: string }> = {
  found: { label: 'Найден', color: 'bg-green-100 text-green-700' },
  not_found: { label: 'Не найден', color: 'bg-red-100 text-red-700' },
  not_specified: { label: 'Не указан', color: 'bg-gray-100 text-gray-600' },
  needs_review: { label: 'Нужна проверка', color: 'bg-amber-100 text-amber-700' },
  unavailable: { label: 'Недоступен', color: 'bg-orange-100 text-orange-700' },
  check_error: { label: 'Ошибка', color: 'bg-red-100 text-red-600' },
};

const contactStatusLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'Новый', color: 'bg-blue-100 text-blue-700' },
  verified: { label: 'Проверен', color: 'bg-cyan-100 text-cyan-700' },
  priority: { label: 'Приоритет', color: 'bg-purple-100 text-purple-700' },
  demo_in_progress: { label: 'Демо в работе', color: 'bg-indigo-100 text-indigo-700' },
  demo_ready: { label: 'Демо готово', color: 'bg-emerald-100 text-emerald-700' },
  proposal_prepared: { label: 'Предложение готово', color: 'bg-teal-100 text-teal-700' },
  proposal_sent: { label: 'Отправлено', color: 'bg-violet-100 text-violet-700' },
  response_received: { label: 'Ответ получен', color: 'bg-lime-100 text-lime-700' },
  negotiation: { label: 'Переговоры', color: 'bg-yellow-100 text-yellow-700' },
  client: { label: 'Клиент', color: 'bg-green-100 text-green-800' },
  refused: { label: 'Отказ', color: 'bg-red-100 text-red-700' },
  do_not_contact: { label: 'Не связываться', color: 'bg-gray-200 text-gray-700' },
};

export default function Companies() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>(store.getCompanies());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Company>('score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    category: '',
    minRating: 0,
    maxRating: 5,
    minReviews: 0,
    websiteStatus: '',
    contactStatus: '',
    hasPhone: false,
    hasEmail: false,
    hasDemoSite: false,
    excluded: false,
  });

  const filteredCompanies = useMemo(() => {
    let result = [...companies];
    
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }

    // Filters
    if (filters.city) result = result.filter(c => c.city === filters.city);
    if (filters.category) result = result.filter(c => c.category === filters.category);
    if (filters.minRating > 0) result = result.filter(c => c.rating >= filters.minRating);
    if (filters.maxRating < 5) result = result.filter(c => c.rating <= filters.maxRating);
    if (filters.minReviews > 0) result = result.filter(c => c.reviewCount >= filters.minReviews);
    if (filters.websiteStatus) result = result.filter(c => c.websiteStatus === filters.websiteStatus);
    if (filters.contactStatus) result = result.filter(c => c.contactStatus === filters.contactStatus);
    if (filters.hasPhone) result = result.filter(c => c.phone);
    if (filters.hasEmail) result = result.filter(c => c.email);
    if (filters.hasDemoSite) result = result.filter(c => c.demoSiteUrl);
    if (!filters.excluded) result = result.filter(c => !c.excluded);

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return result;
  }, [companies, searchQuery, filters, sortField, sortDir]);

  const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
  const paginatedCompanies = filteredCompanies.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const cities = useMemo(() => [...new Set(companies.map(c => c.city))].sort(), [companies]);
  const categories = useMemo(() => [...new Set(companies.map(c => c.category))].sort(), [companies]);

  const toggleSort = (field: keyof Company) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedCompanies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedCompanies.map(c => c.id)));
    }
  };

  const handleExport = () => {
    const toExport = selectedIds.size > 0
      ? companies.filter(c => selectedIds.has(c.id))
      : filteredCompanies;
    
    const headers = ['Название', 'Категория', 'Город', 'Рейтинг', 'Отзывы', 'Телефон', 'Email', 'Статус сайта', 'Сайт', 'Демосайт', 'Статус контакта', 'Приоритет'];
    const rows = toExport.map(c => [
      c.name, c.category, c.city, c.rating, c.reviewCount,
      c.phone, c.email, websiteStatusLabels[c.websiteStatus]?.label || c.websiteStatus,
      c.websiteUrl, c.demoSiteUrl,
      contactStatusLabels[c.contactStatus]?.label || c.contactStatus,
      c.score
    ]);

    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leadhunter_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: string) => {
    if (confirm('Удалить компанию из базы?')) {
      store.deleteCompany(id);
      setCompanies(store.getCompanies());
      setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const SortIcon = ({ field }: { field: keyof Company }) => {
    if (sortField !== field) return <ChevronDown className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />;
  };

  const resetFilters = () => {
    setFilters({ city: '', category: '', minRating: 0, maxRating: 5, minReviews: 0, websiteStatus: '', contactStatus: '', hasPhone: false, hasEmail: false, hasDemoSite: false, excluded: false });
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">База компаний</h2>
          <p className="text-sm text-gray-500">{filteredCompanies.length} из {companies.length} компаний</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/companies/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" /> Добавить
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <Download className="w-4 h-4" /> Экспорт
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по названию, телефону, email, адресу..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            <Filter className="w-4 h-4" /> Фильтры
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Город</label>
                <select
                  value={filters.city}
                  onChange={e => { setFilters(f => ({ ...f, city: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Все</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Категория</label>
                <select
                  value={filters.category}
                  onChange={e => { setFilters(f => ({ ...f, category: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Все</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Рейтинг от</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={filters.minRating || ''}
                  onChange={e => { setFilters(f => ({ ...f, minRating: parseFloat(e.target.value) || 0 })); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Отзывы от</label>
                <input
                  type="number"
                  min={0}
                  value={filters.minReviews || ''}
                  onChange={e => { setFilters(f => ({ ...f, minReviews: parseInt(e.target.value) || 0 })); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Статус сайта</label>
                <select
                  value={filters.websiteStatus}
                  onChange={e => { setFilters(f => ({ ...f, websiteStatus: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Все</option>
                  <option value="not_found">Не найден</option>
                  <option value="not_specified">Не указан</option>
                  <option value="found">Найден</option>
                  <option value="needs_review">Нужна проверка</option>
                  <option value="unavailable">Недоступен</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Статус контакта</label>
                <select
                  value={filters.contactStatus}
                  onChange={e => { setFilters(f => ({ ...f, contactStatus: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">Все</option>
                  {Object.entries(contactStatusLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-3">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={filters.hasPhone} onChange={e => setFilters(f => ({ ...f, hasPhone: e.target.checked }))} className="rounded border-gray-300" />
                С телефоном
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={filters.hasEmail} onChange={e => setFilters(f => ({ ...f, hasEmail: e.target.checked }))} className="rounded border-gray-300" />
                С email
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={filters.hasDemoSite} onChange={e => setFilters(f => ({ ...f, hasDemoSite: e.target.checked }))} className="rounded border-gray-300" />
                С демосайтом
              </label>
              <button onClick={resetFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                Сбросить фильтры
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected bar */}
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-3">
          <span className="text-sm text-blue-700 font-medium">Выбрано: {selectedIds.size}</span>
          <button
            onClick={() => {
              selectedIds.forEach(id => store.updateCompany(id, { excluded: true }));
              setCompanies(store.getCompanies());
              setSelectedIds(new Set());
            }}
            className="text-xs text-red-600 hover:text-red-800 font-medium"
          >
            Исключить из работы
          </button>
          <button onClick={() => setSelectedIds(new Set())} className="text-xs text-gray-500 hover:text-gray-700 ml-auto">
            Снять выделение
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedCompanies.length && paginatedCompanies.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-3 py-3 text-left cursor-pointer hover:text-blue-600" onClick={() => toggleSort('score')}>
                  <div className="flex items-center gap-1">Балл <SortIcon field="score" /></div>
                </th>
                <th className="px-3 py-3 text-left cursor-pointer hover:text-blue-600" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">Название <SortIcon field="name" /></div>
                </th>
                <th className="px-3 py-3 text-left cursor-pointer hover:text-blue-600" onClick={() => toggleSort('category')}>
                  <div className="flex items-center gap-1">Категория <SortIcon field="category" /></div>
                </th>
                <th className="px-3 py-3 text-left cursor-pointer hover:text-blue-600" onClick={() => toggleSort('city')}>
                  <div className="flex items-center gap-1">Город <SortIcon field="city" /></div>
                </th>
                <th className="px-3 py-3 text-left cursor-pointer hover:text-blue-600" onClick={() => toggleSort('rating')}>
                  <div className="flex items-center gap-1">Рейтинг <SortIcon field="rating" /></div>
                </th>
                <th className="px-3 py-3 text-left cursor-pointer hover:text-blue-600" onClick={() => toggleSort('reviewCount')}>
                  <div className="flex items-center gap-1">Отзывы <SortIcon field="reviewCount" /></div>
                </th>
                <th className="px-3 py-3 text-left">Телефон</th>
                <th className="px-3 py-3 text-left">Статус сайта</th>
                <th className="px-3 py-3 text-left">Статус</th>
                <th className="px-3 py-3 text-left w-10"></th>
              </tr>
            </thead>
            <tbody>
              {paginatedCompanies.map(company => (
                <tr
                  key={company.id}
                  className={`border-b border-gray-100 hover:bg-blue-50/50 transition cursor-pointer ${selectedIds.has(company.id) ? 'bg-blue-50' : ''}`}
                  onClick={() => navigate(`/companies/${company.id}`)}
                >
                  <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(company.id)}
                      onChange={() => toggleSelect(company.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      company.score >= 70 ? 'bg-green-100 text-green-700' :
                      company.score >= 40 ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {company.score}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-gray-900 truncate max-w-[200px]">{company.name}</div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600 truncate max-w-[150px]">{company.category}</td>
                  <td className="px-3 py-2.5 text-gray-600">{company.city}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">★</span>
                      <span className="font-medium">{company.rating}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-600">{company.reviewCount}</td>
                  <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{company.phone || '—'}</td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${websiteStatusLabels[company.websiteStatus]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {websiteStatusLabels[company.websiteStatus]?.label || company.websiteStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${contactStatusLabels[company.contactStatus]?.color || 'bg-gray-100 text-gray-600'}`}>
                      {contactStatusLabels[company.contactStatus]?.label || company.contactStatus}
                    </span>
                  </td>
                  <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigate(`/companies/${company.id}`)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Открыть карточку"
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="p-1 hover:bg-red-50 rounded"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Показано {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filteredCompanies.length)} из {filteredCompanies.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ←
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-1 text-sm border rounded ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-white'}`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
