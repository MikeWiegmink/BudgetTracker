"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Modal from "./modal";
import { addTransaction, deleteTransactionById } from "@/lib/api";

export function TransactionItem({ transaction }: { transaction: any }) {
    const router = useRouter();

    const handleEditTransaction = async (id: number) => {

    }

    const handleDeleteTransaction = async (id: number) => {
        try {
            await deleteTransactionById(id);
            router.refresh();
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="transactionItemContainer">
            <div>
                <div className="transactionSubContainer">
                    <p>{transaction.desc}</p>
                    <p>${transaction.amount}</p>
                </div>
                <div className="transactionSubContainer">
                    <p>{transaction.date}</p>
                    <p>{transaction.category_id}</p>
                </div>
            </div>
            <div className="transactionButtonContainer">
                <button className="editButton" onClick={() => handleEditTransaction(transaction.id)}>Edit</button>
                <button className="deleteButton" onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
            </div>
        </div>
    );
}

export function TransactionHeader({ categories }: { categories: any[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        try {
            await addTransaction(
                String(form.get("desc")),
                Number(form.get("amount")),
                String(form.get("date")),
                Number(form.get("category_id")),
            );
            setOpen(false);
            setError("");
            router.refresh();
        } catch (err) {
            console.error(err);
            setError("Could not add transaction. Please check the fields and try again.");
        }
    }

    const handleClose = () => {
        setOpen(false);
        setError("");
    }

    return (
        <div className="transactionHeaderContainer">
            <h1 className="headerText">Transactions</h1>
            <button className="addTransactionButton" onClick={() => setOpen(true)}>+ Add</button>
            {open && (
                <Modal title="Add Transaction" onClose={handleClose}>
                    <form className="modalForm" onSubmit={handleSubmit}>
                        <label>
                            Description
                            <input name="desc" type="text" required />
                        </label>
                        <label>
                            Amount
                            <input name="amount" type="number" step="1" required />
                        </label>
                        <label>
                            Date
                            <input name="date" type="date" required />
                        </label>
                        <label>
                            Category
                            <select name="category_id" required defaultValue="">
                                <option value="" disabled>Select a category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </label>
                        {error && <p className="modalError">{error}</p>}
                        <div className="modalButtons">
                            <button type="button" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="addTransactionButton">Add</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}