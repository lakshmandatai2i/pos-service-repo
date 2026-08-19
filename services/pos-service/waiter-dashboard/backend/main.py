import datetime
from contextlib import asynccontextmanager
from typing import List
from fastapi import FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from database import get_database, close_database
from models import (
    RestaurantTable, TableCreate, TableStatusUpdate,
    KDSOrder, OrderCreate, OrderStatusUpdate,
    MenuItem
)

# ─── WebSocket Connection Manager ──────────────────────────────────────────────

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# ─── Seed Data Helper ─────────────────────────────────────────────────────────

DEFAULT_TABLES = [
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 1, "status": "available", "orders": []},
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 2, "status": "available", "orders": []},
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 3, "status": "available", "orders": []},
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 4, "status": "available", "orders": []},
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 5, "status": "available", "orders": []},
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 6, "status": "available", "orders": []},
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 7, "status": "available", "orders": []},
    {"store_id": "STORE-001", "store_name": "Spice Garden Main", "table_number": 8, "status": "available", "orders": []},
]

DEFAULT_MENU = [
    {"id": "001", "name": "Butter Chicken", "price": 600.0, "category": "Main Course"},
    {"id": "002", "name": "Chicken Biryani", "price": 550.0, "category": "Main Course"},
    {"id": "003", "name": "Veg Biryani", "price": 480.0, "category": "Main Course"},
    {"id": "004", "name": "Paneer Tikka", "price": 350.0, "category": "Starters"},
    {"id": "005", "name": "Garlic Naan", "price": 120.0, "category": "Breads"},
    {"id": "006", "name": "Dal Makhani", "price": 450.0, "category": "Main Course"},
    {"id": "007", "name": "Sweet Lassi", "price": 160.0, "category": "Beverages"},
    {"id": "008", "name": "Mango Lassi", "price": 180.0, "category": "Beverages"},
    {"id": "009", "name": "Gulab Jamun", "price": 150.0, "category": "Desserts"},
]

async def seed_initial_data():
    try:
        db = get_database()
        
        # Seed tables if collection is empty
        tables_count = await db.restaurant_tables.count_documents({})
        if tables_count == 0:
            await db.restaurant_tables.insert_many(DEFAULT_TABLES)
            print("[OK] Default restaurant tables seeded into MongoDB.")

        # Seed menu items if collection is empty
        menu_count = await db.menu_items.count_documents({})
        if menu_count == 0:
            await db.menu_items.insert_many(DEFAULT_MENU)
            print("[OK] Default menu items seeded into MongoDB.")
    except Exception:
        # Graceful fallback when local MongoDB is not running
        pass

# ─── FastAPI Lifespan ─────────────────────────────────────────────────────────



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await seed_initial_data()
    yield
    # Shutdown
    close_database()

app = FastAPI(
    title="Waiter Dashboard Backend Service",
    description="FastAPI service managing restaurant tables, orders, and real-time WebSocket syncing for Waiter & Kitchen dashboards.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Health Check Endpoint ───────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "waiter-dashboard-backend",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# ─── Restaurant Tables Endpoints ──────────────────────────────────────────────

@app.get("/api/tables", response_model=List[RestaurantTable], tags=["Restaurant Tables"])
async def get_tables(store_id: str = "STORE-001"):
    try:
        db = get_database()
        cursor = db.restaurant_tables.find({"store_id": store_id}, {"_id": 0}).sort("table_number", 1)
        tables = await cursor.to_list(length=100)
        if tables:
            return tables
    except Exception:
        pass
    return DEFAULT_TABLES

@app.post("/api/tables", response_model=RestaurantTable, status_code=status.HTTP_201_CREATED, tags=["Restaurant Tables"])
async def create_table(table: TableCreate):

    db = get_database()
    existing = await db.restaurant_tables.find_one({
        "store_id": table.store_id,
        "table_number": table.table_number
    })
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Table number {table.table_number} already exists for store {table.store_id}."
        )
    table_dict = table.model_dump()
    table_dict["orders"] = []
    await db.restaurant_tables.insert_one(table_dict)
    
    # Remove MongoDB internal _id before returning
    table_dict.pop("_id", None)
    return table_dict

@app.get("/api/tables/{table_number}", response_model=RestaurantTable, tags=["Restaurant Tables"])
async def get_table_by_number(table_number: int, store_id: str = "STORE-001"):

    db = get_database()
    table = await db.restaurant_tables.find_one(
        {"store_id": store_id, "table_number": table_number},
        {"_id": 0}
    )
    if not table:
        raise HTTPException(status_code=404, detail=f"Table {table_number} not found.")
    return table

@app.put("/api/tables/{table_number}/status", response_model=RestaurantTable, tags=["Restaurant Tables"])
async def update_table_status(table_number: int, update: TableStatusUpdate, store_id: str = "STORE-001"):
    result = None

    if not result:
        db = get_database()
        result = await db.restaurant_tables.find_one_and_update(
            {"store_id": store_id, "table_number": table_number},
            {"$set": {"status": update.status, "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}},
            return_document=True
        )
        if not result:
            raise HTTPException(status_code=404, detail=f"Table {table_number} not found.")
        result.pop("_id", None)

    return result

# ─── WebSocket KDS Endpoint ───────────────────────────────────────────────────

@app.websocket("/ws/kds")
async def websocket_kds_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send current active kitchen orders on WebSocket connect
        db = get_database()
        cursor = db.orders.find({"status": {"$ne": "completed"}}, {"_id": 0})
        active_orders = await cursor.to_list(length=100)
        await websocket.send_json({"type": "INITIAL_ORDERS", "orders": active_orders})
        
        while True:
            data = await websocket.receive_json()
            await manager.broadcast(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# ─── Orders Endpoints ─────────────────────────────────────────────────────────

@app.get("/api/orders", response_model=List[KDSOrder], tags=["Orders"])
async def get_orders(store_id: str = "STORE-001"):
    db = get_database()
    cursor = db.orders.find({"store_id": store_id}, {"_id": 0}).sort("id", -1)
    orders = await cursor.to_list(length=100)
    return orders

@app.post("/api/kitchen/orders", response_model=KDSOrder, status_code=status.HTTP_201_CREATED, tags=["Orders"])
async def create_kitchen_order(order_data: OrderCreate):
    order_id = int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)
    str_no = "".join(filter(str.isdigit, order_data.store_id or "001")).zfill(3) or "001"
    tbl_no = str(order_data.tableNumber).zfill(2)
    ticket_no = f"#{str_no}{tbl_no}"
    
    new_order = {
        "id": order_id,
        "ticketNo": ticket_no,
        "tableNumber": order_data.tableNumber,
        "store_id": order_data.store_id,
        "waiterName": order_data.waiterName,
        "status": "pending",
        "items": [item.model_dump() for item in order_data.items],
        "notes": order_data.notes,
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    # Broadcast kitchen order real-time over WebSocket to Chef KDS (Do NOT duplicate in MongoDB)
    await manager.broadcast({"type": "NEW_ORDER", "order": new_order})
    return new_order

@app.post("/api/orders", response_model=KDSOrder, status_code=status.HTTP_201_CREATED, tags=["Orders"])
async def create_order(order_data: OrderCreate):
    db = get_database()
    order_id = int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)
    str_no = "".join(filter(str.isdigit, order_data.store_id or "001")).zfill(3) or "001"
    tbl_no = str(order_data.tableNumber).zfill(2)
    ticket_no = f"#{str_no}{tbl_no}"
    
    # Preserve isNew flag on items when persisting paid transaction to MongoDB
    clean_items = []
    for item in order_data.items:
        item_dict = item.model_dump()
        item_dict["isNew"] = bool(item.isNew) if item.isNew is not None else False
        clean_items.append(item_dict)

    new_order = {
        "id": order_id,
        "ticketNo": ticket_no,
        "tableNumber": order_data.tableNumber,
        "store_id": order_data.store_id,
        "waiterName": order_data.waiterName,
        "status": "completed",
        "items": clean_items,
        "notes": order_data.notes or "",
        "paymentMethod": order_data.paymentMethod or "Card",
        "grandTotal": order_data.grandTotal or 0.0,
        "paymentStatus": order_data.paymentStatus or "COMPLETED",
        "createdAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "paidAt": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    # Save SINGLE completed paid transaction to MongoDB
    try:
        await db.orders.insert_one(new_order)
        new_order.pop("_id", None)
    except Exception as e:
        print(f"[WARN] Could not insert order into MongoDB: {e}")

    # Broadcast completed order
    await manager.broadcast({"type": "ORDER_PREPARED", "order": new_order})
    return new_order

@app.put("/api/orders/{order_id}/status", tags=["Orders"])
async def update_order_status(order_id: int, update: OrderStatusUpdate):
    db = get_database()
    now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
    update_fields = {"status": update.status}
    if update.status == "completed":
        update_fields["preparedAt"] = now_iso

    # Try updating MongoDB if order exists
    order = None
    try:
        order = await db.orders.find_one_and_update(
            {"$or": [{"id": order_id}, {"tableNumber": order_id}]},
            {"$set": update_fields},
            return_document=True
        )
        if order:
            order.pop("_id", None)
    except Exception as e:
        print(f"[WARN] MongoDB status update warning: {e}")

    if not order:
        tbl_no = str(order_id).zfill(2)
        order = {
            "id": order_id,
            "tableNumber": order_id,
            "ticketNo": f"#001{tbl_no}",
            "status": update.status,
            "updatedAt": now_iso
        }

    # ALWAYS broadcast status change real-time over WebSocket to Waiter and Chef dashboards!
    await manager.broadcast({"type": "STATUS_CHANGE", "order": order})

    # Prepare event notification payload
    notification = None
    if update.status == "completed":
        notification = {
            "id": int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000),
            "orderId": order_id,
            "ticketNo": order.get("ticketNo", f"#001{str(order_id).zfill(2)}"),
            "tableNumber": order_id,
            "message": f"Order for Table {order_id} is prepared!",
            "detail": f"Table {order_id} order is ready to serve.",
            "createdAt": now_iso
        }

    return {"status": "success", "order": order, "notification": notification}

# ─── Menu Endpoints ───────────────────────────────────────────────────────────

@app.get("/api/menu", response_model=List[MenuItem], tags=["Menu"])
async def get_menu():
    try:
        db = get_database()
        cursor = db.menu_items.find({}, {"_id": 0})
        items = await cursor.to_list(length=200)
        if items:
            return items
    except Exception:
        pass
    return DEFAULT_MENU
