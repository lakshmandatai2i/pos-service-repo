import { useState, useCallback, useEffect } from 'react';
import { supabase, type SupabaseMenuItem } from './supabaseClient';

import {
  MOCK_TABLES, MOCK_NOTIFS,
  type RestaurantTable, type POSNotif, type TableStatus, type ActiveView, type TableOrder
} from './data';
import {
  sendOrderToKitchen,
  subscribeKDSUpdates,
  type KDSOrder
} from './kdsStore';

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

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
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
  const [liveToast, setLiveToast] = useState<{ id: number; title: string; message: string } | null>(null);

  // Account & Settings State
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [waiterName, setWaiterName] = useState('John Doe');
  const [waiterEmail, setWaiterEmail] = useState('john.waiter@spicegarden.com');
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [quickPin, setQuickPin] = useState(true);

  // Supabase & Take Order Modal State
  const [showTakeOrderModal, setShowTakeOrderModal] = useState(false);
  const [takeOrderTable, setTakeOrderTable] = useState<RestaurantTable | null>(null);
  const [modalMode, setModalMode] = useState<'take_order' | 'add_item'>('take_order');
  const [menuItems, setMenuItems] = useState<SupabaseMenuItem[]>([
    { id: '001', name: 'Butter Chicken', price: 600, category: 'Main Course' },
    { id: '002', name: 'Chicken Biryani', price: 550, category: 'Main Course' },
    { id: '003', name: 'Veg Biryani', price: 480, category: 'Main Course' },
    { id: '004', name: 'Paneer Tikka', price: 350, category: 'Starters' },
    { id: '005', name: 'Garlic Naan', price: 120, category: 'Breads' },
    { id: '006', name: 'Dal Makhani', price: 450, category: 'Main Course' },
    { id: '007', name: 'Sweet Lassi', price: 160, category: 'Beverages' },
    { id: '008', name: 'Mango Lassi', price: 180, category: 'Beverages' },
    { id: '009', name: 'Gulab Jamun', price: 150, category: 'Desserts' }
  ]);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [itemQuantities, setItemQuantities] = useState<{ [itemId: string]: number }>({});

  // Fetch Live Items from Supabase Database
  useEffect(() => {
    async function fetchSupabaseItems() {
      try {
        const { data, error } = await supabase.from('items').select('*');
        if (!error && data && data.length > 0) {
          setMenuItems(data as SupabaseMenuItem[]);
          setSupabaseConnected(true);
        }
      } catch (err) {
        console.warn('Could not connect to Supabase items table:', err);
      }
    }
    fetchSupabaseItems();
  }, []);

  const handleOpenTakeOrder = (table?: RestaurantTable | null, mode: 'take_order' | 'add_item' = 'take_order') => {
    const target = table || selectedTable || tables.find(t => t.status === 'occupied' || t.status === 'available') || tables[0];
    setTakeOrderTable(target);
    setModalMode(mode);
    setItemQuantities({});
    setShowTakeOrderModal(true);
  };

  const handleUpdateQty = (itemId: string, delta: number) => {
    setItemQuantities(prev => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleConfirmOrderItems = () => {
    if (!takeOrderTable) return;

    const newOrdersToAdd: TableOrder[] = [];
    Object.entries(itemQuantities).forEach(([itemId, qty]) => {
      if (qty > 0) {
        const itemDetail = menuItems.find(m => m.id === itemId);
        if (itemDetail) {
          newOrdersToAdd.push({
            id: Date.now() + Math.floor(Math.random() * 1000),
            itemName: itemDetail.name,
            qty: qty,
            price: Number(itemDetail.price),
            isNew: true
          });
        }
      }
    });

    if (newOrdersToAdd.length === 0) return;

    setTables(prev => prev.map(t => {
      if (t.id === takeOrderTable.id) {
        const updatedOrders = [...t.orders, ...newOrdersToAdd];
        const updatedStatus: TableStatus = t.status === 'available' ? 'occupied' : t.status;
        return { ...t, orders: updatedOrders, status: updatedStatus };
      }
      return t;
    }));

    if (selectedTable && selectedTable.id === takeOrderTable.id) {
      setSelectedTable(prev => prev ? {
        ...prev,
        orders: [...prev.orders, ...newOrdersToAdd],
        status: prev.status === 'available' ? 'occupied' : prev.status
      } : null);
    }

    setLiveToast({
      id: Date.now(),
      title: '✅ Order Items Added!',
      message: `Added ${newOrdersToAdd.reduce((sum, i) => sum + i.qty, 0)} items to Table ${takeOrderTable.number}.`
    });
    setTimeout(() => setLiveToast(null), 4000);

    setShowTakeOrderModal(false);
    setItemQuantities({});
  };

  const chefNotifs = notifs.filter(n => n.type === 'kitchen_ready');
  const unreadNotifs = chefNotifs.filter(n => !n.isRead).length;

  // Real-time listener for chef order status updates (e.g. Order Prepared)
  useEffect(() => {
    const unsubscribe = subscribeKDSUpdates((data) => {
      if (data.type === 'ORDER_PREPARED' && data.order) {
        const preparedOrder = data.order;
        // Update table status to ready
        setTables(prev => prev.map(t => t.number === preparedOrder.tableNumber ? { ...t, status: 'ready' } : t));
        if (selectedTable && selectedTable.number === preparedOrder.tableNumber) {
          setSelectedTable(prev => prev ? { ...prev, status: 'ready' } : null);
        }

        // Push real-time notification
        const newNotif: POSNotif = {
          id: Date.now(),
          type: 'kitchen_ready',
          message: `Order ${preparedOrder.ticketNo} for Table ${preparedOrder.tableNumber} is prepared!`,
          detail: `Ready to serve (${preparedOrder.items.length} items)`,
          tableNumber: preparedOrder.tableNumber,
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        setNotifs(prev => [newNotif, ...prev]);

        // Trigger real-time toast alert
        setLiveToast({
          id: Date.now(),
          title: `🔔 Order ${preparedOrder.ticketNo} Prepared!`,
          message: `Table ${preparedOrder.tableNumber} order is ready to serve.`
        });
        setTimeout(() => setLiveToast(null), 5000);
      } else if (data.type === 'STATUS_CHANGE' && data.order) {
        const changedOrder = data.order;
        const targetStatus: TableStatus = changedOrder.status === 'completed' ? 'ready' : changedOrder.status === 'preparing' ? 'preparing' : 'occupied';
        setTables(prev => prev.map(t => t.number === changedOrder.tableNumber ? { ...t, status: targetStatus } : t));
      }
    });

    return () => unsubscribe();
  }, [selectedTable]);

  // Filtered tables
  const filteredTables = tables.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = t.number.toString().includes(searchQuery) ||
      t.section.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Active metrics
  const occupiedCount = tables.filter(t => t.status === 'occupied' || t.status === 'preparing' || t.status === 'ready' || t.status === 'prepared').length;
  const readyCount    = tables.filter(t => t.status === 'ready').length;



  const handleStatusChange = useCallback((tableId: number, nextStatus: TableStatus) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status: nextStatus } : t));
    if (selectedTable && selectedTable.id === tableId) {
      setSelectedTable(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  }, [selectedTable]);

  const handleSendToKitchen = useCallback((table: RestaurantTable) => {
    if (!table.orders || table.orders.length === 0) return;
    const ticketNo = table.ticketNo || `#${8900 + table.number}`;
    const newKDSOrder: KDSOrder = {
      id: Date.now(),
      ticketNo,
      tableNumber: table.number,
      section: table.section,
      guestCount: table.capacity,
      waiterName: 'John',
      status: 'pending',
      items: table.orders.map(o => ({
        id: o.id,
        itemName: o.itemName,
        qty: o.qty,
        price: o.price,
        note: o.note
      })),
      notes: table.orders.map(o => o.note).filter(Boolean).join(', '),
      createdAt: new Date().toISOString()
    };

    sendOrderToKitchen(newKDSOrder);

    // Update table status to preparing
    setTables(prev => prev.map(t => t.id === table.id ? { ...t, status: 'preparing', ticketNo } : t));
    if (selectedTable && selectedTable.id === table.id) {
      setSelectedTable(prev => prev ? { ...prev, status: 'preparing', ticketNo } : null);
    }

    setLiveToast({
      id: Date.now(),
      title: `Order ${ticketNo} Sent to Kitchen`,
      message: `Table ${table.number} order has been sent to chef.`
    });
    setTimeout(() => setLiveToast(null), 4000);
  }, [selectedTable]);

  return (
    <div className={`min-h-screen flex font-body selection:bg-[#f2c35b]/30 selection:text-[#f2c35b] ${isDark ? 'dark bg-[#1a1209] text-[#f1dfd0]' : 'bg-[#f7f4ed] text-[#2a1b0e]'}`}>

      {/* ── LIVE TOAST NOTIFICATION ── */}
      {liveToast && (
        <div className="fixed top-6 right-6 z-50 animate-bounce">
          <div className="bg-[#d4a843] text-[#261a00] px-5 py-4 rounded-2xl shadow-[0_10px_30px_rgba(212,168,67,0.4)] flex items-center gap-4 border border-white/20 font-bold">
            <span className="material-symbols-outlined text-[24px]">notifications_active</span>
            <div>
              <p className="text-sm m-0">{liveToast.title}</p>
              <p className="text-xs opacity-80 font-normal m-0">{liveToast.message}</p>
            </div>
            <button onClick={() => setLiveToast(null)} className="ml-2 hover:opacity-75">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

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

          {/* Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
              activeTab === 'settings'
                ? 'bg-[#d4a843] text-[#261a00] shadow-md'
                : isDark ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5' : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <span className="material-symbols-outlined">settings</span>
            <span>Settings</span>
          </button>
        </div>

        {/* Account Profile Card at Sidebar Bottom */}
        <div className="pt-4 border-t border-white/10 relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all border ${
              showAccountMenu 
                ? 'bg-[#f2c35b]/20 border-[#f2c35b]' 
                : isDark ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-stone-100 border-stone-200 hover:bg-stone-200'
            }`}
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f2c35b] to-[#d4a843] flex items-center justify-center text-[#261a00] font-bold text-sm shadow-md">
                {getInitials(waiterName)}
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#231a11] absolute bottom-0 right-0" />
            </div>
            <div className="text-left flex-grow overflow-hidden">
              <p className="text-xs font-bold truncate m-0">{waiterName}</p>
              <p className="text-[11px] text-[#d2c5b1] truncate m-0 font-medium">Senior Waiter</p>
            </div>
            <span className="material-symbols-outlined text-sm text-[#d2c5b1]">more_vert</span>
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
              {activeTab === 'settings' && 'Waiter Station Settings'}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-[#d2c5b1]' : 'text-stone-500'}`}>
              {activeTab === 'tables' && 'Main Dining Floor & Patio'}
              {activeTab === 'notifications' && 'Real-time Kitchen & Table Alerts'}
              {activeTab === 'settings' && 'Account Preferences & POS Configuration'}
            </p>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Theme Toggle Pill */}
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

            {/* Account Profile Photo Button */}
            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full bg-[#32281e] border border-[#f2c35b]/30 hover:border-[#f2c35b] transition-all shadow-md cursor-pointer"
                title="Account Menu"
              >
                <span className="text-xs font-bold text-[#f2c35b] hidden sm:inline">{waiterName}</span>
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-[#f2c35b] text-[#261a00] font-bold text-xs flex items-center justify-center shadow-inner">
                    {getInitials(waiterName)}
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-[#32281e] absolute -bottom-0.5 -right-0.5" />
                </div>
              </button>

              {/* Account Dropdown Popup Menu */}
              {showAccountMenu && (
                <div className={`absolute right-0 top-12 w-72 rounded-2xl p-4 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-150 ${
                  isDark ? 'bg-[#231a11] border-[#f2c35b]/30 text-[#f1dfd0]' : 'bg-white border-stone-300 text-stone-900'
                }`}>
                  {/* User Profile Header */}
                  <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                    <div className="w-12 h-12 rounded-full bg-[#f2c35b] text-[#261a00] font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
                      {getInitials(waiterName)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-headline font-bold text-sm truncate m-0">{waiterName}</h4>
                      <p className="text-xs text-[#f2c35b] font-semibold m-0">Senior Waiter</p>
                      <p className="text-[11px] text-[#d2c5b1] truncate m-0">{waiterEmail}</p>
                    </div>
                  </div>

                  {/* Account Metadata */}
                  <div className="py-3 flex flex-col gap-2 border-b border-white/10 text-xs text-[#d2c5b1]">
                    <div className="flex justify-between items-center">
                      <span>Staff ID:</span>
                      <span className="font-mono font-bold text-[#f2c35b]">#W-402</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Shift:</span>
                      <span className="font-semibold text-emerald-400">Morning (08:00 - 16:00)</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Floor Station:</span>
                      <span className="font-semibold">Main Dining</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('settings');
                        setShowAccountMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-[#f2c35b]/10 hover:text-[#f2c35b] transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">settings</span>
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAccountMenu(false);
                        setIsLoggedOut(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold bg-[#93000a]/20 text-red-400 hover:bg-[#93000a] hover:text-white transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-base">logout</span>
                      <span>Logout Account</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ── TABLES VIEW ──────────────────────────────────────────────── */}
        {activeTab === 'tables' && (
          <>
            {/* Stats Row */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Stat 1: Occupied Tables */}
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

              {/* Stat 2: Ready to Serve */}
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
                  {readyCount > 0 ? 'Action required — Chef marked order ready' : 'All clear'}
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
                    {t.status === 'ready' ? (
                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <p className="text-xs text-[#d2c5b1] mb-0.5">Current Bill</p>
                          <p className="font-headline text-xl font-bold text-[#f2c35b]">₹{subtotal.toLocaleString()}</p>
                        </div>
                      </div>
                    ) : (t.status === 'occupied' || t.status === 'preparing') ? (
                      <div className="relative z-10 flex justify-between items-end">
                        <div>
                          <p className="text-xs text-[#d2c5b1] mb-0.5">Active Order</p>
                          <p className="text-sm font-bold text-[#f1dfd0]">{t.orders.length} Item{t.orders.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    ) :
 t.status === 'available' ? (
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

        {/* ── SETTINGS VIEW ────────────────────────────────────────────── */}
        {activeTab === 'settings' && (
          <section className="max-w-4xl space-y-6">
            {/* Account & Profile Settings Card */}
            <div className={`glass-panel rounded-2xl p-6 border ${isDark ? 'border-white/5 bg-[#231a11]/60' : 'border-stone-200 bg-white shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <span className="material-symbols-outlined text-[#f2c35b] text-2xl">manage_accounts</span>
                <div>
                  <h3 className="font-headline text-lg font-bold m-0">Staff Profile & Account</h3>
                  <p className="text-xs text-[#d2c5b1] m-0">Manage your waiter profile details and credentials</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#d2c5b1]">Staff Name</label>
                  <input
                    type="text"
                    value={waiterName}
                    onChange={(e) => setWaiterName(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#f2c35b] ${
                      isDark ? 'bg-[#1a1209] border-white/10 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#d2c5b1]">Email Address</label>
                  <input
                    type="email"
                    value={waiterEmail}
                    onChange={(e) => setWaiterEmail(e.target.value)}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:border-[#f2c35b] ${
                      isDark ? 'bg-[#1a1209] border-white/10 text-white' : 'bg-stone-50 border-stone-300 text-stone-900'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Notification & Sound Settings Card */}
            <div className={`glass-panel rounded-2xl p-6 border ${isDark ? 'border-white/5 bg-[#231a11]/60' : 'border-stone-200 bg-white shadow-sm'}`}>
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <span className="material-symbols-outlined text-[#f2c35b] text-2xl">volume_up</span>
                <div>
                  <h3 className="font-headline text-lg font-bold m-0">Notifications & Sound Alerts</h3>
                  <p className="text-xs text-[#d2c5b1] m-0">Configure real-time kitchen chime and toast alerts</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm m-0">Kitchen Order Ready Sound</p>
                    <p className="text-xs text-[#d2c5b1] m-0">Play audio chime when Chef marks order ready</p>
                  </div>
                  <button
                    onClick={() => setSoundAlerts(!soundAlerts)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${soundAlerts ? 'bg-[#f2c35b] justify-end' : 'bg-stone-600 justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#261a00] shadow-md" />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <p className="font-bold text-sm m-0">Quick PIN Screen Lock</p>
                    <p className="text-xs text-[#d2c5b1] m-0">Require PIN after 5 minutes of inactivity</p>
                  </div>
                  <button
                    onClick={() => setQuickPin(!quickPin)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${quickPin ? 'bg-[#f2c35b] justify-end' : 'bg-stone-600 justify-start'}`}
                  >
                    <span className="w-4 h-4 rounded-full bg-[#261a00] shadow-md" />
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => {
                  setLiveToast({
                    id: Date.now(),
                    title: 'Settings Saved Successfully',
                    message: 'Your waiter station preferences have been updated.'
                  });
                  setTimeout(() => setLiveToast(null), 4000);
                }}
                className="px-6 py-3 rounded-xl bg-[#f2c35b] text-[#261a00] font-bold text-sm hover:bg-[#d4a843] transition-colors shadow-lg cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Save Preferences</span>
              </button>
            </div>
          </section>
        )}
      </main>

      {/* ── LOGGED OUT MODAL / OVERLAY ── */}
      {isLoggedOut && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#231a11] border border-[#f2c35b]/30 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-[#f2c35b]/20 border border-[#f2c35b] text-[#f2c35b] flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl">lock</span>
            </div>
            <h3 className="font-headline text-2xl font-bold text-white mb-2">Logged Out</h3>
            <p className="text-sm text-[#d2c5b1] mb-6">
              You have been logged out of the Waiter POS station ({waiterName}).
            </p>
            <button
              onClick={() => setIsLoggedOut(false)}
              className="w-full py-3.5 rounded-xl bg-[#f2c35b] text-[#261a00] font-bold text-sm hover:bg-[#d4a843] transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>Log Back In</span>
            </button>
          </div>
        </div>
      )}

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
                  <button
                    onClick={() => handleOpenTakeOrder(selectedTable, 'take_order')}
                    className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                    <span className="text-xs font-bold">Take Order</span>
                  </button>
                  <button
                    onClick={() => handleOpenTakeOrder(selectedTable, 'add_item')}
                    className="bg-[#3d3328]/30 hover:bg-[#3d3328] border border-white/10 hover:border-[#f2c35b]/50 transition-all rounded-xl p-4 flex items-center justify-center gap-2 group text-[#d2c5b1] hover:text-[#f2c35b] cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[24px]">add_circle</span>
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
                            <span>Print Receipt (Order Ready)</span>
                          </button>
                        ) : selectedTable.status === 'preparing' ? (
                          <button
                            disabled
                            className="w-full py-4 px-4 rounded-xl font-bold text-xs text-[#f2c35b] bg-[#f2c35b]/10 border border-[#f2c35b]/40 flex items-center justify-center gap-2 cursor-not-allowed opacity-90"
                          >
                            <span className="material-symbols-outlined text-[18px] animate-spin">soup_kitchen</span>
                            <span>Order Sent to Kitchen (Preparing)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendToKitchen(selectedTable)}
                            className="w-full py-4 px-4 rounded-xl font-bold text-xs text-[#261a00] bg-[#f2c35b] hover:bg-[#ffe2ab] transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                          >
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

      {/* ════════════════════════════════════════════════════════════════════════
          TAKE ORDER MODAL (SHOWING SUPABASE ITEMS, CATEGORY & PRICE TABLE)
      ════════════════════════════════════════════════════════════════════════ */}
      {showTakeOrderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10 bg-[#1a1209]/85 backdrop-blur-xl animate-[popIn_0.2s_ease-out]">
          <div className={`glass-panel w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border ${
            isDark ? 'border-[#f2c35b]/30 bg-[#231a11]' : 'border-stone-300 bg-white'
          }`}>
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-[#2d2217] shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#f2c35b]/20 text-[#f2c35b] flex items-center justify-center">
                  <span className="material-symbols-outlined">
                    {modalMode === 'add_item' ? 'add_circle' : 'receipt_long'}
                  </span>
                </div>
                <div>
                  <h2 className="font-headline text-xl font-bold text-[#f2c35b]">
                    {modalMode === 'add_item' ? 'Add Item to Order' : 'Take Order'}
                  </h2>
                  <p className="text-xs text-[#d2c5b1]">
                    {modalMode === 'add_item'
                      ? <>Select additional items to append to <span className="font-bold text-white">Table #{takeOrderTable?.number || 1}</span></>
                      : <>Select items from menu to add to <span className="font-bold text-white">Table #{takeOrderTable?.number || 1}</span></>}
                  </p>
                </div>
              </div>

              {/* Connection Status Badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{supabaseConnected ? 'Supabase Live' : 'Supabase Table'} ({menuItems.length} Items)</span>
                </div>

                <button
                  onClick={() => setShowTakeOrderModal(false)}
                  className="text-[#d2c5b1] hover:text-[#f2c35b] p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </header>

            {/* Controls Bar: Table Selector, Search & Category Filters */}
            <div className="p-4 sm:p-6 border-b border-white/10 bg-[#1c140d]/60 space-y-4 shrink-0">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                {/* Target Table Selector */}
                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-[#d2c5b1] uppercase">Target Table:</label>
                  <select
                    value={takeOrderTable?.id || tables[0]?.id}
                    onChange={(e) => {
                      const found = tables.find(t => t.id === Number(e.target.value));
                      if (found) setTakeOrderTable(found);
                    }}
                    className="bg-[#2d2217] border border-[#f2c35b]/30 text-[#f2c35b] font-bold text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-[#f2c35b] cursor-pointer"
                  >
                    {tables.map(t => (
                      <option key={t.id} value={t.id}>
                        Table #{t.number} ({t.capacity} Seats - {t.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <span className="material-symbols-outlined absolute left-3 top-2.5 text-sm text-[#d2c5b1]">search</span>
                  <input
                    type="text"
                    placeholder="Search items by name or category..."
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#2d2217] border border-white/10 text-white placeholder-[#d2c5b1]/50 focus:outline-none focus:border-[#f2c35b]"
                  />
                </div>
              </div>

              {/* Category Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['All', 'Main Course', 'Starters', 'Breads', 'Beverages', 'Desserts'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#f2c35b] text-[#261a00] shadow-md'
                        : 'bg-[#2d2217] text-[#d2c5b1] hover:text-white border border-white/5'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Table Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {(() => {
                const filteredItems = menuItems.filter(item => {
                  const matchCat = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
                  const matchSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || item.category.toLowerCase().includes(menuSearch.toLowerCase());
                  return matchCat && matchSearch;
                });

                if (filteredItems.length === 0) {
                  return (
                    <div className="text-center py-16 text-[#d2c5b1]">
                      <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                      <p className="text-sm font-semibold">No items match your search or filter</p>
                    </div>
                  );
                }

                return (
                  <div className="rounded-xl border border-white/10 overflow-hidden shadow-lg bg-[#1c140d]/40">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#2d2217] text-[#f2c35b] text-xs uppercase tracking-wider border-b border-white/10 font-bold">
                          <th className="py-3.5 px-4">Item ID</th>
                          <th className="py-3.5 px-4">Item Name</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4 text-right">Price</th>
                          <th className="py-3.5 px-4 text-center">Add Quantity</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {filteredItems.map(item => {
                          const qty = itemQuantities[item.id] || 0;
                          return (
                            <tr key={item.id} className="hover:bg-white/5 transition-colors">
                              <td className="py-3.5 px-4 font-mono text-xs text-[#d2c5b1] font-bold">
                                #{item.id}
                              </td>
                              <td className="py-3.5 px-4 font-bold text-white">
                                {item.name}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#f2c35b]/10 text-[#f2c35b] border border-[#f2c35b]/20">
                                  {item.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-[#f2c35b]">
                                ₹{Number(item.price).toFixed(2)}
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                {qty > 0 ? (
                                  <div className="inline-flex items-center gap-2 bg-[#2d2217] border border-[#f2c35b]/40 rounded-xl p-1">
                                    <button
                                      onClick={() => handleUpdateQty(item.id, -1)}
                                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold flex items-center justify-center cursor-pointer"
                                    >
                                      -
                                    </button>
                                    <span className="w-6 text-center font-bold text-[#f2c35b] text-sm">{qty}</span>
                                    <button
                                      onClick={() => handleUpdateQty(item.id, 1)}
                                      className="w-7 h-7 rounded-lg bg-[#f2c35b] text-[#261a00] font-bold flex items-center justify-center hover:bg-[#ffe2ab] cursor-pointer"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleUpdateQty(item.id, 1)}
                                    className="px-4 py-1.5 rounded-xl bg-[#f2c35b]/15 text-[#f2c35b] hover:bg-[#f2c35b] hover:text-[#261a00] font-bold text-xs transition-all border border-[#f2c35b]/30 inline-flex items-center gap-1.5 cursor-pointer"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    <span>Add</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Footer Summary & Confirm Order Action */}
            <footer className="p-4 sm:p-6 border-t border-white/10 bg-[#2d2217] flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
              <div>
                {(() => {
                  const totalQty = Object.values(itemQuantities).reduce((a, b) => a + b, 0);
                  const totalPrice = Object.entries(itemQuantities).reduce((total, [id, qty]) => {
                    const item = menuItems.find(m => m.id === id);
                    return total + (item ? Number(item.price) * qty : 0);
                  }, 0);

                  return (
                    <div className="text-left">
                      <span className="text-xs text-[#d2c5b1]">Selected Items: </span>
                      <span className="font-bold text-white mr-4">{totalQty} Items</span>
                      <span className="text-xs text-[#d2c5b1]">Total Price: </span>
                      <span className="font-headline font-bold text-lg text-[#f2c35b]">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  );
                })()}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setShowTakeOrderModal(false)}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-[#d2c5b1] hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOrderItems}
                  disabled={Object.values(itemQuantities).reduce((a, b) => a + b, 0) === 0}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#f2c35b] to-[#d4a843] text-[#261a00] font-bold text-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {modalMode === 'add_item' ? 'add_circle' : 'check_circle'}
                  </span>
                  <span>
                    {modalMode === 'add_item'
                      ? `Append Items to Table #${takeOrderTable?.number || 1}`
                      : `Confirm & Create Order for Table #${takeOrderTable?.number || 1}`}
                  </span>
                </button>
              </div>
            </footer>
          </div>
        </div>
      )}

    </div>
  );
}
