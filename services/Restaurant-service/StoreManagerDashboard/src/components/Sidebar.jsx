import React from 'react';
import { 
  LayoutDashboard, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Store,
  Settings
} from 'lucide-react';
import { STORE_INFO } from '../data/storeData';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed, mobileOpen, setMobileOpen }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Today\'s Sales', icon: TrendingUp },
    { id: 'reports', label: 'Order History & Reports', icon: FileText },
    { id: 'ai-insights', label: 'AI Insights', icon: Sparkles },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Store size={22} />
          </div>
          {!isCollapsed && <span>StoreManager</span>}
        </div>
        <button 
          className="sidebar-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="manager-mini-card">
          <img 
            src={STORE_INFO.avatar} 
            alt={STORE_INFO.managerName}
            className="manager-avatar" 
          />
          {!isCollapsed && (
            <div className="manager-info">
              <span className="manager-name">{STORE_INFO.managerName}</span>
              <span className="manager-role">{STORE_INFO.role}</span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button 
            className="nav-item" 
            style={{ marginTop: '0.75rem', width: '100%', border: 'none', background: 'transparent' }}
            onClick={() => alert("Logged out successfully!")}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
