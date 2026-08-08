import { useState, useCallback } from 'react';

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
  const chefNotifs = notifs.filter(n => n.type === 'kitchen_ready');
  const unreadNotifs = chefNotifs.filter(n => !n.isRead).length;

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
        </div>
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
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>
              {activeTab === 'tables' && 'Main Dining Floor & Patio'}
              {activeTab === 'notifications' && 'Real-time Kitchen & Table Alerts'}
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
                {(['all', 'available', 'occupied', 'preparing', 'ready'] as const).map(st => (
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
                const isActive = t.status !== 'available' && t.status !== 'closed';

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
                      {t.status === 'available' && <span className="material-symbols-outlined text-[#d2c5b1] opacity-50">check_circle</span>}
                    </div>


                    {/* Bottom Row */}
                    {isActive ? (
                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <p className="text-xs text-[#d2c5b1] mb-0.5">Current Bill</p>
                          <p className="font-headline text-xl font-bold text-[#f1dfd0]">₹{subtotal.toLocaleString()}</p>
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
              <p className="text-sm text-[#d2c5b1]">{unreadNotifs} unread ready-to-serve alert{unreadNotifs !== 1 ? 's' : ''}</p>
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
              {chefNotifs.map(n => (
                <div
                  key={n.id}
                  onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))}
                  className={`p-4 rounded-xl flex items-start gap-4 transition-colors cursor-pointer ${
                    !n.isRead ? 'bg-[#32281e]' : 'bg-[#1a1209]/40'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#f2c35b]/10 text-[#f2c35b] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined">room_service</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${n.isRead ? 'text-[#d2c5b1]' : 'text-[#f1dfd0] font-bold'}`}>{n.message}</p>
                    {n.detail && <p className="text-xs text-[#d2c5b1]/80 mt-1">{n.detail}</p>}
                    <p className="text-[11px] text-[#d2c5b1]/50 mt-1">{timeAgo(n.createdAt)} ago</p>
                  </div>
                  {!n.isRead && <span className="w-2.5 h-2.5 rounded-full bg-[#f2c35b] shrink-0 mt-2" />}
                </div>
              ))}
              {chefNotifs.length === 0 && (
                <p className="text-center text-xs text-[#d2c5b1]/50 py-12">No order-ready notifications from chef right now</p>
              )}
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

                {/* Quick Actions (Take Order & Add Item) */}
                <div className="p-6 md:p-8 border-b border-white/5 grid grid-cols-2 gap-4">
                  <button className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b]">
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                    <span className="text-xs font-bold">Take Order</span>
                  </button>
                  <button className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b]">
                    <span className="material-symbols-outlined text-[24px]">restaurant_menu</span>
                    <span className="text-xs font-bold">Add Item</span>
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

                      {/* Footer Action Buttons (Print Receipt shown only when Chef marks order ready) */}
                      <div className="flex gap-3">
                        {selectedTable.status === 'ready' ? (
                          <button className="w-full py-4 px-4 rounded-xl font-bold text-sm bg-[#f2c35b] text-[#402d00] hover:bg-[#ffe2ab] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(242,195,91,0.3)]">
                            <span className="material-symbols-outlined text-[22px]">print</span>
                            <span>Print Receipt</span>
                          </button>
                        ) : (
                          <button className="w-full py-4 px-4 rounded-xl font-bold text-xs text-[#f1dfd0] border border-white/20 hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            <span>Send to Kitchen</span>
                          </button>
                        )}
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


      </nav>

    </div>
  );
}
