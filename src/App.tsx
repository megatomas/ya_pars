import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyCard from './pages/CompanyCard';
import AddCompany from './pages/AddCompany';
import SearchPage from './pages/Search';
import Tasks from './pages/Tasks';
import WebsiteCheck from './pages/WebsiteCheck';
import EmailCampaigns from './pages/EmailCampaigns';
import SettingsPage from './pages/Settings';
import Logs from './pages/Logs';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="companies" element={<Companies />} />
          <Route path="companies/new" element={<AddCompany />} />
          <Route path="companies/:id" element={<CompanyCard />} />
          <Route path="website-check" element={<WebsiteCheck />} />
          <Route path="email" element={<EmailCampaigns />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
