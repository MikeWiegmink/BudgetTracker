import express from 'express';
import db from './db.js';

const app = express();
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Its alive on http://localhost:${PORT}`);
})

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.json({ status: "Hey, its home!" });
})

app.get("/categories", (req, res) => {
    const stmt = db.prepare("SELECT * FROM Categories");
    res.json(stmt.all())
})

app.get("/categories/:id", (req, res) => {
    const row = db.prepare("SELECT * FROM Categories WHERE id = ?").get(req.params.id);
    return row ? res.json(row) : res.status(404).json({ error: "Not found" });
})