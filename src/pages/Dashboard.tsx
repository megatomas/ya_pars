import { useMemo } from 'react';
import { store } from '../store';
import {
  Building2, Globe, Mail, Phone, Layout, Send,
  Users, TrendingUp, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Dashboard() {
  const data = store.getData();
  const companies = data.companies;
  const jobs = data.jobs;
  const campaigns = data.campaigns;

  const stats = useMemo(() => {
    const total = companies.length;
    const noWebsite = companies.filter(c => c.websiteStatus === 'not_found' || c.websiteStatus === 'not_specified').length;
    const withEmail = companies.filter(c => c.email).length;
    const withPhone = companies.filter(c => c.phone).length;
    const withDemoSite = companies.filter(c => c.demoSiteUrl).length;
    const proposalsSent = companies.filter(c => c.proposalSentDate).length;
    const clients = companies.filter(c => c.contactStatus === 'client').length;
    const newThisWeek = companies.filter(c => {
      const d = new Date(c.firstSeen);
      const week = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return d > week;
    }).length;

    return { total, noWebsite, withEmail, withPhone, withDemoSite, proposalsSent, clients, newThisWeek };
  }, [companies]);

  const conversionRate = stats.total > 0 ? ((stats.clients / stats.total) * 100).toFixed(1) : '0';

  const statusDistribution = useMemo(() => {
    const statuses: Record<string, number> = {};
    companies.forEach(c => {
      statuses[c.websiteStatus] = (statuses[c.websiteStatus] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  }, [companies]);

  const cityDistribution = useMemo(() => {
    const cities: Record<string, number> = {};
    companies.forEach(c => {
      cities[c.city] = (cities[c.city] || 0) + 1;
    });
    return Object.entries(cities)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [companies]);

  const categoryDistribution = useMemo(() => {
    const cats: Record<string, number> = {};
    companies.forEach(c => {
      cats[c.category] = (cats[c.category] || 0) + 1;
    });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [companies]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

  const websiteStatusLabels: Record<string, string> = {
    found: 'Найден',
    not_found: 'Не найден',
    not_specified: 'Не указан',
    needs_review: 'Нужна проверка',
    unavailable: 'Недоступен',
    check_error: 'Ошибка',
  };

  const statCards = [
    { label: 'Всего компаний', value: stats.total, icon: Building2, color: 'bg-blue-500' },
    { label: 'Новые за неделю', value: stats.newThisWeek, icon: TrendingUp, color: 'bg-green-500' },
    { label: 'Без сайта', value: stats.noWebsite, icon: Globe, color: 'bg-red-500' },
    { label: 'С email', value: stats.withEmail, icon: Mail, color: 'bg-purple-500' },
    { label: 'С телефоном', value: stats.withPhone, icon: Phone, color: 'bg-cyan-500' },
    { label: 'Демосайты', value: stats.withDemoSite, icon: Layout, color: 'bg-amber-500' },
    { label: 'Отправлено', value: stats.proposalsSent, icon: Send, color: 'bg-indigo-500' },
    { label: 'Клиенты', value: stats.clients, icon: Users, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`${card.color} w-10 h-10 rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion rate */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Конверсия лид → клиент</p>
            <p className="text-4xl font-bold mt-1">{conversionRate}%</p>
            <p className="text-blue-200 text-sm mt-1">{stats.clients} из {stats.total} компаний</p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* City distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Распределение по городам</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Website status pie */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Статусы сайтов</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusDistribution.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusDistribution.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-gray-600">{websiteStatusLabels[item.name] || item.name}</span>
                  <span className="ml-auto font-medium text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Категории бизнеса</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categoryDistribution.map(cat => (
            <div key={cat.name} className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{cat.value}</p>
              <p className="text-xs text-gray-500 truncate">{cat.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent jobs & campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent jobs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Последние задания</h3>
          <div className="space-y-3">
            {jobs.slice(0, 4).map(job => (
              <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {job.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />}
                {job.status === 'running' && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />}
                {job.status === 'completed_with_errors' && <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />}
                {job.status === 'error' && <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{job.query}</p>
                  <p className="text-xs text-gray-500">{job.source} · {job.foundCount} найдено</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  job.status === 'completed' ? 'bg-green-100 text-green-700' :
                  job.status === 'running' ? 'bg-blue-100 text-blue-700' :
                  job.status === 'completed_with_errors' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {job.status === 'completed' ? 'Готово' :
                   job.status === 'running' ? 'Выполняется' :
                   job.status === 'completed_with_errors' ? 'С ошибками' :
                   job.status === 'error' ? 'Ошибка' : job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent campaigns */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Email-кампании</h3>
          <div className="space-y-3">
            {campaigns.map(camp => (
              <div key={camp.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-5 h-5 text-purple-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{camp.name}</p>
                  <p className="text-xs text-gray-500">
                    {camp.sentCount} отправлено · {camp.failedCount} ошибок · {camp.companies.length} получателей
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  camp.status === 'completed' ? 'bg-green-100 text-green-700' :
                  camp.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                  camp.status === 'draft' ? 'bg-gray-100 text-gray-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {camp.status === 'completed' ? 'Завершена' :
                   camp.status === 'sending' ? 'Отправка' :
                   camp.status === 'draft' ? 'Черновик' : 'Пауза'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
