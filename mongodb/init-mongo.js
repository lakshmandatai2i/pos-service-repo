// ─── MongoDB Docker Initialization Script ─────────────────────────────────────
// Database: pos_mongo_db
// Mount this file into /docker-entrypoint-initdb.d/init-mongo.js in docker-compose

db = db.getSiblingDB('pos_mongo_db');

// Create Collections
db.createCollection('restaurant_tables');
db.createCollection('menu_items');
db.createCollection('orders');

// ─── Indexes ─────────────────────────────────────────────────────────────────
db.restaurant_tables.createIndex({ store_id: 1, table_number: 1 }, { unique: true });
db.menu_items.createIndex({ id: 1 }, { unique: true });
db.menu_items.createIndex({ category: 1 });
db.orders.createIndex({ id: 1 }, { unique: true });
db.orders.createIndex({ store_id: 1, status: 1 });
db.orders.createIndex({ tableNumber: 1, status: 1 });

// ─── Initial Tables Seed ─────────────────────────────────────────────────────
db.restaurant_tables.insertMany([
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 1, status: "available", orders: [], created_at: new Date(), updated_at: new Date() },
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 2, status: "available", orders: [], created_at: new Date(), updated_at: new Date() },
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 3, status: "available", orders: [], created_at: new Date(), updated_at: new Date() },
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 4, status: "available", orders: [], created_at: new Date(), updated_at: new Date() },
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 5, status: "available", orders: [], created_at: new Date(), updated_at: new Date() },
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 6, status: "available", orders: [], created_at: new Date(), updated_at: new Date() },
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 7, status: "available", orders: [], created_at: new Date(), updated_at: new Date() },
  { store_id: "STORE-001", store_name: "Spice Garden Main", table_number: 8, status: "available", orders: [], created_at: new Date(), updated_at: new Date() }
]);

// ─── Initial Menu Items Seed ─────────────────────────────────────────────────
db.menu_items.insertMany([
  { id: "001", name: "Butter Chicken", price: 600.0, category: "Main Course" },
  { id: "002", name: "Chicken Biryani", price: 550.0, category: "Main Course" },
  { id: "003", name: "Veg Biryani", price: 480.0, category: "Main Course" },
  { id: "004", name: "Paneer Tikka", price: 350.0, category: "Starters" },
  { id: "005", name: "Garlic Naan", price: 120.0, category: "Breads" },
  { id: "006", name: "Dal Makhani", price: 450.0, category: "Main Course" },
  { id: "007", name: "Sweet Lassi", price: 160.0, category: "Beverages" },
  { id: "008", name: "Mango Lassi", price: 180.0, category: "Beverages" },
  { id: "009", name: "Gulab Jamun", price: 150.0, category: "Desserts" }
]);

// ─── Initial Orders Seed ─────────────────────────────────────────────────────
db.orders.insertMany([
  {
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
    notes: "Serve appetizers first",
    createdAt: new Date()
  },
  {
    id: 1771490934000,
    ticketNo: "#8902",
    store_id: "STORE-001",
    tableNumber: 4,
    waiterName: "John",
    status: "preparing",
    items: [
      { id: 3, itemName: "Paneer Tikka", qty: 1, price: 350.0 },
      { id: 4, itemName: "Dal Makhani", qty: 2, price: 450.0 }
    ],
    notes: "Extra gravy",
    createdAt: new Date()
  }
]);

print("[OK] pos_mongo_db initialized and seeded successfully in Docker container.");
