# Donezo

> Offline-first Kanban board. Stay organized. Finish fast.

An open-source personal kanban application with real-time synchronization across devices. Works offline, syncs when online.

---

## Features

- **Offline-First** — Create, edit, and organize tasks without internet. Syncs automatically when connection returns.
- **Real-Time Sync** — Changes appear instantly across all your devices via WebSocket.
- **User Authentication** — Secure JWT-based auth with bcrypt password hashing.
- **Task Management** — Full CRUD operations: create, read, update, delete. Soft-delete support.
- **Drag-and-Drop** — Reorder tasks by dragging between columns (todo, in-progress, done).
- **Tag System** — Auto-colored tags with board-wide filtering.
- **Due Dates** — Set task deadlines and track progress.
- **Rate Limiting** — API protection against abuse.
- **Cron Jobs** — Automatic cleanup of soft-deleted tasks.

---

## Tech Stack

### Frontend
- HTML, CSS, vanilla JavaScript — no frameworks
- `socket.io-client` for real-time WebSocket sync
- localStorage for offline-first persistence

### Backend
- Node.js + Express.js
- PostgreSQL database
- `pg` for database queries
- `jsonwebtoken` (JWT) for authentication
- `bcrypt` for password hashing
- `socket.io` for real-time WebSocket events
- `express-rate-limit` for API rate limiting
- `node-cron` for scheduled background jobs
- `dotenv` for environment configuration

---

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v12+)
- npm

---

## Setup

### 1. Install Dependencies

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install  # if using a build tool, otherwise no install needed
```

### 2. Set Up PostgreSQL Database

**Create database:**
```bash
createdb -U postgres donezo
```

**Load schema:**
```bash
psql -U postgres -d donezo < server/db/schema.sql
```

This creates two tables:
- `users` — user accounts with hashed passwords
- `tasks` — kanban tasks with timestamps, tags, due dates

### 3. Configure Environment

Create `.env` file in `server/` directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/donezo
JWT_SECRET=your_very_long_random_secret_key_at_least_32_characters
PORT=3002
```

**Generate a strong JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Start the Server

```bash
cd server
npm start
# or: node server.js
```

Server runs on `http://localhost:3002`

### 5. Start the Client

In a separate terminal:

```bash
cd client
npx serve .
```

Client runs on `http://localhost:3000`

---

## Remote Testing (Ngrok)

To test offline sync and real-time updates across devices:

### 1. Install Ngrok

```bash
npm install -g ngrok
```

Sign up at https://ngrok.com and get your auth token.

```bash
ngrok config add-authtoken YOUR_TOKEN
```

### 2. Expose Backend

While server is running:

```bash
ngrok http 3002
```

Ngrok provides a public URL like `https://abc123.ngrok.io`

### 3. Update Client Config

Edit `client/config.js`:

```js
export const API_BASE = 'https://abc123.ngrok.io';
```

---

## 4. Testing Across Multiple Machines

For testing offline sync and real-time updates across different computers:

### Machine A (Backend Server)

**1. Start the backend server**
```bash
cd server
node server.js
```

Server runs on `http://localhost:3002`

**2. Expose with ngrok**

In a new terminal on Machine A:
```bash
ngrok http 3002
```

You'll see:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:3002
```

Copy the ngrok URL — you'll need this on Machine B.

**Keep this running** while testing.

---

### Machine B (Frontend Client)

**1. Clone the repo** (if not already cloned)
```bash
git clone <repo-url>
cd Donezo
```

**2. Update client config**

Edit `client/config.js`:
```js
export const API_BASE = 'https://abc123.ngrok.io'; // Use the ngrok URL from Machine A
```

**3. Start the client**
```bash
cd client
npx serve .
```

Client runs on `http://localhost:3000`

**4. Open in browser**
```
http://localhost:3000
```

---

### Test Offline Sync

**On Machine B (Frontend):**

1. Register and create a task
2. Disconnect from internet (unplug ethernet, turn off WiFi)
3. Create another task while offline — it saves to localStorage
4. Reconnect to internet
5. Watch the offline task sync to the server automatically

**Verify on Machine A:**
Check the backend logs or database — the new task should appear.

---

### Best Practice for Team Testing

1. **One teammate** runs backend + ngrok on their machine
2. **Other teammates** update their `client/config.js` with that ngrok URL
3. **All run** `npx serve .` on their machines
4. **All test** on `http://localhost:3000`
5. Real-time sync and offline sync work across all machines

---

## How to Use

### Register & Login
1. Open `http://localhost:3000` (or ngrok URL)
2. Create account with email and password
3. Log in

### Create Task
1. Click **+ new task** under any column (todo, in-progress, done)
2. Enter title and description
3. Optionally add due date, tags, and notes
4. Click **Create**

### Move Task
1. **Drag and drop** card between columns
2. Or click **move** on the card menu

### Edit Task
1. Click **edit** icon on card
2. Update fields
3. Click **Save**

### Delete Task
1. Click **delete** icon on card
2. Confirm deletion

### Tag Filtering
1. Click **filter** button at top
2. Select tags to show only matching tasks

### Keyboard Shortcuts
Press **?** in the app to see all shortcuts.

### Logout
Click your avatar (top right) → **Logout**

---

## API Documentation

Complete API reference with example requests and responses:

**[View API Documentation](https://documenter.getpostman.com/view/53267893/2sBXikmqDC)**

(Generated from `postman-collection.json` via Postman)

### Quick API Overview

**Authentication:**
- `POST /auth/register` — Create new account
- `POST /auth/login` — Get JWT token

**Tasks:**
- `GET /tasks` — Fetch all tasks (requires auth)
- `POST /tasks` — Create/update tasks in batch (requires auth)

All task endpoints require `Authorization: Bearer {token}` header.

---

## API Testing

Automated test suite covering all endpoints with happy paths and error cases.

**Test file:** `postman-tests.json`

### Run Tests

1. **Import collection into Postman:**
   - File → Import → select `postman-tests.json`

2. **Select environment:**
   - Top right dropdown → choose `Donezo Local`
   - Verify `base_url = http://localhost:3002`

3. **Run tests:**
   - Click Runner button → Run collection
   - All tests should pass ✓

### Test Coverage

**Happy Paths:**
- Register new user (201)
- Login (200, returns token)
- Get tasks (200)
- Batch upsert tasks (200)

**Error Cases:**
- Register missing email (400)
- Login wrong password (401)
- Get tasks without auth (401)

**Rate Limiting:**
- Auth: 5 requests per 15 minutes
- Tasks: 60 requests per minute per user

### Test Results

All tests passing:

![Setup folder tests](./docs/test-setup-passed.png)
![Happy paths tests](./docs/test-happy-paths-passed.png)
![Error cases tests](./docs/test-error-cases-passed.png)

---

## Architecture

### Client Structure
```
client/
├── pages/
│   ├── auth/          # Login/register page
│   └── board/         # Main kanban board
├── components/        # Reusable UI components
├── services/          # API, storage, sync, auth
├── utils/             # Helper functions
├── styles/            # Global CSS
└── config.js          # API base URL
```

### Server Structure
```
server/
├── auth/              # Login/register endpoints
├── tasks/             # Task CRUD endpoints
├── middleware/        # Auth verification, rate limiting
├── services/          # Socket.io, cron jobs
├── db/                # Database queries, schema
└── app.js             # Express server setup
```

### Offline-First Sync Flow

1. **Local changes** — Tasks saved to localStorage with `synced: false`
2. **Online detection** — Window `online` event triggers sync
3. **Conflict resolution** — Last-write-wins using `updated_at` timestamp
4. **Server accepts** — Only if local `updated_at` > server `updated_at`
5. **Broadcast** — Server sends updates to all connected clients via WebSocket
6. **Mark synced** — Tasks marked `synced: true` after successful POST

### Real-Time Sync (WebSocket)

1. Client joins room with JWT token
2. Client emits changes via `POST /tasks`
3. Server broadcasts to room (excluding sender) via `tasks:updated` event
4. Other clients receive updates and merge into localStorage
5. UI updates automatically

---

## Database Schema

### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### tasks table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo',
  position INT DEFAULT 0,
  due_date TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ  -- NULL = not deleted, NOT NULL = soft-deleted
);
```

---

## Environment Variables

Create `.env` in `server/` directory:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:pass@localhost:5432/donezo` |
| `JWT_SECRET` | Secret key for signing JWT tokens | (32+ character random string) |
| `PORT` | Server port | `3002` |
| `NODE_ENV` | Environment (development/production) | `development` |

---

## Common Issues

### "Cannot find module 'pg'"
```bash
cd server && npm install
```

### "ECONNREFUSED localhost:5432"
PostgreSQL not running. Start it:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
# Use PostgreSQL installer or pgAdmin
```

### "relation 'users' does not exist"
Load the schema:
```bash
psql -U postgres -d donezo < server/db/schema.sql
```

### "JWT_SECRET is undefined"
Create `.env` file in `server/` with `JWT_SECRET=your_secret_key`

---

## Performance

- **Rate limiting** — 5 auth requests/15min, 60 task requests/min per user
- **Soft deletes** — Tasks marked `deleted_at`, not removed from DB
- **Last-write-wins** — Simple conflict resolution using timestamps

---

## Team

- **Ron Marc Canete** — PM, code review, Websockets, full-stack development
- **Dominique Alfred Himaya** — API documentation (Postman)
- **Rex Russel Escarro** — Offline sync implementation
- **Jonel Dinopol** — Rate limiting
- **Andre Milan Aranas** — API automated testing

---

## License

© 2026 Irror 126 Web Eng