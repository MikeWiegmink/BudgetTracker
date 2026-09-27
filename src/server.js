import express from 'express';
import cors from 'cors';
import db from './db.js';
import { fileURLToPath } from 'url';
import { categorySchema, transactionSchema } from './schema.js'

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.json({ status: "Hey, its home!" });
})

if (process.argv[1] === fileURLToPath(import.meta.url)) {
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

app.delete("/categories/:id", (req, res) => {
    const { id } = req.params;

    try {
        const info = db.prepare("DELETE FROM Categories WHERE id = ?").run(id);
        if (info.changes) {
            return res.status(204).end();
        }
        res.status(404).json({ error: "Category does not exist" });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while deleting the category" });
    }
})

app.put("/categories/:id", (req, res) => {
    const { id } = req.params;

    const getCategory = (id) => db.prepare("SELECT * FROM Categories WHERE id = ?").get(id);

    const newNameAvailable = (newName, id) => {
        const row = db.prepare("SELECT * FROM Categories WHERE name = ? AND id != ?").get(newName, id);
        return row ? false : true;
    }

    try {
        if (!getCategory(id)) {
            return res.status(404).json({ error: "Category does not exist" });
        }

        const data = categorySchema.parse(req.body);

        if (!newNameAvailable(data.name, id)) {
            return res.status(409).json({ error: "Name is already taken" });
        }

        db.prepare("UPDATE Categories SET name = ? WHERE id = ?").run(data.name, id);

        return res.status(200).json(getCategory(id));
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
        const parsedCategoryId = Number(category_id);
        if (!Number.isInteger(parsedCategoryId)) {
            return res.status(400).json({ error: "category_id must be an integer" });
        }
        conditions.push("category_id = ?");
        params.push(parsedCategoryId);
    }

    const query = conditions.length
        ? `SELECT * FROM Transactions WHERE ${conditions.join(" AND ")}`
        : "SELECT * FROM Transactions";

    try {
        const stmt = db.prepare(query);
        res.status(200).json(stmt.all(...params));
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while fetching transactions" });
    }
})

app.get("/transactions/:id", (req, res) => {
    const { id } = req.params;

    try {
        const row = db.prepare("SELECT * FROM Transactions WHERE id = ?").get(id);
        if (!row) {
            return res.status(404).json({ error: "Transaction not found" });
        }
        return res.status(200).json(row)
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while fetching the transaction" });
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

app.delete("/transactions/:id", (req, res) => {
    const { id } = req.params;

    try {
        const info = db.prepare("DELETE FROM Transactions WHERE id = ?").run(id);
        if (info.changes) {
            return res.status(204).end()
        }
        res.status(404).json({ error: "Transaction does not exist" });
    } catch (err) {
        res.status(500).json({ error: "Something went wrong while deleting the transaction" });
    }
})

app.put("/transactions/:id", (req, res) => {
    const { id } = req.params;

    const getTransaction = (id) => db.prepare("SELECT * FROM Transactions WHERE id = ?").get(id);

    const categoryExists = (id) => {
        const row = db.prepare("SELECT * FROM Categories WHERE id = ?").get(id);
        return row ? true : false
    }

    try {
        if (!getTransaction(id)) {
            return res.status(404).json({ error: "Transaction does not exist" });
        }

        const data = transactionSchema.parse(req.body);

        if (!categoryExists(data.category_id)) {
            return res.status(400).json({ error: `Category ${data.category_id} does not exist.`})
        }

        db.prepare("UPDATE Transactions SET amount = ?, desc = ?, date = ?, category_id = ? WHERE id = ?").run(data.amount, data.desc, data.date, data.category_id, id)

        return res.status(200).json(getTransaction(id));
    } catch (err) {
        res.status(400).json({ error: err.issues ?? err.message });
    }
})

// Aggregation

// returns the month, total, average and max of given month and/or category
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
        const parsedCategoryId = Number(category_id);
        if (!Number.isInteger(parsedCategoryId)) {
            return res.status(400).json({ error: "category_id must be an integer" });
        }
        conditions.push("category_id = ?");
        params.push(parsedCategoryId);
    }

    try {
        const { total, average, max } = db
            .prepare(`SELECT SUM(amount) AS total, AVG(amount) AS average, MAX(amount) AS max FROM Transactions WHERE ${conditions.join(" AND ")}`)
            .get(...params);

        if (total === null) {
            return res.status(404).json({
                error: month ? "No transactions found in that month" : "No transactions found",
            });
        }

        return res.status(200).json({
            month: month ?? null,
            total,
            average: Math.round(average * 100) / 100,
            max,
        });
    } catch (err) {
        return res.status(500).json({ error: "Something went wrong while fetching the summary" });
    }
})

// returns a list of category names with corresponding count in descending order
app.get("/commoncategory", (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: "No parameters provided" });
    }

    const match = date.match(/^(\d{4}-\d{2})(-\d{2})?$/);
    if (!match) {
        return res.status(400).json({ error: "Invalid date format, expected YYYY-MM or YYYY-MM-DD" });
    }
    const month = match[1];

    try {
        const categories = db
            .prepare("SELECT C.name, COUNT(*) AS count FROM Transactions T JOIN Categories C ON T.category_id = C.id WHERE date LIKE ? GROUP BY T.category_id ORDER BY count DESC")
            .all(`${month}%`);

        if (categories.length === 0) {
            return res.status(404).json({ error: "No transactions found in that month" });
        }

        return res.status(200).json({ month, categories });
    } catch (err) {
        return res.status(500).json({ error: "Something went wrong while fetching the categories" });
    }
})

export default app;