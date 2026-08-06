import React, { useState, useCallback } from 'react';
import {
  MOCK_TABLES, MOCK_NOTIFS,
  type RestaurantTable, type POSNotif, type TableStatus, type ActiveView, type TableOrder
} from './data';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso?: string): string {
  if (!iso) return '0m';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

function calcSubtotal(orders: TableOrder[]): number {
  return orders.reduce((s, o) => s + o.price * o.qty, 0);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveView>('tables');
  const [tables, setTables] = useState<RestaurantTable[]>(MOCK_TABLES);
  const [notifs, setNotifs] = useState<POSNotif[]>(MOCK_NOTIFS);
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TableStatus | 'all'>('all');

  const unreadNotifs = notifs.filter(n => !n.isRead).length;

  // Filtered tables
  const filteredTables = tables.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = t.number.toString().includes(searchQuery) ||
      t.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Active metrics
  const occupiedCount = tables.filter(t => t.status === 'occupied' || t.status === 'preparing' || t.status === 'ready' || t.status === 'prepared').length;
  const kitchenCount  = tables.filter(t => t.status === 'preparing').length;
  const readyCount    = tables.filter(t => t.status === 'ready').length;

  // Handlers
  const handleUpdateQty = useCallback((tableId: number, itemId: number, delta: number) => {
    setTables(prev => prev.map(t => {
      if (t.id !== tableId) return t;
      const updatedOrders = t.orders
        .map(o => o.id === itemId ? { ...o, qty: o.qty + delta } : o)
        .filter(o => o.qty > 0);
      return { ...t, orders: updatedOrders };
    }));
    setSelectedTable(prev => {
      if (!prev || prev.id !== tableId) return prev;
      const updatedOrders = prev.orders
        .map(o => o.id === itemId ? { ...o, qty: o.qty + delta } : o)
        .filter(o => o.qty > 0);
      return { ...prev, orders: updatedOrders };
    });
  }, []);

  const handleStatusChange = useCallback((tableId: number, nextStatus: TableStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: nextStatus } : t));
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  }, [selectedTable]);

  return (
    <div className={`min-h-screen flex font-body selection:bg-[#f2c35b]/30 selection:text-[#f2c35b] ${isDark ? 'dark bg-[#1a1209] text-[#f1dfd0]' : 'bg-[#f7f4ed] text-[#2a1b0e]'}`}>

      {/* ════════════════════════════════════════════════════════════════════════
          SIDEBAR NAVIGATION
      ════════════════════════════════════════════════════════════════════════ */}
      <nav className={`hidden md:flex flex-col h-screen fixed left-0 top-0 p-6 border-r shadow-2xl w-[280px] z-50 transition-colors ${
        isDark ? 'bg-[#231a11] border-white/5' : 'bg-white border-stone-200'
      }`}>
        {/* Brand & Profile */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#f2c35b]/30 shrink-0 bg-[#32281e] flex items-center justify-center text-[#f2c35b] font-bold font-headline text-lg">
            SG
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold text-[#f2c35b] m-0 leading-tight">Spice Garden</h1>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>Floor Manager</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-2 flex-grow">
          {/* Tables */}
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === 'tables'
                ? 'bg-[#d4a843] text-[#261a00] shadow-md'
                : isDark ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
            <span>Tables</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm ${
              activeTab === 'notifications'
                ? 'bg-[#d4a843] text-[#261a00] font-bold shadow-md'
                : isDark ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">notifications</span>
              <span>Notifications</span>
            </div>
            {unreadNotifs > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full font-bold bg-[#93000a] text-white">
                {unreadNotifs}
              </span>
            )}
          </button>

          {/* Kitchen */}
          <button
            onClick={() => setActiveTab('kitchen')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              activeTab === 'kitchen'
                ? 'bg-[#d4a843] text-[#261a00] font-bold shadow-md'
                : isDark ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined">restaurant</span>
            <span>Kitchen</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${
              activeTab === 'settings'
                ? 'bg-[#d4a843] text-[#261a00] font-bold shadow-md'
                : isDark ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </div>

        {/* CTA */}
        <button
          onClick={() => {
            const freeTable = tables.find(t => t.status === 'available') || tables[0];
            setSelectedTable(freeTable);
          }}
          className="mt-auto w-full py-3.5 px-4 bg-[#f2c35b] text-[#402d00] font-headline font-bold rounded-xl hover:bg-[#eec058] transition-colors shadow-[0_4px_14px_0_rgba(242,195,91,0.25)] flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">add_circle</span>
          <span>Quick Order</span>
        </button>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════════
          MAIN CANVAS
      ════════════════════════════════════════════════════════════════════════ */}
      <main className="flex-grow w-full md:ml-[280px] p-4 sm:p-6 md:p-10 min-h-screen relative overflow-y-auto">

        {/* ── HEADER SECTION ────────────────────────────────────────────── */}
        <header className="flex justify-between items-end mb-8 pb-4 border-b border-white/5">
          <div>
            <h2 className={`font-headline text-2xl md:text-3xl font-bold tracking-tight ${isDark ? 'text-[#f1dfd0]' : 'text-stone-900'}`}>
              {activeTab === 'tables' && 'Restaurant Tables'}
              {activeTab === 'notifications' && 'Notifications'}
              {activeTab === 'kitchen' && 'Kitchen Dashboard'}
              {activeTab === 'settings' && 'Settings'}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>
              {activeTab === 'tables' && 'Main Dining Floor & Patio'}
              {activeTab === 'notifications' && 'Real-time Kitchen & Table Alerts'}
              {activeTab === 'kitchen' && 'Live Kitchen Display System (KDS)'}
              {activeTab === 'settings' && 'POS & Floor Preferences'}
            </p>
          </div>

          {/* Theme Toggle Pill */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center rounded-full p-1 border ${isDark ? 'bg-[#32281e] border-white/5' : 'bg-stone-200 border-stone-300'}`}>
              <button
                onClick={() => setIsDark(false)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  !isDark ? 'bg-white text-[#f2c35b] shadow-md' : 'text-[#d2c5b1] hover:text-[#f2c35b]'
                }`}
                title="Day Light Mode"
              >
                <span className="material-symbols-outlined text-[20px]">light_mode</span>
              </button>
              <button
                onClick={() => setIsDark(true)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isDark ? 'bg-[#3d3328] text-[#f2c35b] shadow-inner' : 'text-stone-400 hover:text-stone-700'
                }`}
                title="Night Dark Mode"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>dark_mode</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── TABLES VIEW ──────────────────────────────────────────────── */}
        {activeTab === 'tables' && (
          <>
            {/* Stats Row */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Stat 1: Occupied */}
              <div className={`glass-panel stat-card-gradient rounded-2xl p-6 relative overflow-hidden group border transition-all ${
                isDark ? 'border-white/5' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>
                      Occupied Tables
                    </p>
                    <h3 className={`font-headline text-4xl font-bold m-0 ${isDark ? 'text-[#f1dfd0]' : 'text-stone-900'}`}>
                      {occupiedCount}<span className={`text-xl font-normal ${isDark ? 'text-[#d2c5b1]' : 'text-stone-400'}`}>/{tables.length}</span>
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#f2c35b]/10 flex items-center justify-center text-[#f2c35b] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">groups</span>
                  </div>
                </div>
                <div className="w-full bg-[#3d3328]/50 rounded-full h-2 mt-4">
                  <div className="bg-[#f2c35b] h-2 rounded-full transition-all duration-500" style={{ width: `${Math.round((occupiedCount / tables.length) * 100)}%` }} />
                </div>
              </div>

              {/* Stat 2: In Kitchen */}
              <div className={`glass-panel stat-card-gradient rounded-2xl p-6 relative overflow-hidden group border transition-all ${
                isDark ? 'border-white/5' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>
                      In Kitchen
                    </p>
                    <h3 className={`font-headline text-4xl font-bold m-0 ${isDark ? 'text-[#f1dfd0]' : 'text-stone-900'}`}>
                      {kitchenCount}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#c3aa95]/10 flex items-center justify-center text-[#e0c5af] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">soup_kitchen</span>
                  </div>
                </div>
                <p className="text-xs text-[#f2c35b] font-semibold flex items-center gap-1 mt-4">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> Active orders firing
                </p>
              </div>

              {/* Stat 3: Ready to Serve */}
              <div className={`glass-panel stat-card-gradient rounded-2xl p-6 relative overflow-hidden group border transition-all ${
                isDark ? 'border-white/5' : 'border-stone-200 bg-white'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>
                      Ready to Serve
                    </p>
                    <h3 className="font-headline text-4xl font-bold text-[#f2c35b] text-glow m-0">
                      {readyCount}
                    </h3>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-[#f2c35b]/10 flex items-center justify-center text-[#f2c35b] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">room_service</span>
                  </div>
                </div>
                <p className={`text-xs flex items-center gap-1 mt-4 ${readyCount > 0 ? 'text-[#f2c35b] font-bold animate-pulse' : isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>
                  {readyCount > 0 ? 'Action required — Serve now' : 'All clear'}
                </p>
              </div>
            </section>

            {/* Filters & Search Bar */}
            <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div className={`flex gap-2 p-1.5 rounded-xl border overflow-x-auto w-full md:w-auto ${
                isDark ? 'bg-[#231a11] border-white/5' : 'bg-stone-200 border-stone-300'
              }`}>
                {(['all', 'available', 'occupied', 'preparing', 'ready', 'bussing'] as const).map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      statusFilter === st
                        ? 'bg-[#d4a843] text-[#261a00] shadow-sm'
                        : isDark ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {st === 'all' && 'All Tables'}
                    {st === 'available' && 'Available'}
                    {st === 'occupied' && 'Occupied'}
                    {st === 'preparing' && <>Preparing <span className="w-2 h-2 rounded-full bg-[#e0c5af]" /></>}
                    {st === 'ready' && 'Ready'}
                    {st === 'bussing' && 'Bussing'}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <span className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] ${
                  isDark ? 'text-[#d2c5b1]' : 'text-stone-400'
                }`}>search</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search table or section..."
                  className={`w-full border rounded-xl text-sm py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#f2c35b] transition-colors ${
                    isDark ? 'bg-[#231a11] border-white/10 text-[#f1dfd0] placeholder-[#d2c5b1]/50' : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400'
                  }`}
                />
              </div>
            </section>

            {/* Tables Grid */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-24 md:pb-0">
              {filteredTables.map(t => {
                const subtotal = calcSubtotal(t.orders);
                const isActive = t.status !== 'available' && t.status !== 'bussing' && t.status !== 'closed';

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTable(t)}
                    className={`rounded-2xl p-5 flex flex-col justify-between h-52 transition-all cursor-pointer relative overflow-hidden group shadow-md ${
                      t.status === 'preparing'
                        ? 'bg-[#231a11] border-2 border-[#f2c35b]/40 animate-pulse-amber hover:border-[#f2c35b]'
                        : t.status === 'ready'
                        ? 'glass-panel border-l-4 border-l-[#f2c35b] hover:bg-white/5'
                        : t.status === 'occupied'
                        ? 'bg-[#c3aa95]/10 border border-transparent hover:border-[#e0c5af]/30'
                        : t.status === 'bussing'
                        ? 'bg-[#140d05] border border-white/5 opacity-75'
                        : 'bg-transparent border border-[#f2c35b]/30 hover:bg-white/5'
                    }`}
                  >
                    {/* Top Row */}
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-headline text-lg font-bold ${
                          t.status === 'ready'
                            ? 'bg-[#f2c35b]/20 text-[#f2c35b] text-glow'
                            : isDark ? 'bg-[#271e14] text-[#f1dfd0]' : 'bg-stone-100 text-stone-800'
                        }`}>
                          T{t.number}
                        </div>
                        <div>
                          <p className={`text-xs font-bold uppercase ${
                            t.status === 'preparing' ? 'text-[#f2c35b]' : t.status === 'ready' ? 'text-[#f2c35b]' : 'text-[#d2c5b1]'
                          }`}>
                            {t.status}
                          </p>
                          <p className="text-sm text-[#f1dfd0]">{t.capacity} Guests</p>
                        </div>
                      </div>

                      {/* Icon */}
                      {t.status === 'preparing' && <span className="material-symbols-outlined text-[#f2c35b]">soup_kitchen</span>}
                      {t.status === 'occupied' && <span className="material-symbols-outlined text-[#e0c5af]">restaurant</span>}
                      {t.status === 'ready' && (
                        <div className="bg-[#f2c35b] text-[#402d00] rounded-full w-8 h-8 flex items-center justify-center shadow-[0_0_10px_rgba(242,195,91,0.5)]">
                          <span className="material-symbols-outlined text-[18px]">notifications_active</span>
                        </div>
                      )}
                      {t.status === 'bussing' && <span className="material-symbols-outlined text-[#d2c5b1]/50">cleaning_services</span>}
                      {t.status === 'available' && <span className="material-symbols-outlined text-[#d2c5b1] opacity-50">check_circle</span>}
                    </div>

                    {/* Bottom Row */}
                    {isActive ? (
                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <p className="text-xs text-[#d2c5b1] mb-0.5">Current Bill</p>
                          <p className="font-headline text-xl font-bold text-[#f1dfd0]">₹{subtotal.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-[#231a11] px-2.5 py-1 rounded-lg border border-white/5 text-xs text-[#d2c5b1]">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{timeAgo(t.startedAt)}</span>
                        </div>
                      </div>
                    ) : t.status === 'available' ? (
                      <div className="flex justify-center mt-auto">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedTable(t); }}
                          className="text-xs font-bold text-[#f2c35b] bg-transparent border border-[#f2c35b]/50 px-4 py-2 rounded-lg hover:bg-[#f2c35b]/10 transition-colors"
                        >
                          Seat Guests
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-end mt-auto text-xs text-[#d2c5b1]/70">
                        <span>Pending Clear</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(t.id, 'available'); }}
                          className="underline hover:text-[#f2c35b]"
                        >
                          Mark Clean
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </>
        )}

        {/* ── NOTIFICATIONS VIEW ────────────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#d2c5b1]">{unreadNotifs} unread alert{unreadNotifs !== 1 ? 's' : ''}</p>
              {unreadNotifs > 0 && (
                <button
                  onClick={() => setNotifs(prev => prev.map(n => ({ ...n, isRead: true })))}
                  className="text-sm font-bold text-[#f2c35b] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="bg-[#231a11] border border-white/5 rounded-2xl p-3 space-y-2">
              {notifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))}
                  className={`p-4 rounded-xl flex items-start gap-4 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-[#32281e]' : 'bg-[#1a1209]/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#f2c35b]/10 text-[#f2c35b] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">notifications</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${n.isRead ? 'text-[#d2c5b1]' : 'text-[#f1dfd0] font-bold'}`}>{n.message}</p>
                    {n.detail && <p className="text-xs text-[#d2c5b1]/80 mt-1">{n.detail}</p>}
                    <p className="text-[11px] text-[#d2c5b1]/50 mt-1">{timeAgo(n.createdAt)} ago</p>
                  </div>
                  {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-[#f2c35b] shrink-0 mt-2" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── KITCHEN DASHBOARD VIEW ────────────────────────────────────── */}
        {activeTab === 'kitchen' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(['occupied', 'preparing', 'ready'] as TableStatus[]).map(st => {
              const columnTables = tables.filter(t => t.status === st);
              const columnTitle = st === 'occupied' ? 'New Orders' : st === 'preparing' ? 'Preparing' : 'Ready to Serve';
              const columnHeaderColor = st === 'occupied' ? 'text-[#d2c5b1]' : st === 'preparing' ? 'text-[#f2c35b]' : 'text-[#ffe2ab]';

              return (
                <div key={st} className="bg-[#231a11] border border-white/5 rounded-2xl p-5 flex flex-col h-[75vh]">
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/5">
                    <h3 className={`font-headline text-base font-bold ${columnHeaderColor}`}>
                      {columnTitle}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#32281e] text-[#d2c5b1]">
                      {columnTables.length}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 receipt-scroll">
                    {columnTables.map(t => (
                      <div key={t.id} className="bg-[#271e14] border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                          <span className="font-headline font-bold text-lg text-[#f1dfd0]">Table {t.number}</span>
                          <span className="text-xs text-[#d2c5b1] font-mono">{t.ticketNo || '#0000'}</span>
                        </div>

                        {/* Order Items */}
                        <div className="font-receipt text-xs space-y-1.5 text-[#d2c5b1]">
                          {t.orders.map(o => (
                            <div key={o.id} className="flex justify-between">
                              <span>{o.qty}× {o.itemName}</span>
                              <span>₹{o.price * o.qty}</span>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2">
                          {st === 'occupied' && (
                            <button
                              onClick={() => handleStatusChange(t.id, 'preparing')}
                              className="w-full py-2 rounded-lg bg-[#f2c35b] text-[#402d00] font-bold text-xs hover:bg-[#eec058] transition-colors"
                            >
                              Start Cooking
                            </button>
                          )}
                          {st === 'preparing' && (
                            <button
                              onClick={() => handleStatusChange(t.id, 'ready')}
                              className="w-full py-2 rounded-lg bg-[#f2c35b] text-[#402d00] font-bold text-xs hover:bg-[#eec058] transition-colors"
                            >
                              Mark Ready
                            </button>
                          )}
                          {st === 'ready' && (
                            <button
                              onClick={() => handleStatusChange(t.id, 'available')}
                              className="w-full py-2 rounded-lg bg-[#ffe2ab] text-[#402d00] font-bold text-xs hover:bg-[#ffdfa0] transition-colors"
                            >
                              Serve & Close
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {columnTables.length === 0 && (
                      <p className="text-center text-xs text-[#d2c5b1]/50 py-12">No orders in this column</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── SETTINGS VIEW ────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="max-w-xl mx-auto bg-[#231a11] border border-white/5 rounded-2xl p-6 space-y-6">
            <h3 className="font-headline text-lg font-bold text-[#f1dfd0]">Floor & System Settings</h3>
            <div className="space-y-4 text-sm text-[#d2c5b1]">
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Auto-refresh Kitchen Display (KDS)</span>
                <span className="font-bold text-[#f2c35b]">Enabled (5s)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Default Tax Rate (GST)</span>
                <span className="font-bold text-[#f2c35b]">5%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span>Service Charge Rate</span>
                <span className="font-bold text-[#f2c35b]">10%</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Sound Alerts on Ready Orders</span>
                <span className="font-bold text-[#f2c35b]">Enabled</span>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          TWO-COLUMN TABLE ORDER MODAL (Matching User's HTML Template)
      ════════════════════════════════════════════════════════════════════════ */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-[#1a1209]/80 backdrop-blur-xl animate-[popIn_0.25s_ease-out]">
          <div className={`glass-panel w-full max-w-6xl h-[88vh] rounded-2xl shadow-[0_40px_40px_-15px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden border ${
            isDark ? 'border-white/5 bg-[#2a231b]/90' : 'border-stone-300 bg-white/95'
          }`}>

            {/* Modal Header */}
            <header className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-[#32281e]/50 flex-shrink-0">
              <div className="flex items-center gap-6">
                <h2 className="font-headline text-2xl font-bold text-[#f2c35b]">Table {selectedTable.number} Order</h2>
                <div className="flex gap-3">
                  <div className="flex items-center gap-2 bg-[#3d3328]/50 px-3.5 py-1.5 rounded-full border border-white/5 text-xs text-[#d2c5b1]">
                    <span className="material-symbols-outlined text-[#eec058] text-[18px]">group</span>
                    <span>{selectedTable.capacity} Guests</span>
                  </div>
                  <div className="flex items-center gap-2 bg-[#c3aa95]/20 px-3.5 py-1.5 rounded-full border border-[#e0c5af]/30 text-xs text-[#e0c5af]">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span>Occupied for {timeAgo(selectedTable.startedAt)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedTable(null)}
                className="text-[#d2c5b1] hover:text-[#f2c35b] transition-colors p-2 rounded-full hover:bg-white/5"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </header>

            {/* Modal Body: Two Columns */}
            <div className="flex-1 flex overflow-hidden flex-col md:flex-row">

              {/* LEFT COLUMN: Receipt View */}
              <div className="w-full md:w-1/2 border-r border-white/5 flex flex-col bg-[#140d05]/30">
                <div className="px-8 py-3.5 border-b border-white/5 flex justify-between items-center bg-[#271e14]/50 text-xs font-semibold text-[#d2c5b1] uppercase">
                  <span>Current Order</span>
                  <span>Ticket {selectedTable.ticketNo || '#8942'}</span>
                </div>

                <div className="flex-1 overflow-y-auto receipt-scroll p-8 font-receipt text-sm">
                  <div className="space-y-6">
                    {selectedTable.orders.map(item => (
                      <div key={item.id} className={`flex justify-between items-start group rounded-lg p-2 transition-all ${
                        item.isNew ? 'bg-[#f2c35b]/10 border border-[#f2c35b]/20' : ''
                      }`}>
                        <div className="flex-1">
                          <div className="flex justify-between text-[#f1dfd0] mb-1 font-semibold">
                            <span className="text-base">{item.itemName}</span>
                            <span className="text-base font-bold text-[#f2c35b]">₹{item.price * item.qty}</span>
                          </div>
                          <div className="text-[#d2c5b1] text-xs flex gap-3 items-center">
                            <span>Qty: {item.qty} @ ₹{item.price}</span>
                            {item.note && <span className="text-[#e0c5af] italic">- {item.note}</span>}
                            {item.isNew && <span className="bg-[#f2c35b]/20 text-[#f2c35b] px-2 py-0.5 rounded-full text-[10px] font-bold">New</span>}
                          </div>
                        </div>

                        {/* Inline Qty Controls */}
                        <div className="ml-4 flex items-center gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-[#271e14] rounded-lg p-1 border border-white/5">
                          <button
                            onClick={() => handleUpdateQty(selectedTable.id, item.id, -1)}
                            className="p-1 hover:text-[#f2c35b] text-[#d2c5b1]"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="font-bold w-4 text-center text-xs">{item.qty}</span>
                          <button
                            onClick={() => handleUpdateQty(selectedTable.id, item.id, 1)}
                            className="p-1 hover:text-[#f2c35b] text-[#d2c5b1]"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    ))}

                    {selectedTable.orders.length === 0 && (
                      <p className="text-center text-xs text-[#d2c5b1]/50 py-12">No items added to this order yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Actions & Billing */}
              <div className="w-full md:w-1/2 flex flex-col bg-[#231a11]">

                {/* Quick Actions Grid (2x2) */}
                <div className="p-6 md:p-8 grid grid-cols-2 gap-4 border-b border-white/5">
                  <button className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b]">
                    <span className="material-symbols-outlined text-[28px]">restaurant_menu</span>
                    <span className="text-xs font-bold">Add Item</span>
                  </button>

                  <button className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b]">
                    <span className="material-symbols-outlined text-[28px]">person_add</span>
                    <span className="text-xs font-bold">Edit Guests</span>
                  </button>

                  <button className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b]">
                    <span className="material-symbols-outlined text-[28px]">high_res</span>
                    <span className="text-xs font-bold">Apply Discount</span>
                  </button>

                  <button className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex flex-col items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b]">
                    <span className="material-symbols-outlined text-[28px]">split_scene</span>
                    <span className="text-xs font-bold">Split Bill</span>
                  </button>
                </div>

                {/* Billing Summary */}
                {(() => {
                  const subtotal = calcSubtotal(selectedTable.orders);
                  const gst = subtotal * 0.05;
                  const serviceCharge = subtotal * 0.10;
                  const grandTotal = Math.round(subtotal + gst + serviceCharge);

                  return (
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-end bg-[radial-gradient(circle_at_top_right,rgba(242,195,91,0.08),transparent_60%)]">
                      <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center text-sm text-[#d2c5b1]">
                          <span>Subtotal</span>
                          <span className="font-semibold text-[#f1dfd0]">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#d2c5b1]">
                          <span>GST (5%)</span>
                          <span>₹{gst.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[#d2c5b1]">
                          <span>Service Charge (10%)</span>
                          <span>₹{serviceCharge.toFixed(2)}</span>
                        </div>
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                          <span className="font-headline text-lg font-bold text-[#f1dfd0]">Grand Total</span>
                          <span className="font-headline text-2xl font-bold text-[#f2c35b]">₹{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Footer Action Buttons */}
                      <div className="flex gap-3">
                        <button className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs border border-[#f2c35b] text-[#f2c35b] hover:bg-[#f2c35b]/10 transition-colors flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">print</span>
                          <span>Print Receipt</span>
                        </button>
                        <button className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs text-[#f1dfd0] border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          <span>Send to Kitchen</span>
                        </button>
                      </div>

                      <div className="mt-3">
                        <button className="w-full py-4 rounded-xl bg-[#f2c35b] text-[#402d00] font-headline font-bold text-base shadow-[0_0_20px_rgba(242,195,91,0.3)] hover:shadow-[0_0_30px_rgba(242,195,91,0.5)] hover:bg-[#ffdf9f] transition-all flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined">point_of_sale</span>
                          <span>Checkout &amp; Pay</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (md:hidden)
      ════════════════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#1a1209]/95 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_20px_rgba(0,0,0,0.4)] z-50 flex justify-around items-center px-4 py-2.5">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'tables' ? 'text-[#f2c35b]' : 'text-[#d2c5b1]'}`}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'tables' ? "'FILL' 1" : "'FILL' 0" }}>grid_view</span>
          <span className="text-[10px] font-bold">Tables</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'notifications' ? 'text-[#f2c35b]' : 'text-[#d2c5b1]'}`}
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-[10px] font-bold">Alerts</span>
        </button>

        <div className="relative -top-5">
          <button
            onClick={() => {
              const freeTable = tables.find(t => t.status === 'available') || tables[0];
              setSelectedTable(freeTable);
            }}
            className="w-14 h-14 rounded-full bg-[#f2c35b] text-[#402d00] flex items-center justify-center shadow-[0_8px_16px_rgba(242,195,91,0.3)] hover:scale-105 transition-transform"
          >
            <span className="material-symbols-outlined text-[28px]">add</span>
          </button>
        </div>

        <button
          onClick={() => setActiveTab('kitchen')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'kitchen' ? 'text-[#f2c35b]' : 'text-[#d2c5b1]'}`}
        >
          <span className="material-symbols-outlined">restaurant</span>
          <span className="text-[10px] font-bold">Kitchen</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-[#f2c35b]' : 'text-[#d2c5b1]'}`}
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">More</span>
        </button>
      </nav>

    </div>
  );
}
