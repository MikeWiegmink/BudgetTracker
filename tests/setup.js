process.env.DB_PATH = ':memory:';

const { default: db } = await import('../src/db.js');
const categories = [
  { id: 4, name: "entertainment" },
  { id: 5, name: "transport" },
];

const transactions = [
  { id: 5, amount: 60, desc: "Netflix", date: "2026-09-10", category_id: 3 },
  { id: 6, amount: 20, desc: "Bus card", date: "2026-09-05", category_id: 5 },
  { id: 7, amount: 15, desc: "Cinema", date: "2026-08-20", category_id: 4 },
  {
    id: 8,
    amount: 200,
    desc: "Extra savings",
    date: "2026-07-01",
    category_id: 2,
  },
  { id: 9, amount: 20, desc: "Albert Heijn", date: "2026-08-12", category_id: 1 },
  { id: 10, amount: 60, desc: "Lidl", date: "2026-10-03", category_id: 1 },
  { id: 11, amount: 45, desc: "Train ticket", date: "2026-10-15", category_id: 5 },
];


const insertCategory = db.prepare('INSERT OR IGNORE INTO Categories (id, name) VALUES (?, ?)');
for (const c of categories) insertCategory.run(c.id, c.name);

const insertTransaction = db.prepare('INSERT OR IGNORE INTO Transactions (id, amount, desc, date, category_id) VALUES (?, ?, ?, ?, ?)');
for (const t of transactions) insertTransaction.run(t.id, t.amount, t.desc, t.date, t.category_id);
