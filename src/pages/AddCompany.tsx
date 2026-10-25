import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import { Company } from '../types';
import { ArrowLeft, Save, Upload } from 'lucide-react';

export default function AddCompany() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    category: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    rating: 0,
    reviewCount: 0,
    vk: '',
    directoryUrl: '',
    contactName: '',
    comments: '',
  });
  const [importMode, setImportMode] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.name || !form.city) return;
    
    const company: Company = {
      id: `company-${Date.now()}`,
      name: form.name,
      category: form.category,
      subcategories: [],
      description: '',
      region: '',
      city: form.city,
      address: form.address,
      status: 'Действующая',
      firstSeen: new Date().toISOString().split('T')[0],
      lastChecked: new Date().toISOString().split('T')[0],
      directoryUrl: form.directoryUrl,
      sourceId: '',
      rating: form.rating,
      reviewCount: form.reviewCount,
      ratingCount: form.reviewCount,
      workingHours: '',
      dataReceivedDate: new Date().toISOString().split('T')[0],
      dataSource: 'Ручное добавление',
      phone: form.phone,
      additionalPhones: [],
      email: form.email,
      website: form.website,
      vk: form.vk,
      telegram: '',
      whatsapp: '',
      otherLinks: [],
      contactForm: '',
      contactName: form.contactName,
      websiteStatus: form.website ? 'found' : 'not_specified',
      websiteUrl: form.website,
      websiteCheckDate: new Date().toISOString().split('T')[0],
      httpStatus: null,
      websiteAvailable: false,
      hasHttps: false,
      hasMobileVersion: null,
      classificationReason: form.website ? 'Сайт указан вручную' : 'Не указан в справочнике',
      confidenceLevel: form.website ? 60 : 50,
      leadPriority: 'medium',
      selectionReason: 'Ручное добавление',
      potentialNeed: '',
      demoSiteUrl: '',
      demoSiteCreated: '',
      proposalSentDate: '',
      contactStatus: 'new',
      comments: form.comments,
      nextTask: '',
      nextActionDate: '',
      refusalReason: '',
      lastContactDate: '',
      excluded: false,
      isDuplicate: false,
      score: 0,
    };

    store.addCompany(company);
    store.addLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level: 'success',
      module: 'Компании',
      message: `Добавлена компания: ${company.name}`,
      details: `${company.city}, ${company.category}`,
    });
    navigate('/companies');
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          setImportResult('Файл пуст или содержит только заголовки');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        let imported = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
          if (values.length < 2) continue;

          const row: Record<string, string> = {};
          headers.forEach((h, idx) => { row[h] = values[idx] || ''; });

          const name = row['Название'] || row['name'] || row['Имя'] || '';
          if (!name) continue;

          const company: Company = {
            id: `company-import-${Date.now()}-${i}`,
            name: name,
            category: row['Категория'] || row['category'] || '',
            subcategories: [],
            description: '',
            region: '',
            city: row['Город'] || row['city'] || '',
            address: row['Адрес'] || row['address'] || '',
            status: 'Действующая',
            firstSeen: new Date().toISOString().split('T')[0],
            lastChecked: new Date().toISOString().split('T')[0],
            directoryUrl: row['URL'] || row['url'] || '',
            sourceId: '',
            rating: parseFloat(row['Рейтинг'] || row['rating'] || '0'),
            reviewCount: parseInt(row['Отзывы'] || row['reviews'] || '0'),
            ratingCount: parseInt(row['Отзывы'] || row['reviews'] || '0'),
            workingHours: '',
            dataReceivedDate: new Date().toISOString().split('T')[0],
            dataSource: 'Импорт CSV',
            phone: row['Телефон'] || row['phone'] || '',
            additionalPhones: [],
            email: row['Email'] || row['email'] || '',
            website: row['Сайт'] || row['website'] || '',
            vk: '',
            telegram: '',
            whatsapp: '',
            otherLinks: [],
            contactForm: '',
            contactName: '',
            websiteStatus: (row['Сайт'] || row['website']) ? 'found' : 'not_specified',
            websiteUrl: row['Сайт'] || row['website'] || '',
            websiteCheckDate: '',
            httpStatus: null,
            websiteAvailable: false,
            hasHttps: false,
            hasMobileVersion: null,
            classificationReason: 'Импортирована',
            confidenceLevel: 40,
            leadPriority: 'medium',
            selectionReason: 'Импорт',
            potentialNeed: '',
            demoSiteUrl: '',
            demoSiteCreated: '',
            proposalSentDate: '',
            contactStatus: 'new',
            comments: '',
            nextTask: '',
            nextActionDate: '',
            refusalReason: '',
            lastContactDate: '',
            excluded: false,
            isDuplicate: false,
            score: 0,
          };

          store.addCompany(company);
          imported++;
        }

        setImportResult(`Успешно импортировано: ${imported} компаний из ${lines.length - 1} строк`);
        store.addLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          level: 'success',
          module: 'Импорт',
          message: `Импортировано ${imported} компаний из CSV`,
          details: `Файл: ${file.name}`,
        });
      } catch (err) {
        setImportResult(`Ошибка обработки файла: ${err}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/companies')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Добавить компанию</h2>
          <p className="text-sm text-gray-500">Ручное добавление или импорт из файла</p>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1">
        <button
          onClick={() => setImportMode(false)}
          className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition ${!importMode ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Ручное добавление
        </button>
        <button
          onClick={() => setImportMode(true)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${importMode ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Upload className="w-4 h-4" /> Импорт CSV
        </button>
      </div>

      {!importMode ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Название компании *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="ООО «Компания»"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Категория</label>
              <input
                type="text"
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Ландшафтный дизайн"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Город *</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Краснодар"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Адрес</label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="+7 (900) 123-45-67"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="info@company.ru"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Сайт</label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="https://company.ru"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">VK</label>
              <input
                type="url"
                value={form.vk}
                onChange={e => setForm(f => ({ ...f, vk: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Рейтинг</label>
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating || ''}
                onChange={e => setForm(f => ({ ...f, rating: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Количество отзывов</label>
              <input
                type="number"
                min={0}
                value={form.reviewCount || ''}
                onChange={e => setForm(f => ({ ...f, reviewCount: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Контактное лицо</label>
              <input
                type="text"
                value={form.contactName}
                onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">URL в справочнике</label>
              <input
                type="url"
                value={form.directoryUrl}
                onChange={e => setForm(f => ({ ...f, directoryUrl: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарии</label>
              <textarea
                value={form.comments}
                onChange={e => setForm(f => ({ ...f, comments: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={!form.name || !form.city}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" /> Сохранить компанию
            </button>
            <button
              onClick={() => navigate('/companies')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Импорт из CSV</h3>
          <p className="text-sm text-gray-500 mb-4">
            Загрузите CSV-файл с данными компаний. Поддерживаются заголовки: Название, Категория, Город, Адрес, Телефон, Email, Сайт, Рейтинг, Отзывы, URL.
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">Перетащите файл или нажмите для выбора</p>
            <p className="text-xs text-gray-400 mb-4">CSV, TXT (разделитель — запятая)</p>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileImport}
              className="hidden"
              id="csv-import"
            />
            <label
              htmlFor="csv-import"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700"
            >
              <Upload className="w-4 h-4" /> Выбрать файл
            </label>
          </div>

          {importResult && (
            <div className={`mt-4 p-4 rounded-lg ${importResult.includes('Успешно') ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
              <p className="text-sm">{importResult}</p>
            </div>
          )}

          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-700 mb-2">Пример формата CSV:</p>
            <code className="text-xs text-gray-600 whitespace-pre-wrap">
{`Название,Категория,Город,Адрес,Телефон,Email,Рейтинг,Отзывы
Зелёный Мир,Ландшафтный дизайн,Краснодар,ул. Красная 1,+79001234567,info@zel.ru,4.5,120
СтройМастер,Строительство,Сочи,ул. Морская 5,+79007654321,info@stroy.ru,4.2,85`}
            </code>
          </div>
        </div>
      )}
    </div>
  );
}
