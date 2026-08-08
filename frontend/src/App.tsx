import { useState } from 'react';
import Dashboard from './Dashboard';
import ChefDashboard from './ChefDashboard';

function App() {
  const [currentView, setCurrentView] = useState<'waiter' | 'chef'>('waiter');

  return (
    <div className="relative">
      {/* Top Floating View Selector */}
      <div className="fixed top-3 right-20 z-50 flex items-center bg-[#231a11]/90 backdrop-blur-md border border-[#f2c35b]/30 p-1 rounded-full shadow-2xl">
        <button
          onClick={() => setCurrentView('waiter')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentView === 'waiter'
              ? 'bg-[#f2c35b] text-[#261a00] shadow-md'
              : 'text-[#d2c5b1] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">restaurant</span>
          <span>Waiter POS</span>
        </button>
        <button
          onClick={() => setCurrentView('chef')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            currentView === 'chef'
              ? 'bg-[#f2c35b] text-[#261a00] shadow-md'
              : 'text-[#d2c5b1] hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">soup_kitchen</span>
          <span>Chef KDS Station</span>
        </button>
      </div>

      {currentView === 'waiter' ? <Dashboard /> : <ChefDashboard />}
    </div>
  );
}

export default App;
