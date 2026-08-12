import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Store, 
  LogOut, 
  User, 
  ChevronDown,
  Sun,
  Moon
} from 'lucide-react';
import { STORE_INFO } from '../data/storeData';

const Header = ({ setMobileOpen, onSearchChange, theme, toggleTheme }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="header-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div className="header-welcome">
          <h2>Good Morning, Store Manager 👋</h2>
          <p>
            <Store size={15} style={{ color: 'var(--primary)' }} />
            <strong style={{ color: 'var(--text-main)' }}>{STORE_INFO.name}</strong>
            <span style={{ color: 'var(--text-light)' }}>|</span>
            <Calendar size={14} />
            <span>{STORE_INFO.formattedDate}</span>
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Day / Dark Theme Toggle */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === 'day' ? "Switch to Dark Mode (Bronze & Cream)" : "Switch to Day Mode (Black & White)"}
        >
          {theme === 'day' ? (
            <>
              <Sun size={17} />
              <span>Day Mode</span>
            </>
          ) : (
            <>
              <Moon size={17} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Global Search */}
        <div className="search-box" style={{ display: 'none' }}>
          <Search size={16} />
          <input 
            type="text" 
            placeholder="Search orders, items, reports..." 
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          />
        </div>

        {/* Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            className="profile-dropdown-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <img 
              src={STORE_INFO.avatar} 
              alt={STORE_INFO.managerName}
              style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.2 }}>
                {STORE_INFO.managerName}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Store Manager</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {showProfileMenu && (
            <div className="card" style={{
              position: 'absolute',
              right: 0,
              top: '50px',
              width: '200px',
              zIndex: 100,
              boxShadow: 'var(--shadow-xl)',
              padding: '0.5rem'
            }}>
              <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>{STORE_INFO.name}</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{STORE_INFO.branch}</p>
              </div>
              <button className="tab-btn" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem', fontSize: '0.85rem' }}>
                <User size={16} /> My Profile
              </button>
              <button 
                className="tab-btn" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.6rem 0.8rem', fontSize: '0.85rem', color: 'var(--danger)' }}
                onClick={() => alert("Logged out")}
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
