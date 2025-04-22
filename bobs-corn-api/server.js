const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// THIS ENDPOINTS CAN BE IMPROVED USING STORE PROCEDURES FOR BETTER SECURITY
// Create SQLite DB file if not exists
const db = new sqlite3.Database('./corn.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id TEXT NOT NULL,
      purchase_time DATETIME NOT NULL
    )
  `);
});

app.get("/api/clients", (req, res) => {
    db.all("SELECT * FROM purchases", [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const clientNames = rows.map((row) => row.client_id);
      res.json(clientNames);
    });
  });

app.get("/api/purchases/:clientName", (req, res) => {
    const { clientName } = req.params;
  
    db.get("SELECT * FROM purchases WHERE client_id = ?", [clientName], (err, client) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!client) return res.status(404).json({ error: "Client not found" });
  
      db.all(
        "SELECT * FROM purchases WHERE client_id = ? ORDER BY purchase_time DESC",
        [client.client_id],
        (err, rows) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(rows); // array of { timestamp }
        }
      );
    });
  });

app.post('/buy-corn', (req, res) => {
  const { client_id } = req.body;

  if (!client_id) return res.status(400).send('Missing client_id');

  const now = new Date();
  const oneMinuteAgo = new Date(now.getTime() - 60000).toISOString();

  db.get(
    `SELECT * FROM purchases
     WHERE client_id = ? AND purchase_time > ?
     ORDER BY purchase_time DESC LIMIT 1`,
    [client_id, oneMinuteAgo],
    (err, row) => {
      if (err) return res.status(500).send('Database error');

      if (row) {
        return res.status(429).send('🌽 Too Many Requests - wait 1 minute');
      } else {
        db.run(
          `INSERT INTO purchases (client_id, purchase_time)
           VALUES (?, ?)`,
          [client_id, now.toISOString()],
          (err) => {
            if (err) return res.status(500).send('Insert failed');
            return res.status(200).send('🌽 Corn purchased successfully!');
          }
        );
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`🌽 Bob’s Corn API running at http://localhost:${PORT}`);
});
