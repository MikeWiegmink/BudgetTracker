process.env.DB_PATH = ':memory:';

const { default: db } = await import('../src/db.js');
const { categories, transactions } = await import('./fixtures.js');

const insertCategory = db.prepare('INSERT OR IGNORE INTO Categories (id, name) VALUES (?, ?)');
for (const c of categories) insertCategory.run(c.id, c.name);

const insertTransaction = db.prepare('INSERT OR IGNORE INTO Transactions (id, amount, desc, date, category_id) VALUES (?, ?, ?, ?, ?)');
for (const t of transactions) insertTransaction.run(t.id, t.amount, t.desc, t.date, t.category_id);
