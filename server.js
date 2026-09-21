import express from 'express';
import db from './db';

const app = express();
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Its alive on http://localhost:${PORT}`)
})

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
})

app.get("/", (req, res) => {
    res.json({ status: "Hey, its home!" })
})