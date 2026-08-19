import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://admin:admin123@localhost:3000/pos_mongo_db?authSource=admin")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "pos_mongo_db")

client: AsyncIOMotorClient = None
db = None

def get_database():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[MONGO_DB_NAME]
    return db

def close_database():
    global client
    if client:
        client.close()

