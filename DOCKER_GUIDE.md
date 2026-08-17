# PostgreSQL, pgAdmin & MongoDB Docker Setup Guide

This guide provides step-by-step instructions to run PostgreSQL, pgAdmin 4, and MongoDB using Docker Compose, along with a reference cheat sheet of useful Docker commands.

> 📖 **MongoDB Cheat Sheet:** For a complete list of interactive `mongosh` queries, see **[MONGODB_GUIDE.md](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/MONGODB_GUIDE.md)**.


---

## 🛠️ Prerequisites

1. **Docker Desktop** installed and running on your system.
   - [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. **Environment File (`.env`)** in the repository root directory.

---

## ⚙️ Service Ports & Environment Configuration

The containers are configured via environment variables in [`.env`](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/.env):

```env
# Local Docker PostgreSQL & pgAdmin Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=pos_db
POSTGRES_PORT=5432

PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin123
PGADMIN_PORT=5050
LOCAL_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pos_db

# Local Docker MongoDB Configuration
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=admin123
MONGO_INITDB_DATABASE=pos_mongo_db
MONGO_PORT=3000
MONGO_URI=mongodb://admin:admin123@localhost:3000/pos_mongo_db?authSource=admin
```

### Summary of Assigned Ports

| Service | Container | Host Port | Internal Container Port |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | `pos_postgres` | `5432` | `5432` |
| **pgAdmin 4** | `pos_pgadmin` | `5050` | `80` |
| **MongoDB** | `pos_mongodb` | **`3000`** | `27017` |

> **Note:** If port `3000`, `5432`, or `5050` is already in use by another application on your system, you can safely change `MONGO_PORT`, `POSTGRES_PORT`, or `PGADMIN_PORT` in `.env` without modifying `docker-compose.yml`.

---

## 🚀 Quick Start Guide

### 1. Start the Containers
Run all containers in detached (background) mode:
```bash
docker compose up -d
```

### 2. Check Container Status
Verify that all containers (`pos_postgres`, `pos_pgadmin`, `pos_mongodb`) are running:
```bash
docker compose ps
```

### 3. Access pgAdmin Web Dashboard
Open your web browser and navigate to:
👉 **[http://localhost:5050](http://localhost:5050)**

**Log in with:**
- **Email:** `admin@admin.com`
- **Password:** `admin123`

---

## 🔌 Connecting to Databases

### 1. Connecting pgAdmin to PostgreSQL
Once inside pgAdmin:
1. Click **Add New Server** (or right-click **Servers** $\rightarrow$ **Register** $\rightarrow$ **Server...**).
2. **General Tab:**
   - **Name:** `POS Local Postgres`
3. **Connection Tab:**
   - **Host name / address:** `postgres` *(inside Docker network)* **OR** `localhost` / `host.docker.internal`
   - **Port:** `5432`
   - **Maintenance database:** `pos_db`
   - **Username:** `postgres`
   - **Password:** `postgres`
4. Click **Save**.

### 2. Connecting to MongoDB
You can connect to MongoDB using MongoDB Compass, VS Code extensions, or backend connection strings:

- **Connection URI:** `mongodb://admin:admin123@localhost:3000/pos_mongo_db?authSource=admin`
- **Host:** `localhost` (or `127.0.0.1`)
- **Port:** `3000`
- **Username:** `admin`
- **Password:** `admin123`
- **Auth Source:** `admin`

---

## 🛑 Stopping & Managing Containers

| Action | Command | Description |
| :--- | :--- | :--- |
| **Stop Containers** | `docker compose stop` | Gracefully stops running containers without deleting them. |
| **Start Containers** | `docker compose start` | Restarts stopped containers. |
| **Restart Containers** | `docker compose restart` | Restarts all running services. |
| **Down (Remove)** | `docker compose down` | Stops and removes containers and networks (data volumes kept safe). |
| **Down + Wipe Data** | `docker compose down -v` | Stops and removes containers, networks, **and data volumes**. |

---

## 🔍 Useful Docker Commands Cheat Sheet

### 📊 Checking Status & Health
```bash
# View active running containers
docker ps

# View all containers (including stopped ones)
docker ps -a

# View container stats (CPU, Memory, Network usage)
docker stats
```

### 📜 Viewing Container Logs
```bash
# Stream live logs for all services
docker compose logs -f

# Stream logs for MongoDB only
docker compose logs -f mongodb

# Stream logs for PostgreSQL only
docker compose logs -f postgres

# Stream logs for pgAdmin only
docker compose logs -f pgadmin
```

### 💻 Executing Commands Inside Containers

#### Access MongoDB Shell (`mongosh` / `mongo`)
```bash
docker exec -it pos_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

#### Access PostgreSQL Interactive CLI (`psql`)
```bash
docker exec -it pos_postgres psql -U postgres -d pos_db
```

#### Open a Shell Inside Container
```bash
# Shell inside MongoDB container
docker exec -it pos_mongodb bash

# Shell inside Postgres container
docker exec -it pos_postgres sh

# Shell inside pgAdmin container
docker exec -it pos_pgadmin sh
```

---

## 🧹 Maintenance & Clean Up

### Rebuilding Containers After Changes
If you update `docker-compose.yml` or pull new images:
```bash
docker compose up -d --force-recreate
```

### Free Up Unused Docker Resources
Remove stopped containers, unused networks, and dangling images:
```bash
docker system prune -f
```

---

## ⚠️ Troubleshooting Common Issues

### 1. `error during connect...` (Docker Engine Not Running)
- **Fix:** Open Docker Desktop from your Windows Start Menu and wait until the status shows **Docker Engine is running**.

### 2. Port Collision on Port 3000 / 5432 / 5050
- **Cause:** Port `3000` is used by a web app or another service.
- **Fix:** Change `MONGO_PORT` in `.env`:
  ```env
  MONGO_PORT=3001
  ```
  Then re-run:
  ```bash
  docker compose up -d
  ```
