# 🚀 Complete Supabase Setup, Connection Parameters & Environment Guide

This guide explains how **Supabase** is connected, the exact parameters required for connection, how the single `.env` file is configured, and how to run connection verification tests.

---

## 📋 Table of Contents

1. [How Supabase is Connected & Required Parameters](#1-how-supabase-is-connected--required-parameters)
2. [Single `.env` Environment Configuration](#2-single-env-environment-configuration)
3. [Step-by-Step Supabase Connection Setup](#3-step-by-step-supabase-connection-setup)
4. [Verifying Connection with the Test Script](#4-verifying-connection-with-the-test-script)
5. [Troubleshooting & Common Issues](#5-troubleshooting--common-issues)

---

## 1. How Supabase is Connected & Required Parameters

Supabase connects to your web application using HTTP REST APIs and WebSockets over TLS (HTTPS). Communication is established using **two mandatory parameters** and **two optional parameters**:

### Required Connection Parameters

1. **Supabase URL (`VITE_SUPABASE_URL` / `SUPABASE_URL`)**
   - **Format**: `https://<your-project-ref>.supabase.co`
   - **Role**: This is the API gateway endpoint generated for your project. Every database query, authentication check, or storage upload is sent to this host.

2. **Publishable / Anon API Key (`VITE_SUPABASE_PUBLISHABLE_KEY` / `VITE_SUPABASE_ANON_KEY`)**
   - **Format**: `sb_publishable_...` or `eyJhbGciOi...`
   - **Role**: This is your client-side public key. It identifies your application and passes Row Level Security (RLS) policies in PostgreSQL.

### Optional Server Connection Parameters

3. **Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)**
   - **Role**: Secret admin key used only in backend Node.js environments. It bypasses Row Level Security (RLS). **NEVER expose this key in client-side code or documentation!**

4. **Direct Database Connection URL (`DATABASE_URL`)**
   - **Format**: `postgresql://postgres:[PASSWORD]@db.<your-project-ref>.supabase.co:5432/postgres`
   - **Role**: Used by ORMs (Prisma, Drizzle, TypeORM) or direct SQL tools connecting over PostgreSQL port `5432` or pooler port `6543`.

---

### How the Client Connection Works Under the Hood

When `createClient(url, key)` is invoked from [`supabase/supabaseClient.js`](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/supabase/supabaseClient.js):

```javascript
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
```

1. The SDK constructs an HTTP client pointing to `https://<your-project-ref>.supabase.co/rest/v1/`.
2. Every request attaches the following HTTP Headers automatically:
   - `apikey: <YOUR_PUBLISHABLE_KEY>`
   - `Authorization: Bearer <YOUR_PUBLISHABLE_KEY>`
3. PostgreSQL evaluates the request against **Row Level Security (RLS)** rules defined in your database tables.

---

## 2. Single `.env` Environment Configuration

All environment configurations are stored in **one `.env` file** located inside the repository (never committed to Git):

```text
pos-service-repo/
├── .env                  <-- Single .env file containing project secrets (Git Ignored)
├── .env.example          <-- Template blueprint checked into Git
├── package.json
├── test-supabase.js
├── supabase/
│   ├── schema.sql
│   └── supabaseClient.js
└── services/
```

### Environment File Template (`.env.example`)

```env
# ==============================================================================
# SUPABASE ENVIRONMENT CONFIGURATION
# Replace placeholders below with your actual credentials from Supabase Dashboard
# ==============================================================================

# API Endpoint Gateway URL
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_URL=https://your-project-ref.supabase.co

# Client-side Public Key
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key-here
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_ANON_KEY=your-anon-public-key-here

# Optional Admin Key (Server-side ONLY)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Direct Database Connection (Optional)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-ref.supabase.co:5432/postgres
```

> 🔒 **Security Best Practice**:
>
> - **`.env`**: Contains actual private credentials. Listed in `.gitignore` so secrets are never pushed to GitHub.
> - **`.env.example`**: Safe blueprint file with dummy placeholders committed to Git for team reference.

---

## 3. Step-by-Step Supabase Connection Setup

### Step A: Install Client Package

In your project directory, install `@supabase/supabase-js`:

```bash
npm install @supabase/supabase-js
```

### Step B: Create Supabase Client Helper

The helper is located at [`supabase/supabaseClient.js`](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/supabase/supabaseClient.js):

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL));

const supabaseKey =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      import.meta.env.VITE_SUPABASE_ANON_KEY)) ||
  (typeof process !== "undefined" &&
    process.env &&
    (process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY));

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### Step C: Use Supabase in a React Component

```javascript
import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export function MenuItems() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await supabase.from("items").select("*");
      if (error) console.error("Error fetching items:", error);
      else setItems(data);
    }
    loadItems();
  }, []);

  return (
    <div>
      <h2>Menu Items</h2>
      {items.map((item) => (
        <div key={item.id}>
          {item.name} - ₹{item.price}
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Verifying Connection with the Test Script

A connection test script is available at [`test-supabase.js`](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/test-supabase.js).

### Running the Verification Test

Execute the test script inside `pos-service-repo`:

```bash
node test-supabase.js
```

### Expected Output

```text
--------------------------------------------------
  🔍 SUPABASE CONNECTION TEST
--------------------------------------------------
📡 Target Supabase URL: https://your-project-ref.supabase.co
🔑 Using Key Prefix: sb_publishable_...
⏳ Sending test query to endpoint: /rest/v1/items...
✅ SUCCESS: Connected to Supabase REST API successfully!
📊 Response from 'items' table: [
  {
    id: '001',
    name: 'Butter Chicken',
    price: 600,
    category: 'Main Course'
  }
]
--------------------------------------------------
🎉 Supabase connection is VERIFIED and active!
```

---

## 5. Troubleshooting & Common Issues

| Status / Symptom               | Cause                         | Fix                                                                                                                                                        |
| :----------------------------- | :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HTTP 401 Unauthorized`        | Invalid Publishable/Anon Key  | Verify `VITE_SUPABASE_PUBLISHABLE_KEY` matches Supabase Dashboard.                                                                                         |
| `HTTP 404 Not Found`           | Database table does not exist | Run [`supabase/schema.sql`](file:///c:/Users/maddi/OneDrive/Documents/my_projects/data%20i2i/pos-service-repo/supabase/schema.sql) in Supabase SQL Editor. |
| `FetchError`                   | Incorrect Supabase URL        | Ensure `VITE_SUPABASE_URL` starts with `https://`.                                                                                                         |
| `Variables undefined in React` | Missing `VITE_` prefix        | Rename variables to start with `VITE_` for Vite frontend projects.                                                                                         |

---
