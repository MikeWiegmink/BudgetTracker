import express from 'express';
import db from './db.js';
import { categorySchema, transactionSchema } from './schema.js'

const app = express();
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.json({ status: "Hey, its home!" });
})

if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = 8080;
  app.listen(PORT, () => {
    console.log(`Its alive on http://localhost:${PORT}`);
  });
}

// Categories
app.get("/categories", (req, res) => {
    const stmt = db.prepare("SELECT * FROM Categories");
    res.status(200).json(stmt.all())
})

app.get("/categories/:id", (req, res) => {
    const row = db.prepare("SELECT * FROM Categories WHERE id = ?").get(req.params.id);
    return row ? res.status(200).json(row) : res.status(404).json({ error: "Not found" });
})

app.post("/categories", (req, res) => {

    const categoryExists = (name) => {
        const row = db.prepare("SELECT * FROM Categories WHERE name = ?").get(name);
        return row ? true : false;
    }

    try {
        const data = categorySchema.parse(req.body);

        if (categoryExists(data.name)) {
            return res.status(409).json({ error: "Category already exists" })
        }

        const info = db.prepare("INSERT INTO Categories (name) VALUES (?)").run(data.name);

        res.status(201).json({ id: info.lastInsertRowid, name: data.name });
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message });
    }
})

app.delete("/categories", (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "No id provided" });

    try {
        const info = db.prepare("DELETE FROM Categories WHERE id = ?").run(id);
        if (info.changes) {
            return res.status(204).end();
        }
        res.status(404).json({ error: "Category does not exist" });
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message });
    }
})

app.put("/categories", (req, res) => {
    const { id, name, newName } = req.query;

    if (!id || !name || !newName) {
        return res.status(400).json({ error: "missing parameters" })
    }

    const categoryExists = (id, name) => {
        const row = db.prepare("SELECT id FROM Categories WHERE id = ? AND name = ?").get(id, name);
        return row ? true : false;
    }

    const newNameAvailable = (newName) => {
        const row = db.prepare("SELECT * FROM Categories WHERE name = ?").get(newName);
        return row ? false : true;
    }

    try {
        if (!categoryExists(id, name)) {
            return res.status(404).json({ error: "Could not find correct category" });
        }

        const data = categorySchema.parse({ name: newName });

        if (!newNameAvailable(data.name)) {
            return res.status(409).json({ error: "Name is already taken" });
        }

        const info = db.prepare("UPDATE Categories SET name = ? WHERE id = ?").run(data.name, id);

        if (info.changes) {
            return res.status(200).json({ succes: info.changes})
        }

        return res.status(400).json({ error:"Unable to update row" })
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message });
    }
})

// Transactions
app.get("/transactions", (req, res) => {
    const { date, category_id } = req.query;

    const conditions = [];
    const params = [];

    if (date) {
        conditions.push("date LIKE ?");
        params.push(`%${date}%`);
    }

    if (category_id) {
        conditions.push("category_id = ?");
        params.push(category_id);
    }

    const query = conditions.length
        ? `SELECT * FROM Transactions WHERE ${conditions.join(" AND ")}`
        : "SELECT * FROM Transactions";

    const stmt = db.prepare(query);
    res.json(stmt.all(...params));
})

app.get("/transactions/:id", (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "No id provided" });

    try {
        const row = db.prepare("SELECT * FROM Transactions WHERE id = ?").get(id);
        if (!row) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        return res.status(200).json(row)
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message })
    }
})

app.post("/transactions", (req, res) => {

    const categoryExists = (id) => {
        const row = db.prepare("SELECT * FROM Categories WHERE id = ?").get(id);
        return row ? true : false
    }

    try {
        const data = transactionSchema.parse(req.body);

        if (!categoryExists(data.category_id)) {
            return res.status(400).json({ error: `Category ${data.category_id} does not exist.`})
        }

        const info = db.prepare("INSERT INTO Transactions (amount, desc, date, category_id) VALUES (?,?,?,?)").run(data.amount, data.desc, data.date, data.category_id);

        res.status(201).json({ id: info.lastInsertRowid, amount: data.amount, desc: data.desc, date: data.date, category_id: data.category_id})
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message })
    }
})

app.delete("/transactions", (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "No id provided" });

    try {
        const info = db.prepare("DELETE FROM Transactions WHERE id = ?").run(id);
        if (info.changes) {
            return res.status(204).end()
        }
        res.status(404).json({ error: "Transaction does not exist "})
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message })
    }
})

app.put("/transactions", (req, res) => {
    const { id, amount, desc, date, category_id} = req.query;
    if (!id || !amount || !desc || !date || !category_id ) {
        return res.status(400).json({ error: "Missing parameters" });
    }

    const getTransaction = (id) => {
        return db.prepare("SELECT * FROM Transactions WHERE id = ?").get(id);
    }

    const transactionExists = (id) => {
        const row = getTransaction(id);
        return row ? true : false
    }

    const categoryExists = (id) => {
        const row = db.prepare("SELECT * FROM Categories WHERE id = ?").get(id);
        return row ? true : false
    }

    try {
        if (!transactionExists(id)) {
            return res.status(404).json({ error: "Transaction does not exist" });
        }
        const data = transactionSchema.parse({ amount: Number(amount), desc: desc, date: date, category_id: Number(category_id) });

        if (!categoryExists(data.category_id)) {
            return res.status(400).json({ error: `Category ${data.category_id} does not exist.`})
        }

        const info = db.prepare("UPDATE Transactions SET amount = ?, desc = ?, date = ?, category_id = ? WHERE id = ?").run(data.amount, data.desc, data.date, data.category_id, id)
        if (info.changes) {
            return res.status(200).json({ info: info.changes })
        }

        return res.status(400).json({ error: "Unable to update row" })
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message });
    }
})

// Aggregation

// Total per month
app.get("/summary", (req, res) => {
    const { date, category_id } = req.query;

    if (!date && !category_id) {
        return res.status(400).json({ error: "No parameters provided" });
    }

    const conditions = [];
    const params = [];

    let month;
    if (date) {
        const match = date.match(/^(\d{4}-\d{2})(-\d{2})?$/);
        if (!match) {
            return res.status(400).json({ error: "Invalid date format, expected YYYY-MM or YYYY-MM-DD" });
        }
        month = match[1];
        conditions.push("date LIKE ?");
        params.push(`${month}%`);
    }

    if (category_id) {
        conditions.push("category_id = ?");
        params.push(category_id);
    }

    try {
        const row = db
            .prepare(`SELECT 1 FROM Transactions WHERE ${conditions.join(" AND ")}`)
            .get(...params);
        if (!row) {
            return res.status(404).json({
                error: month ? "No transactions found in that month" : "No transactions found",
            });
        }

        const { total } = db
            .prepare(`SELECT SUM(amount) AS total FROM Transactions WHERE ${conditions.join(" AND ")}`)
            .get(...params);
        const { average } = db
            .prepare(`SELECT AVG(amount) AS average FROM Transactions WHERE ${conditions.join(" AND ")}`)
            .get(...params)
        const { max } = db
            .prepare(`SELECT MAX(amount) AS max FROM Transactions WHERE ${conditions.join(" AND ")}`)
            .get(...params)

        return res.status(200).json({ month, total, average, max });
    } catch (err) {
        return res.status(400).json({ error: err.issues ?? err.message })
    }
})

export default app;