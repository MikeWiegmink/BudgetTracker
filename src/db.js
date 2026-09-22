import Database from "better-sqlite3";

const db = new Database('app.db')

const query = `
    CREATE TABLE IF NOT EXISTS Categories (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS Transactions (
        id INTEGER PRIMARY KEY,
        amount INTEGER NOT NULL,
        desc TEXT NOT NULL,
        date TEXT NOT NULL,
        category_id INTEGER REFERENCES Categories(id)
    );

    INSERT OR IGNORE INTO Categories VALUES (1, 'groceries');
    INSERT OR IGNORE INTO Categories VALUES (2, 'savings');
    INSERT OR IGNORE INTO Categories VALUES (3, 'subscriptions');

    INSERT OR IGNORE INTO Transactions VALUES (1, 100, 'Saving 100 euro''s!', '2026-09-22', 2);
    INSERT OR IGNORE INTO Transactions VALUES (2, 50, 'Amazon Prime', '2026-09-18', 3);
    INSERT OR IGNORE INTO Transactions VALUES (3, 75, 'F1 TV', '2026-09-16', 3);
    INSERT OR IGNORE INTO Transactions VALUES (4, 40, 'Jumbo', '2026-08-30', 1);
`;

db.exec(query)

export default db;