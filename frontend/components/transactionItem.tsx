"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "./modal";
import { addTransaction, deleteTransactionById, editTransaction } from "@/lib/api";

const INITIAL_COUNT = 5;
const PAGE_SIZE = 10;

export function TransactionList({ transactions, categories }: { transactions: any[], categories: any[] }) {
    const [limit, setLimit] = useState(INITIAL_COUNT);

    return (
        <div className="transactionContainer">
            <TransactionHeader categories={categories}/>
            <div className="transactionListContainer">
                {transactions.slice(0, limit).map((t : any) => {
                    return <TransactionItem key={t.id} transaction={t} categories={categories}/>
                })}
                {limit < transactions.length && (
                    <div className="loadMoreTransactionsContainer">
                        <button type="button" className="loadMoreTransactionsButton" onClick={() => setLimit(limit + PAGE_SIZE)}>
                            + Load more Transactions ({Math.min(PAGE_SIZE, transactions.length - limit)})
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

function TransactionItem({ transaction, categories }: { transaction: any, categories: any[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    const getCategoryname = (id: number) => {
        const category = categories.filter((cat) => cat.id === id)[0]
        return category.name
    }

    const handleDeleteTransaction = async (id: number) => {
        try {
            await deleteTransactionById(id);
            router.refresh();
        } catch (err) {
            console.error(err);
        }
    }

    const handleClose = () => {
        setOpen(false)
    }

    const handleEdit = async (e: any) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);

        try {
            await editTransaction(
                transaction.id,
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
            setError("Could not edit transaction. Please check the fields and try again.");
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
                    <p>{getCategoryname(transaction.category_id)}</p>
                </div>
            </div>
            <div className="transactionButtonContainer">
                <button className="editButton" onClick={() => setOpen(true)}>Edit</button>
                <button className="deleteButton" onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
            </div>
            {open && (
                <Modal title="Edit Transaction" onClose={handleClose}>
                    <form className="modalForm" onSubmit={handleEdit}>
                        <label>
                            Description
                            <input name="desc" type="text" defaultValue={transaction.desc} required />
                        </label>
                        <label>
                            Amount
                            <input name="amount" type="number" defaultValue={transaction.amount} step="1" required />
                        </label>
                        <label>
                            Date
                            <input name="date" type="date" defaultValue={transaction.date} required />
                        </label>
                        <label>
                            Category
                            <select name="category_id" required defaultValue={transaction.category_id}>
                                <option value="" disabled>Select a category</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </label>
                        {error && <p className="modalError">{error}</p>}
                        <div className="modalButtons">
                            <button type="button" className="modalCancelButton" onClick={handleClose}>Cancel</button>
                            <button type="submit" className="modalConfirmButton">Confirm edit</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function TransactionHeader({ categories }: { categories: any[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const startDate = searchParams.get("start_date") ?? "2000-01-01";
    const endDate = searchParams.get("end_date") ?? new Date().toISOString().split('T')[0];
    // keep any other active filters (category / category_id) when the date form submits
    const otherParams = Array.from(searchParams.entries()).filter(([key]) => key !== "start_date" && key !== "end_date");

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
            <div className="transactionHeaderTitle">
                <h1 className="headerText">Transactions</h1>
                <button className="addTransactionButton" onClick={() => setOpen(true)}>+ Add</button>
            </div>
            <form className="transactionHeaderDateSelectorRow" method="get">
                {otherParams.map(([key, value]) => (
                    <input key={key} type="hidden" name={key} value={value} />
                ))}
                <div className="dateContainer">
                    <label className="dateLabel" htmlFor="startDate">Begin Date</label>
                    <input className="dateInput" type="date" id="startDate" name="start_date" defaultValue={startDate}/>
                </div>
                <div className="dateContainer">
                    <label className="dateLabel" htmlFor="endDate">End Date</label>
                    <input className="dateInput" type="date" id="endDate" name="end_date" defaultValue={endDate}/>
                </div>
                <button type="submit" className="dateSelectorApplyButton">Apply</button>
            </form>
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