import { useState, useCallback, useEffect } from 'react';
import {
  type POSNotif
} from './data';
import {
  getStoredOrders,
  updateOrderStatus,
  sendOrderToKitchen,
  subscribeKDSUpdates,
  type KDSOrder
} from './kdsStore';

export type ChefActiveView = 'pending' | 'preparing' | 'completed';

function timeAgo(iso?: string): string {
  if (!iso) return '0m ago';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`;
  return `${Math.floor(m / 60)}h ${m % 60}m ago`;
}

export default function Dashboard() {
  const [isDark, setIsDark] = useState(true);
  const [activeTab, setActiveTab] = useState<ChefActiveView>('pending');
  const [orders, setOrders] = useState<KDSOrder[]>(() => getStoredOrders());
  const [toastNotif, setToastNotif] = useState<POSNotif | null>(null);

  // Subscribe to real-time order updates from Waiter POS or other tabs
  useEffect(() => {
    const unsubscribe = subscribeKDSUpdates((data) => {
      if (data.orders) {
        setOrders(data.orders);
      } else {
        setOrders(getStoredOrders());
      }
      if (data.type === 'NEW_ORDER' && data.order) {
        setActiveTab('pending');
      }
    });
    return () => unsubscribe();
  }, []);

  // Counts
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const completedOrders = orders.filter(o => o.status === 'completed');

  // Trigger notification toast
  const triggerWaiterNotif = useCallback((order: KDSOrder) => {
    const newNotif: POSNotif = {
      id: Date.now(),
      type: 'kitchen_ready',
      message: `Table ${order.tableNumber} Order Ready!`,
      detail: `Ticket ${order.ticketNo} (${order.items.length} items) is prepared.`,
      tableNumber: order.tableNumber,
      ticketNo: order.ticketNo,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setToastNotif(newNotif);
    setTimeout(() => {
      setToastNotif(prev => (prev?.id === newNotif.id ? null : prev));
    }, 4500);
  }, []);

  // Action: Chef confirms pending order -> moves to preparing
  const handleConfirm = useCallback((id: number) => {
    const result = updateOrderStatus(id, 'preparing');
    setOrders(result.orders);
  }, []);

  // Action: Chef marks prepared -> moves to completed & sends waiter notification
  const handlePrepared = useCallback((id: number) => {
    const result = updateOrderStatus(id, 'completed');
    setOrders(result.orders);
    const targetOrder = result.orders.find(o => o.id === id);
    if (targetOrder) {
      triggerWaiterNotif(targetOrder);
    }
  }, [triggerWaiterNotif]);

  // Action: Simulate incoming new order from POS / Waiter
  const handleSimulateNewOrder = () => {
    const randomTable = Math.floor(Math.random() * 12) + 1;
    const randomTicket = `#${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: KDSOrder = {
      id: Date.now(),
      ticketNo: randomTicket,
      tableNumber: randomTable,
      section: randomTable > 8 ? 'Patio' : 'Main Dining',
      guestCount: Math.floor(Math.random() * 4) + 2,
      waiterName: 'John',
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: 'Urgent order - extra crispy',
      items: [
        { id: 1, itemName: 'Paneer Butter Masala', qty: 2, price: 420 },
        { id: 2, itemName: 'Butter Naan', qty: 4, price: 90 },
        { id: 3, itemName: 'Jeera Rice', qty: 1, price: 220, isNew: true },
      ]
    };
    const updated = sendOrderToKitchen(newOrder);
    setOrders(updated);
    setActiveTab('pending');
  };

  const currentTabOrders =
    activeTab === 'pending'
      ? pendingOrders
      : activeTab === 'preparing'
        ? preparingOrders
        : completedOrders;

  return (
    <div
      className={`min-h-screen flex font-body selection:bg-[#f2c35b]/30 selection:text-[#f2c35b] ${isDark ? 'dark bg-[#140d05] text-[#f1dfd0]' : 'bg-[#f7f4ed] text-[#2a1b0e]'
        }`}
    >
      {/* ════════════════════════════════════════════════════════════════════════
          LIVE TOAST NOTIFICATION FOR WAITER ALERT
      ════════════════════════════════════════════════════════════════════════ */}
      {toastNotif && (
        <div className="fixed top-6 right-6 z-50 animate-bounce transition-all">
          <div className="bg-[#10b981] text-white px-5 py-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center gap-4 border border-white/20">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">notifications_active</span>
            </div>
            <div>
              <p className="font-bold text-sm">Notification Sent to Waiter!</p>
              <p className="text-xs opacity-90">{toastNotif.message} — {toastNotif.detail}</p>
            </div>
            <button
              onClick={() => setToastNotif(null)}
              className="text-white/80 hover:text-white ml-2"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SIDEBAR NAVIGATION (CHEF DASHBOARD)
      ════════════════════════════════════════════════════════════════════════ */}
      <nav
        className={`hidden md:flex flex-col h-screen fixed left-0 top-0 p-6 border-r shadow-2xl w-[280px] z-40 transition-colors ${isDark ? 'bg-[#1f170e] border-white/5' : 'bg-white border-stone-200'
          }`}
      >
        {/* Chef Station Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f2c35b] to-[#d4a843] flex items-center justify-center text-[#261a00] font-bold text-2xl shadow-lg shrink-0">
            👨‍🍳
          </div>
          <div>
            <h1 className="font-headline text-lg font-bold text-[#f2c35b] m-0 leading-tight">
              Chef Station KDS
            </h1>
            <p className="text-xs text-[#d2c5b1]/80 mt-0.5 font-semibold">
              Kitchen Display System
            </p>
          </div>
        </div>

        {/* 3 Sidebar Navigation Options */}
        <div className="flex flex-col gap-3 flex-grow">
          {/* 1. Pending Orders */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'pending'
                ? 'bg-[#f2c35b] text-[#261a00] shadow-lg scale-[1.02]'
                : isDark
                  ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">pending_actions</span>
              <span>Pending Orders</span>
            </div>
            {pendingOrders.length > 0 && (
              <span
                className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${activeTab === 'pending'
                    ? 'bg-[#261a00] text-[#f2c35b]'
                    : 'bg-[#f2c35b]/20 text-[#f2c35b]'
                  }`}
              >
                {pendingOrders.length}
              </span>
            )}
          </button>

          {/* 2. Preparing Orders */}
          <button
            onClick={() => setActiveTab('preparing')}
            className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'preparing'
                ? 'bg-[#3b82f6] text-white shadow-lg scale-[1.02]'
                : isDark
                  ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">soup_kitchen</span>
              <span>Preparing Orders</span>
            </div>
            {preparingOrders.length > 0 && (
              <span
                className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${activeTab === 'preparing'
                    ? 'bg-white text-[#3b82f6]'
                    : 'bg-[#3b82f6]/20 text-[#3b82f6]'
                  }`}
              >
                {preparingOrders.length}
              </span>
            )}
          </button>

          {/* 3. Completed Orders */}
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center justify-between px-4 py-3.5 rounded-xl font-bold transition-all text-sm ${activeTab === 'completed'
                ? 'bg-[#10b981] text-white shadow-lg scale-[1.02]'
                : isDark
                  ? 'text-[#d2c5b1] hover:text-white hover:bg-white/5'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined">task_alt</span>
              <span>Completed Orders</span>
            </div>
            {completedOrders.length > 0 && (
              <span
                className={`px-2.5 py-0.5 text-xs rounded-full font-bold ${activeTab === 'completed'
                    ? 'bg-white text-[#10b981]'
                    : 'bg-[#10b981]/20 text-[#10b981]'
                  }`}
              >
                {completedOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Footer Theme Toggle */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <span className="text-xs text-[#d2c5b1]/70 font-semibold">Dark Mode</span>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${isDark ? 'bg-[#f2c35b] justify-end' : 'bg-stone-300 justify-start'
              }`}
          >
            <div className="w-4 h-4 rounded-full bg-[#140d05]" />
          </button>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════════════
          MAIN KITCHEN CANVAS
      ════════════════════════════════════════════════════════════════════════ */}
      <main className="flex-grow w-full md:ml-[280px] p-4 sm:p-6 md:p-10 min-h-screen relative overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-white/5">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-[#f2c35b] flex items-center gap-3">
              {activeTab === 'pending' && (
                <>
                  <span className="material-symbols-outlined text-3xl text-[#f2c35b]">hourglass_top</span>
                  <span>Pending Orders</span>
                </>
              )}
              {activeTab === 'preparing' && (
                <>
                  <span className="material-symbols-outlined text-3xl text-[#3b82f6]">skillet</span>
                  <span>Preparing Orders</span>
                </>
              )}
              {activeTab === 'completed' && (
                <>
                  <span className="material-symbols-outlined text-3xl text-[#10b981]">check_circle</span>
                  <span>Completed Orders</span>
                </>
              )}
            </h2>
            <p className="text-xs text-[#d2c5b1]/80 mt-1">
              {activeTab === 'pending' && 'New incoming tickets waiting for chef confirmation to cook.'}
              {activeTab === 'preparing' && 'Orders currently being prepared in the kitchen.'}
              {activeTab === 'completed' && 'Orders prepared and notified to waiters for table delivery.'}
            </p>
          </div>

          {/* Quick Action: Simulate Order */}
          <button
            onClick={handleSimulateNewOrder}
            className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[#f2c35b]/10 text-[#f2c35b] border border-[#f2c35b]/30 hover:bg-[#f2c35b] hover:text-[#261a00] transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Simulate New Order</span>
          </button>
        </header>

        {/* Orders Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24 md:pb-0">
          {currentTabOrders.map(order => {
            const totalItems = order.items.reduce((acc, item) => acc + item.qty, 0);

            return (
              <div
                key={order.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all border shadow-xl relative overflow-hidden ${order.status === 'pending'
                    ? 'bg-[#241a10] border-[#f2c35b]/40 hover:border-[#f2c35b]'
                    : order.status === 'preparing'
                      ? 'bg-[#182333] border-[#3b82f6]/40 hover:border-[#3b82f6]'
                      : 'bg-[#13261f] border-[#10b981]/40 hover:border-[#10b981]'
                  }`}
              >
                {/* Order Top Bar */}
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/10">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-xl font-bold text-[#f2c35b]">
                        Table {order.tableNumber}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-[#d2c5b1] font-mono">
                        {order.ticketNo}
                      </span>
                    </div>
                    <p className="text-xs text-[#d2c5b1]/70 mt-0.5">
                      {order.section} • {order.guestCount} Guests
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#d2c5b1]/80 font-bold block">
                      {timeAgo(order.createdAt)}
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full inline-block mt-1 ${order.status === 'pending'
                          ? 'bg-[#f2c35b]/20 text-[#f2c35b]'
                          : order.status === 'preparing'
                            ? 'bg-[#3b82f6]/20 text-[#3b82f6]'
                            : 'bg-[#10b981]/20 text-[#10b981]'
                        }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Special Instructions / Notes */}
                {order.notes && (
                  <div className="mb-4 px-3 py-2 rounded-xl bg-black/20 border border-white/5 text-xs text-[#f2c35b] italic flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">info</span>
                    <span>Note: {order.notes}</span>
                  </div>
                )}

                {/* Items List */}
                <div className="flex-1 space-y-2.5 my-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#d2c5b1]/60">
                    Items ({totalItems})
                  </p>
                  {order.items.map(item => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center bg-black/10 p-2.5 rounded-xl text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#f2c35b]/20 text-[#f2c35b] font-bold text-xs flex items-center justify-center shrink-0">
                          {item.qty}x
                        </span>
                        <span className="font-semibold text-[#f1dfd0]">{item.itemName}</span>
                      </div>
                      {item.note && (
                        <span className="text-xs text-[#d2c5b1]/70 italic">({item.note})</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons based on status */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => handleConfirm(order.id)}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#f2c35b] text-[#261a00] hover:bg-[#ffe2ab] transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <span className="material-symbols-outlined text-[20px]">soup_kitchen</span>
                      <span>Confirm Order (Start Preparing)</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handlePrepared(order.id)}
                      className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#10b981] text-white hover:bg-[#34d399] transition-all flex items-center justify-center gap-2 shadow-lg"
                    >
                      <span className="material-symbols-outlined text-[20px]">task_alt</span>
                      <span>Order Prepared (Notify Waiter)</span>
                    </button>
                  )}

                  {order.status === 'completed' && (
                    <div className="flex items-center justify-between text-xs text-[#10b981] font-bold bg-[#10b981]/10 px-4 py-3 rounded-xl border border-[#10b981]/30">
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">verified</span>
                        <span>Prepared & Waiter Notified</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {currentTabOrders.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#d2c5b1]/50 border-2 border-dashed border-white/10 rounded-2xl">
              <span className="material-symbols-outlined text-4xl block mb-2 opacity-50">
                inbox
              </span>
              <p className="text-base font-semibold">No {activeTab} orders at the moment</p>
              {activeTab === 'pending' && (
                <p className="text-xs text-[#d2c5b1]/40 mt-1">
                  Click "+ Simulate New Order" to create a test ticket.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ════════════════════════════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION (md:hidden)
      ════════════════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#1f170e]/95 backdrop-blur-xl border-t border-white/10 z-50 flex justify-around items-center px-4 py-3">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'pending' ? 'text-[#f2c35b]' : 'text-[#d2c5b1]'
            }`}
        >
          <span className="material-symbols-outlined">pending_actions</span>
          <span className="text-[10px] font-bold">Pending ({pendingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('preparing')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'preparing' ? 'text-[#3b82f6]' : 'text-[#d2c5b1]'
            }`}
        >
          <span className="material-symbols-outlined">soup_kitchen</span>
          <span className="text-[10px] font-bold">Preparing ({preparingOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'completed' ? 'text-[#10b981]' : 'text-[#d2c5b1]'
            }`}
        >
          <span className="material-symbols-outlined">task_alt</span>
          <span className="text-[10px] font-bold">Completed ({completedOrders.length})</span>
        </button>
      </nav>
    </div>
  );
}
