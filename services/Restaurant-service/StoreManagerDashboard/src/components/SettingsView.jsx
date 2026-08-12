import React, { useState } from 'react';
import { Settings, Save, Store, Bell, Shield, Sliders } from 'lucide-react';
import { STORE_INFO } from '../data/storeData';

const SettingsView = () => {
  const [storeName, setStoreName] = useState(STORE_INFO.name);
  const [branch, setBranch] = useState(STORE_INFO.branch);
  const [dailyTarget, setDailyTarget] = useState('40000');
  const [wastageThreshold, setWastageThreshold] = useState('15');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <Settings size={20} /> Store Settings & Configurations
          </h3>
          <p className="section-subtitle">Manage store profiles, sales targets, and wastage alerts</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* General Store Info */}
        <div className="card card-padding">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
            <Store size={18} color="var(--primary)" /> Store Profile Settings
          </h4>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Store Name
              </label>
              <input 
                type="text" 
                className="filter-select"
                style={{ width: '100%' }}
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Branch Location
              </label>
              <input 
                type="text" 
                className="filter-select"
                style={{ width: '100%' }}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Default Daily Sales Target (₹)
              </label>
              <input 
                type="number" 
                className="filter-select"
                style={{ width: '100%' }}
                value={dailyTarget}
                onChange={(e) => setDailyTarget(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Food Wastage Alert Threshold (kg)
              </label>
              <input 
                type="number" 
                className="filter-select"
                style={{ width: '100%' }}
                value={wastageThreshold}
                onChange={(e) => setWastageThreshold(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-excel" style={{ background: 'var(--primary)', marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              <Save size={16} /> Save Settings
            </button>

            {savedSuccess && (
              <span className="badge achieved" style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}>
                Settings saved successfully!
              </span>
            )}
          </form>
        </div>

        {/* Notifications & System Preferences */}
        <div className="card card-padding">
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
            <Bell size={18} color="var(--primary)" /> Alert Preferences
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
              <span>Daily Target Achievement Alert</span>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
              <span>Food Wastage High Spike Alert</span>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
              <span>Hourly Peak Traffic Summary SMS</span>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
              <span>Automated Excel EOD Report Email</span>
              <input type="checkbox" defaultChecked style={{ accentColor: 'var(--primary)', width: 18, height: 18 }} />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SettingsView;
