import React, { useState } from 'react';
import { 
  Calendar, 
  Store, 
  LogOut, 
  User, 
  ChevronDown,
  Sun,
  Moon,
  Menu
} from 'lucide-react';
import { STORE_INFO } from '../data/storeData';

const Header = ({ setMobileOpen, theme, toggleTheme }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="header-navbar">
      <div className="header-left-pane">
        {/* Mobile Drawer Hamburger Toggle Button */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-title-block">
          <h2 className="header-main-title">Store Manager Dashboard</h2>
          <div className="header-meta-row">
            {/* Store Name Pill Badge */}
            <span className="header-meta-badge store-badge">
              <Store size={13} />
              <span>{STORE_INFO.name}</span>
            </span>

            {/* Live Date Pill Badge */}
            <span className="header-meta-badge date-badge">
              <Calendar size={13} />
              <span>{STORE_INFO.formattedDate}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        {/* Day / Dark Theme Toggle Button */}
        <button 
          className="theme-toggle-btn" 
          onClick={toggleTheme}
          title={theme === 'day' ? "Switch to Dark Mode (Bronze & Cream)" : "Switch to Day Mode (Black & White)"}
        >
          {theme === 'day' ? (
            <>
              <Sun size={16} />
              <span>Day Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <div 
            className="profile-dropdown-trigger"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
          >
            <div className="avatar-icon-badge">
              <User size={16} />
            </div>
            <div className="profile-text-block">
              <span className="profile-name">{STORE_INFO.managerName}</span>
              <span className="profile-role">Store Manager</span>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>

          {showProfileMenu && (
            <div className="card animate-pop-in" style={{
              position: 'absolute',
              right: 0,
              top: '48px',
              width: '210px',
              zIndex: 100,
              boxShadow: 'var(--shadow-xl)',
              padding: '0.5rem'
            }}>
              <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>{STORE_INFO.name}</strong>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{STORE_INFO.branch}</p>
              </div>
              <button 
                className="nav-item" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.55rem 0.8rem', fontSize: '0.825rem', marginTop: '0.35rem' }}
                onClick={() => alert("Store Profile")}
              >
                <User size={15} /> My Profile
              </button>
              <button 
                className="nav-item" 
                style={{ width: '100%', justifyContent: 'flex-start', padding: '0.55rem 0.8rem', fontSize: '0.825rem', color: 'var(--danger)' }}
                onClick={() => alert("Logged out successfully!")}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
