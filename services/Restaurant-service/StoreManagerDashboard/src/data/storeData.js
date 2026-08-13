// Store Manager Dashboard - Mock Data & Store Metrics

const getCurrentFormattedDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const getCurrentShortDate = () => {
  const now = new Date();
  return now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, '-');
};

export const STORE_INFO = {
  name: "ABC Food Store",
  branch: "Indiranagar, Bengaluru",
  managerName: "Rajesh Sharma",
  role: "Store Manager",
  get date() {
    return getCurrentShortDate();
  },
  get formattedDate() {
    return getCurrentFormattedDate();
  }
};

export const KPI_DATA = {
  foodWastage: {
    value: "12.5 kg",
    numericValue: 12.5,
    unit: "kg",
    trend: "-4.2%",
    isPositiveTrend: true, // Lower wastage is positive
    comparisonText: "vs yesterday (13.1 kg)",
    details: "1.8 kg Rice, 2.5 kg Veggies, 8.2 kg Prepared Food"
  },
  totalOrders: {
    value: "156",
    numericValue: 156,
    trend: "+12.4%",
    isPositiveTrend: true,
    comparisonText: "vs yesterday (138)",
    details: "112 Online, 44 Dine-in / Takeaway"
  },
  lowestSaleItem: {
    name: "Veg Sandwich",
    salesCount: 14,
    revenue: "₹2,100",
    category: "Snacks",
    statusBadge: "Low Demand",
    recommendation: "Consider combo offers or price adjustment"
  },
  peakHours: {
    timeSlot: "12:00 PM - 2:00 PM",
    orderCount: 68,
    revenueShare: "42%",
    comparisonText: "Lunch Rush (Peak demand)",
    secondaryPeak: "7:30 PM - 9:00 PM (48 orders)"
  },
  highestSaleItem: {
    name: "Chicken Biryani",
    salesCount: 85,
    revenue: "₹21,250",
    category: "Main Course",
    percentageOfTotal: "46.5%",
    statusBadge: "Top Seller"
  }
};

export const TODAY_SALES_SUMMARY = {
  revenue: "₹45,680",
  revenueNumeric: 45680,
  ordersToday: "156 Orders",
  ordersNumeric: 156,
  foodQuantity: "325 Items",
  foodQuantityNumeric: 325,
  highestSaleItem: "Chicken Biryani",
  highestSaleQuantity: "85 Sold",
  targetToday: "₹40,000",
  targetNumeric: 40000,
  targetProgress: 114.2, // Percentage
  avgOrderValue: "₹292.82"
};

export const WEEKLY_TARGET_PROGRESS_DATA = [
  { day: "07 Aug", target: 40000, achieved: 38500, percentage: 96.2 },
  { day: "08 Aug", target: 40000, achieved: 42300, percentage: 105.7 },
  { day: "09 Aug", target: 40000, achieved: 39150, percentage: 97.8 },
  { day: "10 Aug", target: 40000, achieved: 45680, percentage: 114.2 },
  { day: "11 Aug", target: 42000, achieved: 47200, percentage: 112.3 },
  { day: "12 Aug", target: 45000, achieved: 51800, percentage: 115.1 },
  { day: "13 Aug", target: 45000, achieved: 49400, percentage: 109.7 }
];

export const FOOD_QTY_VS_WASTAGE_DATA = [
  { day: "07 Aug", foodPrepared: 320, foodSold: 285, foodWastedKg: 14.2 },
  { day: "08 Aug", foodPrepared: 350, foodSold: 315, foodWastedKg: 11.8 },
  { day: "09 Aug", foodPrepared: 330, foodSold: 298, foodWastedKg: 13.1 },
  { day: "10 Aug", foodPrepared: 370, foodSold: 332, foodWastedKg: 12.5 },
  { day: "11 Aug", foodPrepared: 410, foodSold: 375, foodWastedKg: 10.9 },
  { day: "12 Aug", foodPrepared: 460, foodSold: 412, foodWastedKg: 15.0 },
  { day: "13 Aug", foodPrepared: 440, foodSold: 395, foodWastedKg: 13.4 }
];

export const REALTIME_CUSTOMERS_INITIAL = [
  { time: "9:00 AM", count: 18 },
  { time: "10:00 AM", count: 34 },
  { time: "11:00 AM", count: 58 },
  { time: "12:00 PM", count: 112 },
  { time: "1:00 PM", count: 148 },
  { time: "2:00 PM", count: 165 },
  { time: "3:00 PM", count: 182 },
  { time: "Current Live", count: 195 }
];

export const REALTIME_ITEM_INVENTORY_DATA = [
  { sno: 1, item: "Chicken Biryani", qtyPrepared: 120, qtyRemaining: 35 },
  { sno: 2, item: "Veg Meals", qtyPrepared: 60, qtyRemaining: 18 },
  { sno: 3, item: "Paneer Butter Masala", qtyPrepared: 45, qtyRemaining: 7 },
  { sno: 4, item: "Mutton Biryani", qtyPrepared: 40, qtyRemaining: 8 },
  { sno: 5, item: "Butter Naan", qtyPrepared: 150, qtyRemaining: 22 },
  { sno: 6, item: "Chicken 65", qtyPrepared: 50, qtyRemaining: 9 },
  { sno: 7, item: "Veg Sandwich", qtyPrepared: 30, qtyRemaining: 16 },
  { sno: 8, item: "Mango Lassi", qtyPrepared: 80, qtyRemaining: 15 },
  { sno: 9, item: "Gulab Jamun", qtyPrepared: 50, qtyRemaining: 4 },
  { sno: 10, item: "Cold Coffee", qtyPrepared: 40, qtyRemaining: 12 }
];

export const HOURLY_SALES_TREND = [
  { hour: "8 AM", orders: 4, revenue: 950 },
  { hour: "9 AM", orders: 8, revenue: 1800 },
  { hour: "10 AM", orders: 12, revenue: 2600 },
  { hour: "11 AM", orders: 16, revenue: 3900 },
  { hour: "12 PM", orders: 32, revenue: 9800 },
  { hour: "1 PM", orders: 36, revenue: 11400 },
  { hour: "2 PM", orders: 14, revenue: 3900 },
  { hour: "3 PM", orders: 7, revenue: 1650 },
  { hour: "4 PM", orders: 9, revenue: 1950 },
  { hour: "5 PM", orders: 11, revenue: 2400 },
  { hour: "6 PM", orders: 15, revenue: 3800 },
  { hour: "7 PM", orders: 24, revenue: 6700 },
  { hour: "8 PM", orders: 22, revenue: 6100 },
  { hour: "9 PM", orders: 10, revenue: 2900 },
  { hour: "10 PM", orders: 3, revenue: 780 }
];

export const CATEGORY_DISTRIBUTION = [
  { category: "Main Course", sales: 142, revenue: 31200, percentage: 68 },
  { category: "Starters & Snacks", sales: 98, revenue: 8900, percentage: 19 },
  { category: "Beverages & Desserts", sales: 85, revenue: 5580, percentage: 13 }
];

export const ALL_REPORTS_DATA = [
  { id: 1, date: "10-Aug-2026", revenue: "₹45,680", revenueVal: 45680, orders: 156, target: "₹40,000", targetVal: 40000, status: "Achieved", foodWastage: "12.5 kg" },
  { id: 2, date: "09-Aug-2026", revenue: "₹38,450", revenueVal: 38450, orders: 132, target: "₹40,000", targetVal: 40000, status: "Not Achieved", foodWastage: "13.1 kg" },
  { id: 3, date: "08-Aug-2026", revenue: "₹42,300", revenueVal: 42300, orders: 148, target: "₹40,000", targetVal: 40000, status: "Achieved", foodWastage: "11.8 kg" },
  { id: 4, date: "07-Aug-2026", revenue: "₹48,900", revenueVal: 48900, orders: 165, target: "₹42,000", targetVal: 42000, status: "Achieved", foodWastage: "14.2 kg" },
  { id: 5, date: "06-Aug-2026", revenue: "₹39,150", revenueVal: 39150, orders: 130, target: "₹40,000", targetVal: 40000, status: "Not Achieved", foodWastage: "10.9 kg" },
  { id: 6, date: "05-Aug-2026", revenue: "₹41,800", revenueVal: 41800, orders: 142, target: "₹40,000", targetVal: 40000, status: "Achieved", foodWastage: "12.0 kg" },
  { id: 7, date: "04-Aug-2026", revenue: "₹44,200", revenueVal: 44200, orders: 151, target: "₹40,000", targetVal: 40000, status: "Achieved", foodWastage: "11.5 kg" },
  { id: 8, date: "03-Aug-2026", revenue: "₹36,900", revenueVal: 36900, orders: 124, target: "₹38,000", targetVal: 38000, status: "Not Achieved", foodWastage: "13.8 kg" },
  { id: 9, date: "02-Aug-2026", revenue: "₹52,400", revenueVal: 52400, orders: 182, target: "₹45,000", targetVal: 45000, status: "Achieved", foodWastage: "15.0 kg" },
  { id: 10, date: "01-Aug-2026", revenue: "₹49,750", revenueVal: 49750, orders: 170, target: "₹45,000", targetVal: 45000, status: "Achieved", foodWastage: "13.4 kg" },
  { id: 11, date: "31-Jul-2026", revenue: "₹43,100", revenueVal: 43100, orders: 146, target: "₹40,000", targetVal: 40000, status: "Achieved", foodWastage: "12.1 kg" },
  { id: 12, date: "30-Jul-2026", revenue: "₹37,800", revenueVal: 37800, orders: 128, target: "₹40,000", targetVal: 40000, status: "Not Achieved", foodWastage: "11.2 kg" }
];

export const ORDER_REPORTS_DATA = [
  { id: 1, date: "10-Aug-2026", time: "10:15 AM", orderId: "ORD-9081", item: "Chicken Biryani", category: "Main Course", qty: 2, amount: 500, payment: "UPI", status: "Completed" },
  { id: 2, date: "10-Aug-2026", time: "10:30 AM", orderId: "ORD-9082", item: "Veg Meals", category: "Main Course", qty: 1, amount: 150, payment: "Card", status: "Completed" },
  { id: 3, date: "10-Aug-2026", time: "11:05 AM", orderId: "ORD-9083", item: "Chicken Biryani", category: "Main Course", qty: 3, amount: 750, payment: "UPI", status: "Completed" },
  { id: 4, date: "10-Aug-2026", time: "11:30 AM", orderId: "ORD-9084", item: "Paneer Curry", category: "Main Course", qty: 1, amount: 220, payment: "Cash", status: "Completed" },
  { id: 5, date: "10-Aug-2026", time: "12:10 PM", orderId: "ORD-9085", item: "Chicken Biryani", category: "Main Course", qty: 4, amount: 1000, payment: "UPI", status: "Completed" },
  { id: 6, date: "10-Aug-2026", time: "12:25 PM", orderId: "ORD-9086", item: "Mutton Biryani", category: "Main Course", qty: 2, amount: 700, payment: "Card", status: "Completed" },
  { id: 7, date: "10-Aug-2026", time: "12:40 PM", orderId: "ORD-9087", item: "Veg Sandwich", category: "Snacks", qty: 2, amount: 160, payment: "UPI", status: "Completed" },
  { id: 8, date: "10-Aug-2026", time: "01:05 PM", orderId: "ORD-9088", item: "Chicken Biryani", category: "Main Course", qty: 5, amount: 1250, payment: "UPI", status: "Completed" },
  { id: 9, date: "10-Aug-2026", time: "01:20 PM", orderId: "ORD-9089", item: "Butter Naan & Chicken Tikka", category: "Main Course", qty: 3, amount: 690, payment: "Cash", status: "Completed" },
  { id: 10, date: "10-Aug-2026", time: "01:45 PM", orderId: "ORD-9090", item: "Mango Lassi", category: "Beverages", qty: 4, amount: 320, payment: "UPI", status: "Completed" },
  { id: 11, date: "10-Aug-2026", time: "02:10 PM", orderId: "ORD-9091", item: "Chicken Biryani", category: "Main Course", qty: 2, amount: 500, payment: "Card", status: "Completed" },
  { id: 12, date: "10-Aug-2026", time: "02:50 PM", orderId: "ORD-9092", item: "Veg Fried Rice", category: "Main Course", qty: 1, amount: 180, payment: "UPI", status: "Completed" },
  { id: 13, date: "10-Aug-2026", time: "03:30 PM", orderId: "ORD-9093", item: "Cold Coffee", category: "Beverages", qty: 2, amount: 240, payment: "UPI", status: "Completed" },
  { id: 14, date: "10-Aug-2026", time: "04:15 PM", orderId: "ORD-9094", item: "Samosa Chaat", category: "Snacks", qty: 3, amount: 180, payment: "Cash", status: "Completed" },
  { id: 15, date: "10-Aug-2026", time: "05:00 PM", orderId: "ORD-9095", item: "Masala Chai", category: "Beverages", qty: 5, amount: 150, payment: "UPI", status: "Completed" },
  { id: 16, date: "10-Aug-2026", time: "06:30 PM", orderId: "ORD-9096", item: "Chicken 65", category: "Starters", qty: 2, amount: 480, payment: "Card", status: "Completed" },
  { id: 17, date: "10-Aug-2026", time: "07:15 PM", orderId: "ORD-9097", item: "Chicken Biryani", category: "Main Course", qty: 4, amount: 1000, payment: "UPI", status: "Completed" },
  { id: 18, date: "10-Aug-2026", time: "07:45 PM", orderId: "ORD-9098", item: "Paneer Butter Masala & Roti", category: "Main Course", qty: 2, amount: 440, payment: "UPI", status: "Completed" },
  { id: 19, date: "10-Aug-2026", time: "08:20 PM", orderId: "ORD-9099", item: "Chicken Biryani", category: "Main Course", qty: 3, amount: 750, payment: "Cash", status: "Completed" },
  { id: 20, date: "10-Aug-2026", time: "09:00 PM", orderId: "ORD-9100", item: "Gulab Jamun", category: "Desserts", qty: 4, amount: 200, payment: "UPI", status: "Completed" },
  { id: 21, date: "09-Aug-2026", time: "12:30 PM", orderId: "ORD-8940", item: "Veg Meals", category: "Main Course", qty: 2, amount: 300, payment: "UPI", status: "Completed" },
  { id: 22, date: "09-Aug-2026", time: "01:15 PM", orderId: "ORD-8945", item: "Chicken Biryani", category: "Main Course", qty: 4, amount: 1000, payment: "Card", status: "Completed" },
  { id: 23, date: "09-Aug-2026", time: "07:30 PM", orderId: "ORD-8980", item: "Chicken Biryani", category: "Main Course", qty: 3, amount: 750, payment: "UPI", status: "Completed" },
  { id: 24, date: "08-Aug-2026", time: "01:00 PM", orderId: "ORD-8810", item: "Paneer Curry", category: "Main Course", qty: 2, amount: 440, payment: "Cash", status: "Completed" },
  { id: 25, date: "08-Aug-2026", time: "08:15 PM", orderId: "ORD-8855", item: "Mutton Biryani", category: "Main Course", qty: 3, amount: 1050, payment: "UPI", status: "Completed" }
];

export const AI_STATIC_INSIGHTS = [
  {
    id: 1,
    category: "Revenue & Sales",
    badge: "Positive Trend",
    type: "success",
    title: "Revenue Surge",
    description: "Today's revenue (₹45,680) is 18.8% higher than yesterday's sales (₹38,450) and has exceeded today's target of ₹40,000 by 14.2%.",
    action: "Maintain current item stock for dinner peak."
  },
  {
    id: 2,
    category: "Best Seller",
    badge: "Top Performer",
    type: "info",
    title: "Chicken Biryani Dominance",
    description: "Chicken Biryani is the highest-selling item today with 85 orders, generating ₹21,250 (46.5% of total store revenue).",
    action: "Ensure kitchen raw material prep for tomorrow."
  },
  {
    id: 3,
    category: "Operational Efficiency",
    badge: "Peak Schedule",
    type: "primary",
    title: "Peak Sales Window",
    description: "Peak sales occur between 12:00 PM and 2:00 PM, generating 68 orders (42% of total daily volume). A secondary rush occurs at 7:30 PM - 9:00 PM.",
    action: "Optimize staff shifts around 11:30 AM and 7:00 PM."
  },
  {
    id: 4,
    category: "Inventory & Wastage",
    badge: "Attention Needed",
    type: "warning",
    title: "Food Wastage Monitoring",
    description: "Food wastage recorded at 12.5 kg today (reduced by 4.2% from 13.1 kg yesterday), mostly driven by evening buffet leftovers.",
    action: "Adjust batch preparation sizes after 8:30 PM."
  },
  {
    id: 5,
    category: "Target Milestone",
    badge: "Goal Achieved",
    type: "success",
    title: "Daily Target Milestone",
    description: "Sales target of ₹40,000 has been achieved at 6:45 PM today. Expected end-of-day projection: ~₹48,000.",
    action: "Target status set to 'Achieved' in reports."
  },
  {
    id: 6,
    category: "Low Sales Item",
    badge: "Menu Optimization",
    type: "error",
    title: "Veg Sandwich Underperforming",
    description: "Veg Sandwich is currently the lowest-selling item with only 14 sales (₹2,100 total revenue).",
    action: "Consider promotional bundling with Cold Coffee or Combo pricing."
  }
];

export const CHATBOT_PRESET_QUESTIONS = [
  "What is today's highest-selling item?",
  "What are today's sales and revenue?",
  "Which item has the lowest sales?",
  "What are today's peak hours?",
  "How much food wastage was recorded today?",
  "Have we achieved today's sales target?"
];

export function getChatbotResponse(userMessage) {
  const query = userMessage.toLowerCase().trim();

  if (query.includes("highest") || query.includes("best selling") || query.includes("top selling") || query.includes("chicken biryani")) {
    return {
      text: "🍗 **Chicken Biryani** is today's highest-selling item with **85 orders** sold, generating **₹21,250** in revenue (46.5% of today's total revenue).",
      metrics: [
        { label: "Item", value: "Chicken Biryani" },
        { label: "Qty Sold", value: "85 Units" },
        { label: "Revenue", value: "₹21,250" }
      ]
    };
  }

  if (query.includes("sale") || query.includes("revenue") || query.includes("today's sale") || query.includes("today sales") || query.includes("total order")) {
    return {
      text: "📊 **Today's Store Performance Summary:**\n• **Total Revenue:** ₹45,680\n• **Total Orders:** 156 Orders\n• **Food Quantity Sold:** 325 Items\n• **Target Status:** Achieved (Target: ₹40,000)",
      metrics: [
        { label: "Revenue", value: "₹45,680" },
        { label: "Orders", value: "156" },
        { label: "Target", value: "₹40,000 (114%)" }
      ]
    };
  }

  if (query.includes("lowest") || query.includes("least") || query.includes("veg sandwich")) {
    return {
      text: "🥪 **Veg Sandwich** is today's lowest-selling item with only **14 sales** (totaling ₹2,100). \n\n*AI Recommendation:* Consider pairing it as a combo with beverages like Cold Coffee or Mango Lassi.",
      metrics: [
        { label: "Lowest Item", value: "Veg Sandwich" },
        { label: "Sales Count", value: "14" },
        { label: "Total Revenue", value: "₹2,100" }
      ]
    };
  }

  if (query.includes("peak") || query.includes("busiest") || query.includes("hours") || query.includes("time")) {
    return {
      text: "⏰ Today's primary **Peak Hours** occurred between **12:00 PM and 2:00 PM** (Lunch Rush), recording **68 orders**. A secondary peak occurred from **7:30 PM to 9:00 PM** (Dinner Rush) with **48 orders**.",
      metrics: [
        { label: "Lunch Peak", value: "12:00 PM - 2:00 PM" },
        { label: "Peak Orders", value: "68 Orders" },
        { label: "Dinner Peak", value: "7:30 PM - 9:00 PM" }
      ]
    };
  }

  if (query.includes("wastage") || query.includes("waste") || query.includes("food waste")) {
    return {
      text: "♻️ Today's **Food Wastage** was **12.5 kg** (a 4.2% reduction compared to yesterday's 13.1 kg). \n\nBreakdown: 1.8 kg Rice, 2.5 kg Vegetables, and 8.2 kg Prepared Food.",
      metrics: [
        { label: "Today Wastage", value: "12.5 kg" },
        { label: "Yesterday", value: "13.1 kg" },
        { label: "Change", value: "-4.2% (Improved)" }
      ]
    };
  }

  if (query.includes("target") || query.includes("goal") || query.includes("achieved")) {
    return {
      text: "🎯 **Yes!** Today's sales target of **₹40,000** was achieved at **6:45 PM**. Current revenue stands at **₹45,680** (114.2% of target).",
      metrics: [
        { label: "Daily Target", value: "₹40,000" },
        { label: "Achieved", value: "₹45,680" },
        { label: "Status", value: "Achieved ✅" }
      ]
    };
  }

  return {
    text: `Hello Manager! Here is a quick summary for ABC Food Store today:\n• Revenue: ₹45,680 (156 Orders)\n• Top Seller: Chicken Biryani (85 sold)\n• Wastage: 12.5 kg\n• Target Status: Achieved\n\nHow else can I assist you with store operations?`,
    metrics: []
  };
}
