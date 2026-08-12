import React, { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  TrendingUp, 
  Award, 
  Clock, 
  Trash2, 
  CheckCircle2, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { AI_STATIC_INSIGHTS } from '../data/storeData';

const AIInsights = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories = ['All', 'Revenue & Sales', 'Best Seller', 'Operational Efficiency', 'Inventory & Wastage', 'Target Milestone'];

  const filteredInsights = selectedCategory === 'All'
    ? AI_STATIC_INSIGHTS
    : AI_STATIC_INSIGHTS.filter(item => item.category === selectedCategory);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const getIconForInsight = (category) => {
    switch (category) {
      case 'Revenue & Sales': return <TrendingUp size={20} />;
      case 'Best Seller': return <Award size={20} />;
      case 'Operational Efficiency': return <Clock size={20} />;
      case 'Inventory & Wastage': return <Trash2 size={20} />;
      case 'Target Milestone': return <CheckCircle2 size={20} />;
      default: return <Lightbulb size={20} />;
    }
  };

  return (
    <section className="ai-insights-section" id="ai-insights">
      {/* AI Header Card */}
      <div className="ai-header-card">
        <div className="ai-header-title">
          <div className="ai-sparkle-icon">
            <Sparkles size={24} />
          </div>
          <div>
            <h3>AI Business Intelligence & Insights</h3>
            <p>Automated real-time recommendations generated for Store Manager</p>
          </div>
        </div>

        <button 
          onClick={handleRefresh}
          className="tab-btn" 
          style={{ 
            background: 'var(--primary-light)', 
            color: 'var(--text-main)', 
            borderRadius: 'var(--radius-md)',
            padding: '0.5rem 1rem',
            border: '1px solid var(--border-color)'
          }}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
          <span>Refresh AI Analysis</span>
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`preset-chip ${selectedCategory === cat ? 'active' : ''}`}
            style={selectedCategory === cat ? { background: 'var(--primary)', color: 'var(--primary-text)' } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Insights Cards Grid */}
      <div className="insights-grid">
        {filteredInsights.map(insight => (
          <div key={insight.id} className={`insight-card type-${insight.type}`}>
            <div className="insight-badge-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary)' }}>
                  {getIconForInsight(insight.category)}
                </span>
                <span className="insight-category">{insight.category}</span>
              </div>
              <span className={`insight-badge type-${insight.type}`}>
                {insight.badge}
              </span>
            </div>

            <h4 className="insight-title">{insight.title}</h4>
            <p className="insight-desc">{insight.description}</p>

            <div className="insight-action-box">
              <Zap size={15} color="var(--primary)" />
              <span>Recommended Action: {insight.action}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AIInsights;
