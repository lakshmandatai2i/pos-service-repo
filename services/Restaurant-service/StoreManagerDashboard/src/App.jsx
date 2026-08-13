import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  Settings 
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import SalesDetails from './components/SalesDetails';
import ReportsSection from './components/ReportsSection';
import AIInsights from './components/AIInsights';
import Chatbot from './components/Chatbot';
import SettingsView from './components/SettingsView';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Theme state: 'dark' (Bronze & Cream) or 'day' (Black & White)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('store_manager_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('store_manager_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'day' : 'dark'));
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content View */}
      <div className="main-content">
        <Header 
          setMobileOpen={setMobileOpen} 
          theme={theme}
          toggleTheme={toggleTheme}
        />

        <main className="dashboard-body">
          {activeTab === 'dashboard' && (
            <>
              <KPICards />
            </>
          )}

          {activeTab === 'sales' && (
            <>
              <SalesDetails />
            </>
          )}

          {activeTab === 'reports' && (
            <>
              <ReportsSection />
            </>
          )}

          {activeTab === 'ai-insights' && (
            <>
              <AIInsights />
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <SettingsView />
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar for easy 1-tap tab shifting */}
      <nav className="mobile-bottom-nav">
        <button 
          className={`mobile-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <TrendingUp size={20} />
          <span>Analytics</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FileText size={20} />
          <span>Reports</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'ai-insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai-insights')}
        >
          <Sparkles size={20} />
          <span>AI Insights</span>
        </button>
        <button 
          className={`mobile-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          <span>Settings</span>
        </button>
      </nav>

      {/* Floating AI Chatbot Assistant */}
      <Chatbot />
    </div>
  );
}

export default App;
