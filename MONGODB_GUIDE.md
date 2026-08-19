# MongoDB Commands & Operations Guide (`mongosh`)

This guide contains essential MongoDB commands for managing databases, collections, and performing CRUD operations inside the `mongosh` interactive shell.

---

## 🔌 1. Accessing MongoDB Shell (`mongosh`)

Run this command in your PowerShell / Terminal to connect to the Docker container:

```bash
docker exec -it pos_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### Connection Details Summary
- **Host Port:** `3000` (mapped to container `27017`)
- **Username:** `admin`
- **Password:** `admin123`
- **Database:** `pos_mongo_db`
- **Connection URI (for GUI tools like MongoDB Compass or Node.js apps):**
  ```text
  mongodb://admin:admin123@localhost:3000/pos_mongo_db?authSource=admin
  ```

---

## 🗄️ 2. Database & Collection Operations

Once inside `mongosh` (`test> ` prompt):

| Operation | Command | Description |
| :--- | :--- | :--- |
| **Switch Database** | `use pos_mongo_db` | Switches to `pos_mongo_db` (creates it automatically on first insert). |
| **Show Current DB** | `db` | Displays the name of the database currently in use. |
| **List All Databases** | `show dbs` | Lists all existing databases with their sizes. |
| **List Collections** | `show collections` | Lists all collections (tables) in the current database. |
| **Create Users Collection** | `db.createCollection("users")` | Explicitly creates a new collection named `users`. |

---

## 👤 3. Users Collection JSON Schema & Seed Data

The POS application uses the [`users`](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/users.json) collection for storing user credentials, roles, and corporate IDs.

### Supported Roles
1. `STORE_MANAGER`
2. `DISTRICT_MANAGER`
3. `REGIONAL_MANAGER`
4. `CORPORATE`

### JSON Document Structure
```json
{
  "userid": "USR-1001",
  "username": "store_manager",
  "password": "password123",
  "role": "STORE_MANAGER",
  "corporate_id": "CORP-001"
}
```

### Seed Users Data in `mongosh`
Copy and paste this snippet directly into your `mongosh` terminal (`use pos_mongo_db` first):

```javascript
use pos_mongo_db;

db.users.insertMany([
  {
    userid: "USR-1001",
    username: "store_manager",
    password: "password123",
    role: "STORE_MANAGER",
    corporate_id: "CORP-001"
  },
  {
    userid: "USR-1002",
    username: "district_manager",
    password: "password123",
    role: "DISTRICT_MANAGER",
    corporate_id: "CORP-001"
  },
  {
    userid: "USR-1003",
    username: "regional_manager",
    password: "password123",
    role: "REGIONAL_MANAGER",
    corporate_id: "CORP-001"
  },
  {
    userid: "USR-1004",
    username: "corporate_admin",
    password: "password123",
    role: "CORPORATE",
    corporate_id: "CORP-001"
  },
  {
    userid: "USR-1005",
    username: "Adminstrator",
    password: "password123",
    role: "ADMIN",
    corporate_id: "CORP-001"
  }
]);
```

### Import `users.json` via Docker CLI Command
You can also import the entire [`users.json`](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/users.json) file directly into MongoDB using Docker:

```bash
docker exec -i pos_mongodb mongoimport --username admin --password admin123 --authenticationDatabase admin --db pos_mongo_db --collection users --jsonArray < users.json
```



---

## 📝 4. CRUD Operations (Create, Read, Update, Delete)


Make sure you run `use pos_mongo_db` before executing these queries.

### ➕ Create (Insert Documents)

#### Insert a Single Order
```javascript
use pos_mongo_db;

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
  notes: "Serve appetizers first",
  createdAt: new Date()
})
```

#### Insert Multiple Orders
```javascript
use pos_mongo_db;

db.orders.insertMany([
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
  },
  {
    id: 1771490935000,
    ticketNo: "#8903",
    store_id: "STORE-001",
    tableNumber: 2,
    waiterName: "Sarah",
    status: "completed",
    items: [
      { id: 5, itemName: "Chicken Biryani", qty: 2, price: 550.0 },
      { id: 6, itemName: "Mango Lassi", qty: 2, price: 180.0 }
    ],
    createdAt: new Date(),
    preparedAt: new Date()
  }
])
```

---

### 🔍 Read (Query Documents)

#### Fetch All Documents
```javascript
db.orders.find()
```

#### Format JSON Output nicely
```javascript
db.orders.find().pretty()
```

#### Query with Filtering Criteria
```javascript
// Find orders with status 'PENDING'
db.orders.find({ status: "PENDING" })

// Find orders with totalAmount greater than 20
db.orders.find({ totalAmount: { $gt: 20 } })
```

#### Find Single Document
```javascript
db.orders.findOne({ orderId: "ORD-101" })
```

---

### ✏️ Update Documents

#### Update a Single Document
```javascript
db.orders.updateOne(
  { orderId: "ORD-101" },
  { $set: { status: "COMPLETED", updatedAt: new Date() } }
)
```

#### Update Multiple Documents
```javascript
db.orders.updateMany(
  { status: "PENDING" },
  { $set: { status: "PREPARING", updatedAt: new Date() } }
)
```

---

### 🗑️ Delete Documents

#### Delete a Single Document
```javascript
db.orders.deleteOne({ orderId: "ORD-101" })
```

#### Delete Multiple Documents
```javascript
db.orders.deleteMany({ status: "CANCELLED" })
```

---

## ⚡ 4. Indexes & Performance

```javascript
# View existing indexes
db.orders.getIndexes()

# Create a unique index on orderId
db.orders.createIndex({ orderId: 1 }, { unique: true })
```

---

## 🧹 5. Clean Up & Drop Operations

```javascript
# Drop a collection
db.orders.drop()

# Drop current active database
db.dropDatabase()
```

---

## 🚪 6. Exit `mongosh` Shell

```javascript
exit
```
*(or press `Ctrl + C` twice)*
