import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  TrendingDown, 
  Clock, 
  Sparkles,
  BarChart3,
  Activity
} from 'lucide-react';
import { 
  KPI_DATA, 
  WEEKLY_TARGET_PROGRESS_DATA, 
  FOOD_QTY_VS_WASTAGE_DATA 
} from '../data/storeData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const KPICards = () => {
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

  // 1. Target Progress vs Dates of Week (Bar Chart Data)
  const targetBarData = {
    labels: WEEKLY_TARGET_PROGRESS_DATA.map(d => d.day),
    datasets: [
      {
        label: 'Target Achievement (%)',
        data: WEEKLY_TARGET_PROGRESS_DATA.map(d => d.percentage),
        backgroundColor: isDay ? '#C79B3E' : 'rgba(199, 155, 62, 0.85)',
        hoverBackgroundColor: '#DBB152',
        borderColor: '#C79B3E',
        borderWidth: 1.5,
        borderRadius: 8,
        borderSkipped: false,
      }
    ]
  };

  const targetBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const item = WEEKLY_TARGET_PROGRESS_DATA[context.dataIndex];
            return `Progress: ${context.raw}% (Achieved: ₹${item.achieved.toLocaleString()} vs Target: ₹${item.target.toLocaleString()})`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: tickColor, 
          font: { family: 'Geist', size: 12, weight: '700' },
          maxRotation: 0,
          minRotation: 0,
          padding: 6
        }
      },
      y: {
        grid: { color: gridLineColor },
        ticks: { 
          color: tickMutedColor,
          font: { family: 'Geist', size: 11, weight: '600' },
          callback: (val) => `${val}%` 
        },
        min: 80,
        max: 130
      }
    }
  };

  // 2. Food Quantity Prepared vs Sold vs Wasted (Animated Line Chart Data)
  const foodLineData = {
    labels: FOOD_QTY_VS_WASTAGE_DATA.map(d => d.day),
    datasets: [
      {
        label: 'Food Quantity Prepared (Items)',
        data: FOOD_QTY_VS_WASTAGE_DATA.map(d => d.foodPrepared),
        borderColor: '#C79B3E',
        backgroundColor: 'rgba(199, 155, 62, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#C79B3E',
        pointBorderColor: '#FFF8E7',
        pointHoverRadius: 6,
        yAxisID: 'y'
      },
      {
        label: 'Food Quantity Sold (Items)',
        data: FOOD_QTY_VS_WASTAGE_DATA.map(d => d.foodSold),
        borderColor: isDay ? '#16a34a' : '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: isDay ? '#16a34a' : '#22c55e',
        pointBorderColor: '#FFF8E7',
        pointHoverRadius: 6,
        yAxisID: 'y'
      },
      {
        label: 'Food Quantity Wasted (kg)',
        data: FOOD_QTY_VS_WASTAGE_DATA.map(d => d.foodWastedKg),
        borderColor: isDay ? '#dc2626' : '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: false,
        tension: 0.4,
        pointBackgroundColor: isDay ? '#dc2626' : '#ef4444',
        pointBorderColor: '#FFF8E7',
        pointHoverRadius: 6,
        yAxisID: 'y1'
      }
    ]
  };

  const foodLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1600,
      easing: 'easeInOutCubic'
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: { 
          color: tickColor, 
          font: { family: 'Geist', size: 11, weight: '600' },
          usePointStyle: true,
          padding: 12
        }
      },
      tooltip: {
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        titleColor: tooltipTitle,
        bodyColor: tooltipBody,
        padding: 12
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: tickColor, 
          font: { family: 'Geist', size: 12, weight: '700' },
          maxRotation: 0,
          minRotation: 0,
          padding: 6
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: { color: gridLineColor },
        ticks: { color: '#C79B3E', font: { family: 'Geist', size: 11, weight: '600' } }
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: isDay ? '#dc2626' : '#ef4444', font: { family: 'Geist', size: 11, weight: '600' } }
      }
    }
  };

  return (
    <section style={{ marginBottom: '2rem' }}>
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <Sparkles size={20} /> Store Performance KPIs & Analytics
          </h3>
          <p className="section-subtitle">Real-time store metrics, weekly target trends & wastage analysis</p>
        </div>
      </div>

      {/* 3 KPI Cards: Food Wastage, Lowest Sale Item, Peak Hours */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', marginBottom: '1.75rem' }}>
        {/* 1. Food Wastage */}
        <div className="card kpi-card kpi-wastage">
          <div className="kpi-top">
            <span className="kpi-label">Food Wastage</span>
            <div className="kpi-icon-wrapper">
              <Trash2 size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{KPI_DATA.foodWastage.value}</div>
            <div className="kpi-subtext" style={{ color: 'var(--success-text)' }}>
              {KPI_DATA.foodWastage.trend} {KPI_DATA.foodWastage.comparisonText}
            </div>
          </div>
        </div>

        {/* 2. Lowest Sale Item */}
        <div className="card kpi-card kpi-lowest">
          <div className="kpi-top">
            <span className="kpi-label">Lowest Sale Item</span>
            <div className="kpi-icon-wrapper">
              <TrendingDown size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.35rem' }}>
              {KPI_DATA.lowestSaleItem.name}
            </div>
            <div className="kpi-subtext">
              {KPI_DATA.lowestSaleItem.salesCount} sold ({KPI_DATA.lowestSaleItem.revenue})
            </div>
          </div>
        </div>

        {/* 3. Peak Hours */}
        <div className="card kpi-card kpi-peak">
          <div className="kpi-top">
            <span className="kpi-label">Peak Hours</span>
            <div className="kpi-icon-wrapper">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.25rem' }}>
              {KPI_DATA.peakHours.timeSlot}
            </div>
            <div className="kpi-subtext">
              {KPI_DATA.peakHours.orderCount} Orders ({KPI_DATA.peakHours.revenueShare} daily vol)
            </div>
          </div>
        </div>
      </div>

      {/* Visual Analytics Graphs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem' }}>
        {/* Bar Graph: Target Progress vs Dates of Week */}
        <div className="card card-padding">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <BarChart3 size={20} color="var(--primary)" /> Target Progress vs Dates of Week
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly sales target achievement percentage (%)</p>
            </div>
            <span className="badge achieved">Avg 110.1%</span>
          </div>

          <div style={{ height: '270px', position: 'relative' }}>
            <Bar data={targetBarData} options={targetBarOptions} />
          </div>
        </div>

        {/* Line Graph: Food Quantity Prepared vs Sold vs Wasted (Animated) */}
        <div className="card card-padding">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
                <Activity size={20} color="var(--primary)" /> Food Prepared vs Sold vs Wasted
              </h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Daily comparison of food prepared (gold), food sold (green) & wasted (red)</p>
            </div>
            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary)', border: '1px solid var(--border-color)' }}>
              Animated Track
            </span>
          </div>

          <div style={{ height: '270px', position: 'relative' }}>
            <Line data={foodLineData} options={foodLineOptions} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default KPICards;
