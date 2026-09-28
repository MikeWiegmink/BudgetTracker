"use client";

import { useRouter } from "next/navigation";
import { deleteTransactionById } from "@/lib/api";

export default function TransactionItem({ transaction }: { transaction: any }) {
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
                <button onClick={() => handleEditTransaction(transaction.id)}>Edit</button>
                <button onClick={() => handleDeleteTransaction(transaction.id)}>Delete</button>
            </div>
        </div>
    );
}
