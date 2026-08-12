import React from 'react';
import { 
  IndianRupee, 
  ShoppingBag, 
  UtensilsCrossed, 
  Crown,
  TrendingUp
} from 'lucide-react';
import { TODAY_SALES_SUMMARY } from '../data/storeData';

const SalesDetails = () => {
  return (
    <section className="sales-details-section">
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <TrendingUp size={22} /> Today's Sales Details
          </h3>
          <p className="section-subtitle">Real-time revenue metrics & sales distribution</p>
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
    </section>
  );
};

export default SalesDetails;
