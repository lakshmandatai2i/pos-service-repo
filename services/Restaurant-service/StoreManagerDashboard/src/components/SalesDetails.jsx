import React, { useState, useEffect } from 'react';
import { 
  IndianRupee, 
  ShoppingBag, 
  UtensilsCrossed, 
  Crown,
  TrendingUp,
  Users,
  Zap,
  PackageSearch,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  TODAY_SALES_SUMMARY, 
  REALTIME_CUSTOMERS_INITIAL, 
  REALTIME_ITEM_INVENTORY_DATA 
} from '../data/storeData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesDetails = () => {
  // Dynamic theme state observer for high-contrast graph rendering
  const [currentTheme, setCurrentTheme] = useState(() => {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  });

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setCurrentTheme(activeTheme);
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const isDay = currentTheme === 'day';
  const tickColor = isDay ? '#111111' : '#FFF8E7';
  const tickMutedColor = isDay ? '#444444' : '#D4C3AA';
  const gridLineColor = isDay ? 'rgba(0, 0, 0, 0.08)' : 'rgba(199, 155, 62, 0.12)';
  const tooltipBg = isDay ? '#ffffff' : '#1c140e';
  const tooltipBorder = isDay ? '#C79B3E' : 'rgba(199, 155, 62, 0.4)';
  const tooltipTitle = isDay ? '#111111' : '#FFF8E7';
  const tooltipBody = isDay ? '#333333' : '#D4C3AA';

  // Realtime Live Customers State
  const [customerTimeline, setCustomerTimeline] = useState(REALTIME_CUSTOMERS_INITIAL);
  const [activeCustomers, setActiveCustomers] = useState(195);
  const [recentGrowth, setRecentGrowth] = useState(14);

  // Realtime simulation interval: updates customer count live
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate live customer increment between +1 and +4
      const increment = Math.floor(Math.random() * 4) + 1;
      setActiveCustomers(prev => {
        const updated = prev + increment;
        
        // Update timeline array live
        setCustomerTimeline(oldTimeline => {
          const next = [...oldTimeline];
          const lastIdx = next.length - 1;
          next[lastIdx] = { ...next[lastIdx], count: updated };
          return next;
        });

        setRecentGrowth(g => g + increment);
        return updated;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic blinking animation duration (seconds).
  // As active customers grow, blinking speed accelerates (duration decreases from ~2s down to ~0.3s)
  const blinkDurationSec = Math.max(0.3, (2.2 - (activeCustomers / 160) * 1.2)).toFixed(2);

  // Line Chart Data
  const chartData = {
    labels: customerTimeline.map(item => item.time),
    datasets: [
      {
        label: 'Realtime Active Customers',
        data: customerTimeline.map(item => item.count),
        borderColor: '#C79B3E',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(199, 155, 62, 0.45)');
          gradient.addColorStop(1, 'rgba(199, 155, 62, 0.01)');
          return gradient;
        },
        fill: true,
        tension: 0.45,
        borderWidth: 3,
        pointBackgroundColor: customerTimeline.map((_, i) => i === customerTimeline.length - 1 ? (isDay ? '#16a34a' : '#22c55e') : '#C79B3E'),
        pointBorderColor: '#FFF8E7',
        pointRadius: customerTimeline.map((_, i) => i === customerTimeline.length - 1 ? 8 : 5),
        pointHoverRadius: 9,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        padding: 12,
        callbacks: {
          label: (context) => `Customer Count: ${context.raw} active in store`
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, font: { family: 'Geist', size: 11, weight: '600' } }
      },
      y: {
        grid: { color: gridLineColor },
        ticks: { color: tickMutedColor, font: { family: 'Geist', size: 11, weight: '600' } },
        min: 0
      }
    }
  };

  return (
    <section className="sales-details-section">
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <TrendingUp size={22} /> Realtime Analytics
          </h3>
          <p className="section-subtitle">Real-time revenue metrics, customer footfall & item inventory stock levels</p>
        </div>
      </div>

      {/* 4 Cards */}
      <div className="sales-grid">
        {/* Card 1: Revenue */}
        <div className="sales-card">
          <div className="sales-card-icon">
            <IndianRupee size={24} />
          </div>
          <div className="sales-card-info">
            <span className="sales-card-title">Today's Revenue</span>
            <span className="sales-card-value">{TODAY_SALES_SUMMARY.revenue}</span>
            <span className="sales-card-sub" style={{ color: 'var(--success-text)', fontWeight: 600 }}>
              Target: {TODAY_SALES_SUMMARY.targetToday} (114%)
            </span>
          </div>
        </div>

        {/* Card 2: Orders Today */}
        <div className="sales-card">
          <div className="sales-card-icon">
            <ShoppingBag size={24} />
          </div>
          <div className="sales-card-info">
            <span className="sales-card-title">Orders Today</span>
            <span className="sales-card-value">{TODAY_SALES_SUMMARY.ordersToday}</span>
            <span className="sales-card-sub">
              Avg Order Value: {TODAY_SALES_SUMMARY.avgOrderValue}
            </span>
          </div>
        </div>

        {/* Card 3: Food Quantity */}
        <div className="sales-card">
          <div className="sales-card-icon">
            <UtensilsCrossed size={24} />
          </div>
          <div className="sales-card-info">
            <span className="sales-card-title">Today's Food Quantity</span>
            <span className="sales-card-value">{TODAY_SALES_SUMMARY.foodQuantity}</span>
            <span className="sales-card-sub">
              Across 14 Menu Categories
            </span>
          </div>
        </div>

        {/* Card 4: Highest Sale Item */}
        <div className="sales-card">
          <div className="sales-card-icon">
            <Crown size={24} />
          </div>
          <div className="sales-card-info">
            <span className="sales-card-title">Today's Highest Sale Item</span>
            <span className="sales-card-value" style={{ fontSize: '1.25rem', fontFamily: 'EB Garamond' }}>
              {TODAY_SALES_SUMMARY.highestSaleItem}
            </span>
            <span className="sales-card-sub" style={{ color: 'var(--success-text)', fontWeight: 600 }}>
              {TODAY_SALES_SUMMARY.highestSaleQuantity}
            </span>
          </div>
        </div>
      </div>

      {/* Realtime Customer Footfall Line Chart Section */}
      <div className="card card-padding" style={{ marginTop: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Users size={22} color="var(--primary)" />
              <h4 style={{ fontSize: '1.15rem', margin: 0 }}>Realtime Customer Footfall Stream</h4>
              
              {/* Accelerating Blinking Status Dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                <span 
                  className="live-pulse-dot"
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: '#22c55e',
                    display: 'inline-block',
                    boxShadow: '0 0 10px #22c55e',
                    animation: `live-pulse-anim ${blinkDurationSec}s infinite ease-in-out`
                  }}
                />
                <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 700, letterSpacing: '0.05em' }}>
                  LIVE REALTIME
                </span>
              </div>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Live customer tracking in store. Blinking frequency accelerates as customer traffic grows.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Geist, monospace', color: 'var(--text-main)', lineHeight: 1.1 }}>
                {activeCustomers} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Customers</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--success-text)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.2rem' }}>
                <Zap size={13} /> +{recentGrowth} in last hour
              </div>
            </div>

            <span className="badge achieved" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              ⚡ Blink Frequency: {blinkDurationSec}s
            </span>
          </div>
        </div>

        {/* Live Line Chart */}
        <div style={{ height: '300px', position: 'relative' }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* REALTIME ITEM INVENTORY PREPARED VS REMAINING TABLE */}
      <div className="card card-padding" style={{ marginTop: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.15rem', margin: 0 }}>
              <PackageSearch size={22} color="var(--primary)" /> Realtime Item Inventory Tracking
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Live tracking of items prepared vs remaining stock available for orders
            </p>
          </div>
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--border-color)' }}>
            10 Menu Items Tracked
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>S.No</th>
                <th>Items</th>
                <th>Quantity Prepared (kg)</th>
                <th>Quantity Remaining (kg)</th>
              </tr>
            </thead>
            <tbody>
              {REALTIME_ITEM_INVENTORY_DATA.map((row) => (
                <tr key={row.sno}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'Geist, monospace' }}>
                    {row.sno}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    {row.item}
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, fontFamily: 'Geist, monospace', fontSize: '0.95rem' }}>
                      {row.qtyPrepared} kg
                    </span>
                  </td>
                  <td>
                    <span 
                      style={{ 
                        fontWeight: 700, 
                        fontFamily: 'Geist, monospace', 
                        fontSize: '0.95rem',
                        color: 'var(--text-main)' 
                      }}
                    >
                      {row.qtyRemaining} kg remaining
                    </span>
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

export default SalesDetails;
