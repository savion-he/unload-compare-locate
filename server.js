const express = require("express");
const db = require("./db");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// GET /records
app.get("/records", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM records ORDER BY saved_at DESC").all();
    res.json(rows.map(r => ({ id: r.id, env: JSON.parse(r.env), data: JSON.parse(r.data), raw: r.raw, savedAt: r.saved_at })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /records
app.post("/records", (req, res) => {
  try {
    const { env, data, raw } = req.body;
    const id = Date.now().toString();
    const savedAt = new Date().toLocaleString("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", timeZone: "Asia/Shanghai",
    });
    db.prepare("INSERT INTO records (id, env, data, raw, saved_at) VALUES (?, ?, ?, ?, ?)")
      .run(id, JSON.stringify(env), JSON.stringify(data), raw || "", savedAt);
    res.json({ ok: true, record: { id, env, data, raw, savedAt } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /records/:id
app.put("/records/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { env, data, raw } = req.body;
    const result = db.prepare("UPDATE records SET env=?, data=?, raw=? WHERE id=?")
      .run(JSON.stringify(env), JSON.stringify(data), raw || "", id);
    if (result.changes === 0) return res.status(404).json({ error: "Not found" });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /records/:id
app.delete("/records/:id", (req, res) => {
  try {
    db.prepare("DELETE FROM records WHERE id=?").run(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Running on http://0.0.0.0:${PORT}`));
