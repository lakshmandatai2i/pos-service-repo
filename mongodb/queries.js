// ─── MongoDB Shell Queries Reference (mongosh) ────────────────────────────────
// Connect via Docker: docker exec -it pos_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin pos_mongo_db

// =============================================================================
// 1. RESTAURANT TABLES QUERIES
// =============================================================================

// Fetch all tables for a store sorted by table number
db.restaurant_tables.find({ store_id: "STORE-001" }).sort({ table_number: 1 });

// Fetch a single table by table number
db.restaurant_tables.findOne({ store_id: "STORE-001", table_number: 1 });

// Update table status to occupied when items are selected
db.restaurant_tables.updateOne(
  { store_id: "STORE-001", table_number: 1 },
  { 
    $set: { 
      status: "occupied", 
      updated_at: new Date() 
    } 
  }
);

// Update table status when order is sent to kitchen
db.restaurant_tables.updateOne(
  { store_id: "STORE-001", table_number: 1 },
  { 
    $set: { 
      status: "order_sent", 
      ticketNo: "#8901",
      updated_at: new Date() 
    } 
  }
);

// Reset table to available when finished
db.restaurant_tables.updateOne(
  { store_id: "STORE-001", table_number: 1 },
  { 
    $set: { 
      status: "available", 
      orders: [], 
      ticketNo: null,
      updated_at: new Date() 
    } 
  }
);


// =============================================================================
// 2. MENU ITEMS QUERIES
// =============================================================================

// Fetch full menu list
db.menu_items.find().sort({ id: 1 });

// Fetch menu items by category
db.menu_items.find({ category: "Main Course" });

// Add new menu item
db.menu_items.insertOne({
  id: "010",
  name: "Paneer Butter Masala",
  price: 420.0,
  category: "Main Course"
});


// =============================================================================
// 3. KITCHEN ORDERS (KDS) QUERIES
// =============================================================================

// Insert new KDS order when waiter sends to kitchen
db.orders.insertOne({
  id: 1771490933000,
  ticketNo: "#8901",
  store_id: "STORE-001",
  tableNumber: 1,
  waiterName: "John",
  status: "pending",
  items: [
    { id: 1, itemName: "Butter Chicken", qty: 2, price: 600.0, note: "Mild spice" },
    { id: 2, itemName: "Garlic Naan", qty: 4, price: 120.0 }
  ],
  notes: "Serve hot",
  createdAt: new Date()
});

// Fetch active pending/preparing orders for Chef Display
db.orders.find({
  store_id: "STORE-001",
  status: { $in: ["pending", "preparing"] }
}).sort({ id: 1 });

// Chef accepts order -> Update status to 'preparing'
db.orders.updateOne(
  { id: 1771490933000 },
  { $set: { status: "preparing" } }
);

// Chef completes order -> Update status to 'completed' with timestamp
db.orders.updateOne(
  { id: 1771490933000 },
  { 
    $set: { 
      status: "completed", 
      preparedAt: new Date() 
    } 
  }
);


// =============================================================================
// 4. AGGREGATION & REPORTING QUERIES
// =============================================================================

// Count orders by status
db.orders.aggregate([
  { $match: { store_id: "STORE-001" } },
  { $group: { _id: "$status", totalOrders: { $sum: 1 } } }
]);

// Top selling items aggregation
db.orders.aggregate([
  { $unwind: "$items" },
  { 
    $group: { 
      _id: "$items.itemName", 
      totalQuantitySold: { $sum: "$items.qty" },
      totalRevenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } }
    } 
  },
  { $sort: { totalQuantitySold: -1 } }
]);
