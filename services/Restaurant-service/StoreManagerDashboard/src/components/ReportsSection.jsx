import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  ArrowUpDown, 
  CheckCircle2, 
  XCircle,
  Clock,
  ShoppingBag
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ALL_REPORTS_DATA, ORDER_REPORTS_DATA } from '../data/storeData';

// Robust Browser Excel / CSV Downloader
const triggerFileDownload = (data, fileName) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Write XLSX array buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Create Blob with official Excel MIME type
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' 
    });
    
    // Trigger anchor download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.xlsx`;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    console.warn('XLSX Blob generation error, switching to CSV export:', err);
    // Reliable CSV fallback
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvString = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }
};

const ReportsSection = ({ globalSearch = '' }) => {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'orders'

  // Tab 1: All Reports State
  const [allSearch, setAllSearch] = useState('');
  const [allDateFilter, setAllDateFilter] = useState('');
  const [allStatusFilter, setAllStatusFilter] = useState('all');
  const [allSortField, setAllSortField] = useState('id');
  const [allSortDirection, setAllSortDirection] = useState('asc');
  const [allCurrentPage, setAllCurrentPage] = useState(1);
  const [allRowsPerPage, setAllRowsPerPage] = useState(5);

  // Tab 2: Order Reports State
  const [orderSearch, setOrderSearch] = useState('');
  const [orderDateFilter, setOrderDateFilter] = useState('');
  const [orderTimeFilter, setOrderTimeFilter] = useState('all');
  const [orderItemFilter, setOrderItemFilter] = useState('all');
  const [orderSortField, setOrderSortField] = useState('id');
  const [orderSortDirection, setOrderSortDirection] = useState('asc');
  const [orderCurrentPage, setOrderCurrentPage] = useState(1);
  const [orderRowsPerPage, setOrderRowsPerPage] = useState(5);

  const effectiveAllSearch = globalSearch || allSearch;
  const effectiveOrderSearch = globalSearch || orderSearch;

  // Filter & Sort for All Reports
  const filteredAllReports = useMemo(() => {
    return ALL_REPORTS_DATA.filter(row => {
      const matchesSearch = row.date.toLowerCase().includes(effectiveAllSearch.toLowerCase()) ||
                            row.revenue.toLowerCase().includes(effectiveAllSearch.toLowerCase()) ||
                            row.orders.toString().includes(effectiveAllSearch);
      
      const matchesDate = !allDateFilter || row.date.includes(allDateFilter);
      const matchesStatus = allStatusFilter === 'all' || row.status === allStatusFilter;

      return matchesSearch && matchesDate && matchesStatus;
    }).sort((a, b) => {
      let aVal = a[allSortField];
      let bVal = b[allSortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return allSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return allSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [effectiveAllSearch, allDateFilter, allStatusFilter, allSortField, allSortDirection]);

  // Paginated All Reports
  const paginatedAllReports = useMemo(() => {
    const start = (allCurrentPage - 1) * allRowsPerPage;
    return filteredAllReports.slice(start, start + allRowsPerPage);
  }, [filteredAllReports, allCurrentPage, allRowsPerPage]);

  const totalAllPages = Math.ceil(filteredAllReports.length / allRowsPerPage) || 1;

  // Filter & Sort for Order Reports
  const filteredOrderReports = useMemo(() => {
    return ORDER_REPORTS_DATA.filter(row => {
      const matchesSearch = row.item.toLowerCase().includes(effectiveOrderSearch.toLowerCase()) ||
                            row.orderId.toLowerCase().includes(effectiveOrderSearch.toLowerCase()) ||
                            row.category.toLowerCase().includes(effectiveOrderSearch.toLowerCase());
      
      const matchesDate = !orderDateFilter || row.date.includes(orderDateFilter);
      const matchesItem = orderItemFilter === 'all' || row.item === orderItemFilter;
      
      let matchesTime = true;
      if (orderTimeFilter === 'morning') matchesTime = row.time.includes('AM');
      else if (orderTimeFilter === 'afternoon') matchesTime = row.time.includes('PM') && (parseInt(row.time) >= 12 && parseInt(row.time) <= 4);
      else if (orderTimeFilter === 'evening') matchesTime = row.time.includes('PM') && parseInt(row.time) >= 5;

      return matchesSearch && matchesDate && matchesItem && matchesTime;
    }).sort((a, b) => {
      let aVal = a[orderSortField];
      let bVal = b[orderSortField];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return orderSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return orderSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [effectiveOrderSearch, orderDateFilter, orderTimeFilter, orderItemFilter, orderSortField, orderSortDirection]);

  // Paginated Order Reports
  const paginatedOrderReports = useMemo(() => {
    const start = (orderCurrentPage - 1) * orderRowsPerPage;
    return filteredOrderReports.slice(start, start + orderRowsPerPage);
  }, [filteredOrderReports, orderCurrentPage, orderRowsPerPage]);

  const totalOrderPages = Math.ceil(filteredOrderReports.length / orderRowsPerPage) || 1;

  // Sort Handler
  const handleAllSort = (field) => {
    if (allSortField === field) {
      setAllSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setAllSortField(field);
      setAllSortDirection('asc');
    }
  };

  const handleOrderSort = (field) => {
    if (orderSortField === field) {
      setOrderSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderSortField(field);
      setOrderSortDirection('asc');
    }
  };

  // Excel Downloads
  const downloadAllReportsExcel = () => {
    const exportData = filteredAllReports.map((item, index) => ({
      'S.No': index + 1,
      'Date': item.date,
      'Revenue (₹)': item.revenueVal,
      'Revenue Display': item.revenue,
      'No. of Orders': item.orders,
      'Target (₹)': item.targetVal,
      'Target Display': item.target,
      'Target Status': item.status,
      'Food Wastage': item.foodWastage
    }));

    triggerFileDownload(exportData, `Store_All_Reports_${new Date().toISOString().slice(0, 10)}`);
  };

  const downloadOrderReportsExcel = () => {
    const exportData = filteredOrderReports.map((item, index) => ({
      'S.No': index + 1,
      'Order ID': item.orderId,
      'Date': item.date,
      'Time': item.time,
      'Item Name': item.item,
      'Category': item.category,
      'Quantity': item.qty,
      'Amount (₹)': item.amount,
      'Payment Method': item.payment,
      'Status': item.status
    }));

    triggerFileDownload(exportData, `Store_Order_Reports_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <section className="reports-section" id="reports">
      <div className="section-header">
        <div>
          <h3 className="section-title">
            <FileText size={20} /> Order History & Store Reports
          </h3>
          <p className="section-subtitle">Comprehensive analytics, target auditing & order level logs</p>
        </div>
      </div>

      <div className="card">
        {/* Tabs Header */}
        <div className="tabs-header" style={{ padding: '0 1.5rem', paddingTop: '1rem' }}>
          <div className="tabs-list">
            <button 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <FileText size={18} />
              <span>All Reports</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag size={18} />
              <span>Order Reports</span>
            </button>
          </div>
        </div>

        {/* TAB 1: ALL REPORTS */}
        {activeTab === 'all' && (
          <div>
            {/* Table Controls */}
            <div className="table-controls">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search by date, revenue, orders..." 
                  value={allSearch}
                  onChange={(e) => { setAllSearch(e.target.value); setAllCurrentPage(1); }}
                />
              </div>

              <div className="filters-group">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Filter size={15} color="var(--text-muted)" />
                  <select 
                    className="filter-select"
                    value={allStatusFilter}
                    onChange={(e) => { setAllStatusFilter(e.target.value); setAllCurrentPage(1); }}
                  >
                    <option value="all">All Target Statuses</option>
                    <option value="Achieved">Achieved</option>
                    <option value="Not Achieved">Not Achieved</option>
                  </select>
                </div>

                <button className="btn-excel" onClick={downloadAllReportsExcel}>
                  <Download size={16} />
                  <span>Download Excel</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th onClick={() => handleAllSort('id')}>S.No <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleAllSort('date')}>Date <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleAllSort('revenueVal')}>Revenue <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleAllSort('orders')}>No. of Orders <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleAllSort('targetVal')}>Target <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleAllSort('status')}>Target Status <ArrowUpDown size={12} /></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAllReports.length > 0 ? (
                    paginatedAllReports.map((row, index) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          {(allCurrentPage - 1) * allRowsPerPage + index + 1}
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.date}</td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{row.revenue}</td>
                        <td>{row.orders} Orders</td>
                        <td style={{ color: 'var(--text-muted)' }}>{row.target}</td>
                        <td>
                          {row.status === 'Achieved' ? (
                            <span className="badge achieved">
                              <CheckCircle2 size={13} /> Achieved
                            </span>
                          ) : (
                            <span className="badge not-achieved">
                              <XCircle size={13} /> Not Achieved
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No report records matching your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-container">
              <div>
                Showing {filteredAllReports.length > 0 ? (allCurrentPage - 1) * allRowsPerPage + 1 : 0} to {Math.min(allCurrentPage * allRowsPerPage, filteredAllReports.length)} of {filteredAllReports.length} reports
              </div>
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  onClick={() => setAllCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={allCurrentPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalAllPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn ${p === allCurrentPage ? 'active' : ''}`}
                    onClick={() => setAllCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  className="page-btn" 
                  onClick={() => setAllCurrentPage(prev => Math.min(prev + 1, totalAllPages))}
                  disabled={allCurrentPage === totalAllPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER REPORTS */}
        {activeTab === 'orders' && (
          <div>
            {/* Table Controls */}
            <div className="table-controls">
              <div className="search-box">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Search order ID, item name, category..." 
                  value={orderSearch}
                  onChange={(e) => { setOrderSearch(e.target.value); setOrderCurrentPage(1); }}
                />
              </div>

              <div className="filters-group">
                {/* Time Filter */}
                <select 
                  className="filter-select"
                  value={orderTimeFilter}
                  onChange={(e) => { setOrderTimeFilter(e.target.value); setOrderCurrentPage(1); }}
                >
                  <option value="all">All Times</option>
                  <option value="morning">Morning (AM)</option>
                  <option value="afternoon">Lunch / Afternoon</option>
                  <option value="evening">Dinner / Evening</option>
                </select>

                {/* Item Filter */}
                <select 
                  className="filter-select"
                  value={orderItemFilter}
                  onChange={(e) => { setOrderItemFilter(e.target.value); setOrderCurrentPage(1); }}
                >
                  <option value="all">All Food Items</option>
                  <option value="Chicken Biryani">Chicken Biryani</option>
                  <option value="Veg Meals">Veg Meals</option>
                  <option value="Paneer Curry">Paneer Curry</option>
                  <option value="Veg Sandwich">Veg Sandwich</option>
                  <option value="Mutton Biryani">Mutton Biryani</option>
                </select>

                <button className="btn-excel" onClick={downloadOrderReportsExcel}>
                  <Download size={16} />
                  <span>Download Excel</span>
                </button>
              </div>
            </div>

            {/* Table Content */}
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th onClick={() => handleOrderSort('id')}>S.No <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleOrderSort('date')}>Date <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleOrderSort('time')}>Time <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleOrderSort('item')}>Item <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleOrderSort('qty')}>Qty <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleOrderSort('amount')}>Amount <ArrowUpDown size={12} /></th>
                    <th onClick={() => handleOrderSort('payment')}>Payment <ArrowUpDown size={12} /></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrderReports.length > 0 ? (
                    paginatedOrderReports.map((row, index) => (
                      <tr key={row.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          {(orderCurrentPage - 1) * orderRowsPerPage + index + 1}
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.date}</td>
                        <td style={{ color: 'var(--text-muted)' }}>
                          <Clock size={13} style={{ display: 'inline', marginRight: 4 }} />
                          {row.time}
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {row.item}
                          <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                            {row.orderId} • {row.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{row.qty}</td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{row.amount}</td>
                        <td>
                          <span className={`badge payment-${row.payment.toLowerCase()}`}>
                            {row.payment}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No orders matching the current filter parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="pagination-container">
              <div>
                Showing {filteredOrderReports.length > 0 ? (orderCurrentPage - 1) * orderRowsPerPage + 1 : 0} to {Math.min(orderCurrentPage * orderRowsPerPage, filteredOrderReports.length)} of {filteredOrderReports.length} orders
              </div>
              <div className="pagination-controls">
                <button 
                  className="page-btn" 
                  onClick={() => setOrderCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={orderCurrentPage === 1}
                >
                  &lt;
                </button>
                {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(p => (
                  <button
                    key={p}
                    className={`page-btn ${p === orderCurrentPage ? 'active' : ''}`}
                    onClick={() => setOrderCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  className="page-btn" 
                  onClick={() => setOrderCurrentPage(prev => Math.min(prev + 1, totalOrderPages))}
                  disabled={orderCurrentPage === totalOrderPages}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReportsSection;
