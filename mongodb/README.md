# MongoDB Docker & Queries Guide

This directory contains database scripts, queries, and initialization tools for MongoDB running in Docker.

---

## 1. Running MongoDB in Docker

MongoDB is configured in [`docker-compose.yml`](../docker-compose.yml) on port `3000` (mapping to internal port `27017`).

### Start Container:
```bash
docker compose up -d mongodb
```

### Check Container Status:
```bash
docker ps
```

---

## 2. Connecting to MongoDB Container

### Connect via Mongo Shell (`mongosh`):
```bash
docker exec -it pos_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin pos_mongo_db
```

### Connection URI for Python Backend & Client Tools:
```text
mongodb://admin:admin123@localhost:3000/pos_mongo_db?authSource=admin
```

---

## 3. Included Scripts & Queries

- **[`init-mongo.js`](init-mongo.js)**: Automatic Docker container database initializer.
- **[`queries.js`](queries.js)**: Full set of Mongo Shell queries for tables, menu, orders, and sales reporting.
- **[`python_mongo_queries.py`](python_mongo_queries.py)**: Async PyMongo / Motor repository functions for Python FastAPI backend integration.

---

## 4. Running Shell Queries File Directly
```bash
docker exec -i pos_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin pos_mongo_db < queries.js
```
