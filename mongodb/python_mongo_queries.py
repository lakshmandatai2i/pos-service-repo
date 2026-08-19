# ─── PyMongo / Motor Asynchronous Database Queries ─────────────────────────────
# Use this module to perform MongoDB operations inside FastAPI services

import datetime
from typing import List, Dict, Any, Optional

class MongoRepository:
    def __init__(self, db):
        self.db = db

    # ─── Restaurant Tables ───────────────────────────────────────────────────

    async def get_all_tables(self, store_id: str = "STORE-001") -> List[Dict[str, Any]]:
        cursor = self.db.restaurant_tables.find(
            {"store_id": store_id}, 
            {"_id": 0}
        ).sort("table_number", 1)
        return await cursor.to_list(length=100)

    async def get_table_by_number(self, table_number: int, store_id: str = "STORE-001") -> Optional[Dict[str, Any]]:
        return await self.db.restaurant_tables.find_one(
            {"store_id": store_id, "table_number": table_number},
            {"_id": 0}
        )

    async def update_table_status(self, table_number: int, status: str, store_id: str = "STORE-001") -> Optional[Dict[str, Any]]:
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        return await self.db.restaurant_tables.find_one_and_update(
            {"store_id": store_id, "table_number": table_number},
            {"$set": {"status": status, "updated_at": now_iso}},
            return_document=True
        )

    # ─── Menu Items ──────────────────────────────────────────────────────────

    async def get_menu(self) -> List[Dict[str, Any]]:
        cursor = self.db.menu_items.find({}, {"_id": 0}).sort("id", 1)
        return await cursor.to_list(length=200)

    # ─── Orders (KDS) ────────────────────────────────────────────────────────

    async def create_order(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        order_id = int(datetime.datetime.now(datetime.timezone.utc).timestamp() * 1000)
        ticket_no = f"#{8900 + order_data['tableNumber']}"

        new_order = {
            "id": order_id,
            "ticketNo": ticket_no,
            "tableNumber": order_data["tableNumber"],
            "store_id": order_data.get("store_id", "STORE-001"),
            "waiterName": order_data.get("waiterName", "John"),
            "status": "pending",
            "items": order_data["items"],
            "notes": order_data.get("notes"),
            "createdAt": now_iso
        }

        await self.db.orders.insert_one(new_order)
        new_order.pop("_id", None)

        # Update table status to 'preparing'
        await self.db.restaurant_tables.update_one(
            {"store_id": order_data.get("store_id", "STORE-001"), "table_number": order_data["tableNumber"]},
            {"$set": {"status": "preparing", "ticketNo": ticket_no, "orders": new_order["items"]}}
        )

        return new_order

    async def update_order_status(self, order_id: int, status: str) -> Optional[Dict[str, Any]]:
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        update_fields = {"status": status}
        if status == "completed":
            update_fields["preparedAt"] = now_iso

        order = await self.db.orders.find_one_and_update(
            {"id": order_id},
            {"$set": update_fields},
            return_document=True
        )
        if order:
            order.pop("_id", None)
        return order
