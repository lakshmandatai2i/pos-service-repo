import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  UserCheck, 
  KeyRound, 
  ShieldCheck, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { STORE_INFO } from '../data/storeData';

const SettingsView = () => {
  // Username Change State
  const [currentUsername, setCurrentUsername] = useState(STORE_INFO.managerName);
  const [newUsername, setNewUsername] = useState('');
  const [confirmUsername, setConfirmUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState(null);

  // Password Reset Token State
  const [validityDuration, setValidityDuration] = useState('15');
  const [tokenReason, setTokenReason] = useState('Routine Credential Update');
  const [generatedToken, setGeneratedToken] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [tokensHistory, setTokensHistory] = useState([
    {
      id: 'RST-2026-89A4',
      requestedBy: STORE_INFO.managerName,
      createdTime: '10-Aug-2026, 02:30 PM',
      expiry: '15 Mins',
      status: 'Expired'
    }
  ]);

  // Handle Username Change
  const handleUsernameChange = (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setUsernameMessage({ type: 'error', text: 'Please enter a valid new username.' });
      return;
    }
    if (newUsername.trim() !== confirmUsername.trim()) {
      setUsernameMessage({ type: 'error', text: 'New username and confirm username do not match.' });
      return;
    }

    setCurrentUsername(newUsername.trim());
    STORE_INFO.managerName = newUsername.trim();
    setUsernameMessage({ type: 'success', text: `Username successfully updated to "${newUsername.trim()}"!` });
    setNewUsername('');
    setConfirmUsername('');

    setTimeout(() => setUsernameMessage(null), 4000);
  };

  // Generate Password Reset Token
  const handleGenerateToken = (e) => {
    e.preventDefault();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const randomHex2 = Math.random().toString(36).substring(2, 6).toUpperCase();
    const newTokenId = `RST-2026-${randomHex}-${randomHex2}`;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTokenObj = {
      id: newTokenId,
      requestedBy: currentUsername,
      createdTime: `Today, ${timeFormatted}`,
      expiry: `${validityDuration} Mins`,
      reason: tokenReason,
      status: 'Active'
    };

    setGeneratedToken(newTokenObj);
    setTokensHistory(prev => [newTokenObj, ...prev]);
    setIsCopied(false);
  };

  // Copy Token
  const handleCopyToken = (tokenText) => {
    navigator.clipboard.writeText(tokenText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <section>
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <Settings size={20} /> Account Settings & Password Reset Tokens
          </h3>
          <p className="section-subtitle">Manage store manager username credentials & raise password reset tokens</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        
        {/* 1. USERNAME CHANGE SECTION */}
        <div className="card card-padding">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div className="kpi-icon-wrapper" style={{ width: 38, height: 38 }}>
              <User size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Username Settings</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Update your Store Manager account handle</p>
            </div>
          </div>

          <form onSubmit={handleUsernameChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Current Username
              </label>
              <div style={{ padding: '0.65rem 0.85rem', background: 'var(--input-bg)', borderRadius: 10, border: '1px solid var(--border-color)', fontWeight: 600, color: 'var(--primary)' }}>
                {currentUsername}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                New Username
              </label>
              <input 
                type="text" 
                className="filter-select"
                style={{ width: '100%' }}
                placeholder="Enter new username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Confirm New Username
              </label>
              <input 
                type="text" 
                className="filter-select"
                style={{ width: '100%' }}
                placeholder="Confirm new username"
                value={confirmUsername}
                onChange={(e) => setConfirmUsername(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-excel" style={{ background: 'var(--primary-gradient)', marginTop: '0.5rem', alignSelf: 'flex-start' }}>
              <UserCheck size={16} /> Update Username
            </button>

            {usernameMessage && (
              <div className={`badge ${usernameMessage.type === 'success' ? 'achieved' : 'not-achieved'}`} style={{ padding: '0.5rem 0.8rem', marginTop: '0.5rem', alignSelf: 'flex-start' }}>
                {usernameMessage.type === 'error' && <AlertCircle size={14} />}
                <span>{usernameMessage.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* 2. PASSWORD RESET TOKEN GENERATION SECTION */}
        <div className="card card-padding">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <div className="kpi-icon-wrapper" style={{ width: 38, height: 38 }}>
              <KeyRound size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Password Reset Token Generator</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Raise a secure one-time token to reset manager password</p>
            </div>
          </div>

          <form onSubmit={handleGenerateToken} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Token Expiry Duration
              </label>
              <select 
                className="filter-select" 
                style={{ width: '100%' }}
                value={validityDuration}
                onChange={(e) => setValidityDuration(e.target.value)}
              >
                <option value="15">15 Minutes (Recommended)</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="1440">24 Hours</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Request Reason / Security Note
              </label>
              <input 
                type="text" 
                className="filter-select"
                style={{ width: '100%' }}
                placeholder="e.g. Password Reset Request"
                value={tokenReason}
                onChange={(e) => setTokenReason(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-excel" style={{ background: 'var(--primary-gradient)', marginTop: '0.5rem' }}>
              <ShieldCheck size={16} /> Raise Password Reset Token
            </button>
          </form>

          {/* ACTIVE GENERATED TOKEN DISPLAY BOX */}
          {generatedToken && (
            <div style={{ marginTop: '1.25rem', padding: '1rem', background: 'var(--primary-light)', border: '1px solid var(--border-color)', borderRadius: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, uppercase: true, color: 'var(--text-muted)' }}>
                  RAISED RESET TOKEN
                </span>
                <span className="badge achieved" style={{ fontSize: '0.7rem' }}>
                  <Clock size={12} /> Active ({generatedToken.expiry})
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--input-bg)', padding: '0.6rem 0.85rem', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                <code style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.08em', flex: 1, fontFamily: 'Geist, monospace' }}>
                  {generatedToken.id}
                </code>
                <button 
                  onClick={() => handleCopyToken(generatedToken.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  {isCopied ? <Check size={16} color="var(--success-text)" /> : <Copy size={16} />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', marginBottom: 0 }}>
                Use this token on the login/reset portal to authorize your new password.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. TOKENS AUDIT LOG TABLE */}
      <div className="card card-padding" style={{ marginTop: '1.75rem' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '1.05rem' }}>
          <Clock size={18} color="var(--primary)" /> Raised Password Reset Tokens Log
        </h4>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Token Identifier</th>
                <th>Requested By</th>
                <th>Created Time</th>
                <th>Validity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokensHistory.map((t, idx) => (
                <tr key={idx}>
                  <td style={{ fontFamily: 'Geist, monospace', fontWeight: 700, color: 'var(--primary)' }}>
                    {t.id}
                  </td>
                  <td>{t.requestedBy}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>{t.createdTime}</td>
                  <td>{t.expiry}</td>
                  <td>
                    <span className={`badge ${t.status === 'Active' ? 'achieved' : 'not-achieved'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="tab-btn" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', background: 'var(--input-bg)', border: '1px solid var(--border-color)', borderRadius: 6 }}
                      onClick={() => handleCopyToken(t.id)}
                    >
                      <Copy size={13} /> Copy Token
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default SettingsView;
