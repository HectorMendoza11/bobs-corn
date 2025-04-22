# 🌽 Bob’s Corn

A fair and friendly corn-selling platform built by a farmer named Bob.  
This full-stack project includes a **rate-limited API** and a **client portal** where users can buy corn — with a maximum of **1 corn per client per minute**.

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, SQLite
- **Frontend**: React (with TypeScript), Vite, TailwindCSS, Shadcn UI
- **Database**: SQLite (via better-sqlite3)

---

## ✨ Features

### ✅ Backend (API)
- Rate-limits corn purchases (1 per client per minute)
- Returns `200 OK 🌽` or `429 Too Many Requests`
- SQLite-powered storage of client purchases
- REST API to fetch clients and purchase history

### ✅ Frontend (Client Portal)
- Select existing clients from a dropdown
- Add new clients dynamically
- Buy corn via button click with UI animation
- View full purchase history per client in a table
- Responsive UI styled with Tailwind and Shadcn

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/bobs-corn.git
cd bobs-corn

### 2. Start the Backend
```bash
cd bobs-corn-server
npm install
node server.js

### 3. Start the Frontend
```bash
cd bobs-corn-client
npm install
npm run dev

### API Endpoints
Method | Endpoint | Description
POST | /api/purchase/:clientName | Buy corn (rate-limited)
GET | /api/purchases/:clientName | Get corn purchase history
GET | /api/clients | Get list of all clients
POST | /api/clients | Add a new client

### Folder Structure
bobs-corn/
│
├── bobs-corn-server/     # Express + SQLite backend
│   └── ...
│
├── bobs-corn-client/     # React + Tailwind frontend
│   └── ...
│
└── README.md
