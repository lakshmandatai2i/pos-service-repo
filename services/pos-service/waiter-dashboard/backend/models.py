from typing import List, Optional
from pydantic import BaseModel, Field

class OrderItem(BaseModel):
    id: int
    itemName: str
    qty: int
    price: float
    note: Optional[str] = None
    isNew: Optional[bool] = False

class RestaurantTable(BaseModel):
    store_id: str = Field(default="STORE-001", description="Store ID identifier")
    store_name: str = Field(default="Spice Garden Main", description="Store name")
    table_number: int = Field(description="Unique table number within the store")
    status: str = Field(default="available", description="Status: available | occupied | preparing | ready")
    ticketNo: Optional[str] = None
    orders: List[OrderItem] = []

class TableCreate(BaseModel):
    store_id: str = "STORE-001"
    store_name: str = "Spice Garden Main"
    table_number: int
    status: str = "available"

class TableStatusUpdate(BaseModel):
    status: str  # available | occupied | preparing | ready

class KDSOrder(BaseModel):
    id: int
    ticketNo: str
    tableNumber: int
    store_id: str = "STORE-001"
    waiterName: Optional[str] = "John"
    status: str = "completed"  # pending | preparing | completed
    items: List[OrderItem]
    notes: Optional[str] = None
    paymentMethod: Optional[str] = "Card"
    grandTotal: Optional[float] = 0.0
    paymentStatus: Optional[str] = "COMPLETED"
    createdAt: str
    preparedAt: Optional[str] = None
    paidAt: Optional[str] = None

class OrderCreate(BaseModel):
    tableNumber: int
    store_id: str = "STORE-001"
    waiterName: Optional[str] = "John"
    items: List[OrderItem]
    notes: Optional[str] = None
    paymentMethod: Optional[str] = "Card"
    grandTotal: Optional[float] = 0.0
    paymentStatus: Optional[str] = "COMPLETED"

class OrderStatusUpdate(BaseModel):
    status: str  # pending | preparing | completed

class MenuItem(BaseModel):
    id: str
    name: str
    price: float
    category: str
