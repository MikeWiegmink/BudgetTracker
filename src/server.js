import express from 'express';
import db from './db.js';
import { categorySchema } from './schema.js'

const app = express();
app.use(express.json());
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

app.post("/categories", (req, res) => {
    try {
        const data = categorySchema.parse(req.body);
    
        const info = db.prepare("INSERT INTO Categories (name) VALUES (?)").run(data.name);
    
        res.status(201).json({ id: info.lastInsertRowid, name: data.name });
    } catch (err) {
        res.status(400).json({ Error: err.errors });
    }
})
