import React from 'react';
import { 
  Trash2, 
  ShoppingBag, 
  TrendingDown, 
  Clock, 
  Flame,
  Sparkles
} from 'lucide-react';
import { KPI_DATA } from '../data/storeData';

const KPICards = () => {
  return (
    <section style={{ marginBottom: '2rem' }}>
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <Sparkles size={20} /> Store Performance KPIs
          </h3>
          <p className="section-subtitle">Real-time store metrics for today's operation</p>
        </div>
      </div>

      <div className="kpi-grid">
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
          </div>
        </div>

        {/* 2. Number of Orders */}
        <div className="card kpi-card kpi-orders">
          <div className="kpi-top">
            <span className="kpi-label">Number of Orders</span>
            <div className="kpi-icon-wrapper">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value">{KPI_DATA.totalOrders.value}</div>
          </div>
        </div>

        {/* 3. Lowest Sale Item */}
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
          </div>
        </div>

        {/* 4. Peak Hours */}
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
          </div>
        </div>

        {/* 5. High Sale Item */}
        <div className="card kpi-card kpi-highest">
          <div className="kpi-top">
            <span className="kpi-label">High Sale Item</span>
            <div className="kpi-icon-wrapper">
              <Flame size={20} />
            </div>
          </div>
          <div>
            <div className="kpi-value" style={{ fontSize: '1.35rem' }}>
              {KPI_DATA.highestSaleItem.name}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default KPICards;
