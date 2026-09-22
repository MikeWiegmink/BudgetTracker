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
        description TEXT NOT NULL,
        date DATE NOT NULL,
        category_id INTEGER REFERENCES Categories(id)
    );

    INSERT OR IGNORE INTO Categories VALUES (1, 'groceries');
    INSERT OR IGNORE INTO Categories VALUES (2, 'savings');
    INSERT OR IGNORE INTO Categories VALUES (3, 'subscriptions');
`;

db.exec(query)

export default db;