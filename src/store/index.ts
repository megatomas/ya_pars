import { Company, CollectionJob, EmailCampaign, LogEntry, ScoringWeights, WebsiteCheck } from '../types';

const STORAGE_KEY = 'leadhunter_data';

interface StoreData {
  companies: Company[];
  jobs: CollectionJob[];
  campaigns: EmailCampaign[];
  logs: LogEntry[];
  weights: ScoringWeights;
  websiteChecks: WebsiteCheck[];
}

const defaultWeights: ScoringWeights = {
  reviews50plus: 15,
  reviews100plus: 10,
  rating43plus: 10,
  rating47plus: 5,
  emailConfirmed: 20,
  phonePresent: 10,
  onlyCatalogProfile: 10,
  noWebsiteConfirmed: 20,
};

function generateMockCompanies(): Company[] {
  const cities = ['Краснодар', 'Москва', 'Санкт-Петербург', 'Ростов-на-Дону', 'Сочи', 'Новороссийск'];
  const categories = [
    'Ландшафтный дизайн', 'Строительство', 'Ремонт квартир', 'Стоматология',
    'Автосервис', 'Юридические услуги', 'Бухгалтерские услуги', 'Фитнес-клуб',
    'Салон красоты', 'Кафе и рестораны', 'Фотография', 'Клининг'
  ];
  const statuses: Company['websiteStatus'][] = ['not_found', 'not_specified', 'found', 'needs_review', 'unavailable'];
  const contactStatuses: Company['contactStatus'][] = ['new', 'verified', 'priority', 'demo_ready', 'proposal_sent', 'client', 'refused'];
  
  const companies: Company[] = [];
  const companyNames = [
    'Зелёный Мир', 'СтройМастер', 'РемонтПро', 'ДенталПлюс', 'АвтоГуру',
    'ПравоЗащита', 'БухФинанс', 'ФитнесЛайф', 'БьютиСтудия', 'ВкусноТут',
    'ФотоАрт', 'КлинСервис', 'ГринЛэнд', 'МегаСтрой', 'ДомМастер',
    'ЗубЗдоровье', 'КарСервис', 'ЮристПро', 'ФинКонсалт', 'СпортЗал',
    'СтильМод', 'РесторанЪ', 'ФотоПрофи', 'ЧистыйДом', 'ЛандшафтМастер',
    'БетонСтрой', 'РемонтДом', 'СтомДент', 'АвтоДок', 'ЗаконПлюс',
    'АудитГрупп', 'Атлетик', 'КрасотаИМир', 'ШефПовар', 'МгновенныйКадр',
    'ЭкоКлин', 'СадовыйРай', 'МонолитСтрой', 'МастерскаяУюта', 'БелыйКлык',
    'Шиномонтаж24', 'АдвокатПро', 'НалогСервис', 'ОлимпСпорт', 'Гламур',
    'Трапеза', 'ПортретМастер', 'ГенУборка', 'ПаркСад', 'КирпичДом'
  ];

  for (let i = 0; i < 50; i++) {
    const reviewCount = Math.floor(Math.random() * 300);
    const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
    const hasPhone = Math.random() > 0.2;
    const hasEmail = Math.random() > 0.4;
    const websiteStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const hasDemoSite = Math.random() > 0.7;
    
    let score = 0;
    if (reviewCount >= 50) score += defaultWeights.reviews50plus;
    if (reviewCount >= 100) score += defaultWeights.reviews100plus;
    if (rating >= 4.3) score += defaultWeights.rating43plus;
    if (rating >= 4.7) score += defaultWeights.rating47plus;
    if (hasEmail) score += defaultWeights.emailConfirmed;
    if (hasPhone) score += defaultWeights.phonePresent;
    if (websiteStatus === 'not_found' || websiteStatus === 'not_specified') score += defaultWeights.noWebsiteConfirmed;
    score = Math.min(100, score);

    companies.push({
      id: `company-${i + 1}`,
      name: companyNames[i] || `Компания ${i + 1}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      subcategories: [],
      description: '',
      region: 'Краснодарский край',
      city: cities[Math.floor(Math.random() * cities.length)],
      address: `ул. ${['Красная', 'Бабушкина', 'Горького', 'Ставропольская', 'Красноармейская'][Math.floor(Math.random() * 5)]}, д. ${Math.floor(Math.random() * 200) + 1}`,
      status: 'Действующая',
      firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastChecked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      directoryUrl: `https://yandex.ru/maps/org/${i + 100000}`,
      sourceId: `${100000 + i}`,
      rating: rating,
      reviewCount: reviewCount,
      ratingCount: reviewCount + Math.floor(Math.random() * 50),
      workingHours: 'Пн-Пт 9:00-18:00',
      dataReceivedDate: new Date().toISOString().split('T')[0],
      dataSource: 'Яндекс Карты',
      phone: hasPhone ? `+7 (${900 + Math.floor(Math.random() * 99)}) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 90 + 10)}` : '',
      additionalPhones: [],
      email: hasEmail ? `info@${companyNames[i]?.toLowerCase().replace(/[^a-zа-я]/g, '') || 'company'}${i}.ru` : '',
      website: websiteStatus === 'found' ? `https://www.${companyNames[i]?.toLowerCase().replace(/[^a-zа-я]/g, '') || 'company'}${i}.ru` : '',
      vk: Math.random() > 0.5 ? `https://vk.com/club${100000 + i}` : '',
      telegram: '',
      whatsapp: '',
      otherLinks: [],
      contactForm: '',
      contactName: Math.random() > 0.6 ? ['Иванов И.И.', 'Петрова А.С.', 'Сидоров К.М.', 'Козлова Е.В.'][Math.floor(Math.random() * 4)] : '',
      websiteStatus: websiteStatus,
      websiteUrl: websiteStatus === 'found' ? `https://www.${companyNames[i]?.toLowerCase().replace(/[^a-zа-я]/g, '') || 'company'}${i}.ru` : '',
      websiteCheckDate: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      httpStatus: websiteStatus === 'found' ? 200 : null,
      websiteAvailable: websiteStatus === 'found',
      hasHttps: websiteStatus === 'found',
      hasMobileVersion: websiteStatus === 'found' ? Math.random() > 0.5 : null,
      classificationReason: websiteStatus === 'not_found' ? 'Поиск не обнаружил официальный сайт' : websiteStatus === 'found' ? 'Сайт подтверждён' : 'Не указан в справочнике',
      confidenceLevel: websiteStatus === 'found' ? 95 : websiteStatus === 'not_found' ? 80 : 50,
      leadPriority: score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low',
      selectionReason: reviewCount >= 50 ? 'Высокое количество отзывов' : 'Соответствие критериям',
      potentialNeed: websiteStatus !== 'found' ? 'Отсутствует собственный сайт' : 'Сайт устарел',
      demoSiteUrl: hasDemoSite ? `https://demo-${companyNames[i]?.toLowerCase().replace(/[^a-zа-я]/g, '') || 'company'}${i}.vercel.app` : '',
      demoSiteCreated: hasDemoSite ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : '',
      proposalSentDate: '',
      contactStatus: contactStatuses[Math.floor(Math.random() * contactStatuses.length)],
      comments: '',
      nextTask: '',
      nextActionDate: '',
      refusalReason: '',
      lastContactDate: '',
      excluded: false,
      isDuplicate: false,
      score: score,
    });
  }
  return companies;
}

function generateMockJobs(): CollectionJob[] {
  return [
    {
      id: 'job-1',
      source: 'Яндекс Карты',
      query: 'Ландшафтный дизайн, Краснодар',
      filters: { minReviews: 50, minRating: 4.0, noWebsite: true },
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      foundCount: 45,
      newCount: 32,
      updatedCount: 8,
      duplicateCount: 5,
      errorCount: 0,
      currentStage: 'Завершено',
      errorMessage: '',
    },
    {
      id: 'job-2',
      source: 'Яндекс Карты',
      query: 'Строительство, Ростов-на-Дону',
      filters: { minReviews: 30, minRating: 4.0 },
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      endTime: null,
      status: 'running',
      foundCount: 18,
      newCount: 12,
      updatedCount: 3,
      duplicateCount: 3,
      errorCount: 0,
      currentStage: 'Сбор данных...',
      errorMessage: '',
    },
    {
      id: 'job-3',
      source: 'Импорт CSV',
      query: 'Загрузка базы stomatologia.csv',
      filters: {},
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(),
      status: 'completed_with_errors',
      foundCount: 120,
      newCount: 95,
      updatedCount: 15,
      duplicateCount: 10,
      errorCount: 3,
      currentStage: 'Завершено с ошибками',
      errorMessage: '3 строки пропущены: некорректный формат телефона',
    },
  ];
}

function generateMockLogs(): LogEntry[] {
  return [
    { id: 'log-1', timestamp: new Date().toISOString(), level: 'info', module: 'Сбор данных', message: 'Задание job-2 запущено', details: 'Источник: Яндекс Карты, запрос: Строительство, Ростов-на-Дону' },
    { id: 'log-2', timestamp: new Date(Date.now() - 60000).toISOString(), level: 'success', module: 'Дедупликация', message: 'Обнаружено 5 дубликатов', details: 'Объединение выполнено автоматически' },
    { id: 'log-3', timestamp: new Date(Date.now() - 120000).toISOString(), level: 'warning', module: 'Проверка сайтов', message: 'Таймаут при проверке example.ru', details: 'Превышено время ожидания 30 сек' },
    { id: 'log-4', timestamp: new Date(Date.now() - 300000).toISOString(), level: 'error', module: 'Импорт', message: 'Ошибка обработки строки 45', details: 'Некорректный формат email' },
    { id: 'log-5', timestamp: new Date(Date.now() - 600000).toISOString(), level: 'success', module: 'Экспорт', message: 'Экспорт завершён: 32 компании', details: 'Файл: leadhunter_krasnodar_2026-01-15.xlsx' },
    { id: 'log-6', timestamp: new Date(Date.now() - 900000).toISOString(), level: 'info', module: 'Система', message: 'Пользователь авторизован', details: 'IP: 192.168.1.1' },
    { id: 'log-7', timestamp: new Date(Date.now() - 1200000).toISOString(), level: 'info', module: 'Сбор данных', message: 'Задание job-1 завершено', details: 'Найдено 45, новых 32' },
    { id: 'log-8', timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'warning', module: 'Проверка сайтов', message: 'SSL-сертификат истёк на site.ru', details: 'Сайт помечен как недоступный' },
  ];
}

function generateMockCampaigns(): EmailCampaign[] {
  return [
    {
      id: 'campaign-1',
      name: 'Ландшафтный дизайн — Краснодар',
      template: 'Концепция сайта для {{company_name}}',
      subject: 'Концепция сайта для {{company_name}}',
      companies: ['company-1', 'company-3', 'company-7'],
      status: 'completed',
      sentCount: 2,
      failedCount: 1,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'campaign-2',
      name: 'Строительные компании — юг России',
      template: 'Предложение по созданию сайта',
      subject: 'Сайт для {{company_name}} — демо готово',
      companies: ['company-2', 'company-5'],
      status: 'draft',
      sentCount: 0,
      failedCount: 0,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sentAt: null,
    },
  ];
}

function loadStore(): StoreData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load store:', e);
  }
  
  const initial: StoreData = {
    companies: generateMockCompanies(),
    jobs: generateMockJobs(),
    campaigns: generateMockCampaigns(),
    logs: generateMockLogs(),
    weights: defaultWeights,
    websiteChecks: [],
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function saveStore(data: StoreData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Public API
export const store = {
  getData: (): StoreData => loadStore(),
  
  getCompanies: (): Company[] => loadStore().companies,
  
  getCompany: (id: string): Company | undefined => {
    return loadStore().companies.find(c => c.id === id);
  },
  
  updateCompany: (id: string, updates: Partial<Company>): Company | undefined => {
    const data = loadStore();
    const idx = data.companies.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    data.companies[idx] = { ...data.companies[idx], ...updates };
    saveStore(data);
    return data.companies[idx];
  },
  
  addCompany: (company: Company): void => {
    const data = loadStore();
    data.companies.unshift(company);
    saveStore(data);
  },
  
  deleteCompany: (id: string): void => {
    const data = loadStore();
    data.companies = data.companies.filter(c => c.id !== id);
    saveStore(data);
  },
  
  getJobs: (): CollectionJob[] => loadStore().jobs,
  
  addJob: (job: CollectionJob): void => {
    const data = loadStore();
    data.jobs.unshift(job);
    saveStore(data);
  },
  
  getCampaigns: (): EmailCampaign[] => loadStore().campaigns,
  
  addCampaign: (campaign: EmailCampaign): void => {
    const data = loadStore();
    data.campaigns.unshift(campaign);
    saveStore(data);
  },
  
  getLogs: (): LogEntry[] => loadStore().logs,
  
  addLog: (log: LogEntry): void => {
    const data = loadStore();
    data.logs.unshift(log);
    saveStore(data);
  },
  
  getWeights: (): ScoringWeights => loadStore().weights,
  
  updateWeights: (weights: ScoringWeights): void => {
    const data = loadStore();
    data.weights = weights;
    saveStore(data);
  },
  
  resetData: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    loadStore();
  },
};
