import Link from "next/link";
import PageContainer from "@/components/pageContainer";
import "@/styles/index.css";
import "@/styles/summary.css"
import { getCategories, getCategoryById, getSummary, getTransactions } from "@/lib/api";
import { TransactionItem } from "@/components/transactionItem";


export default async function Summary({ searchParams }: { searchParams: Promise<{ category_id?: string }> }) {
    const { category_id } = await searchParams;
    const transactions = category_id ? await getTransactions({category_id: category_id}) : null;
    const categories = await getCategories();

    if (!category_id) {
        return (
            <PageContainer>
                <div className="headerContainer">
                    <h1>Summary</h1>
                    <p>No category selected</p>
                </div>
                <Link href="/">Back</Link>
            </PageContainer>
        );
    }

    const [category, summary] = await Promise.all([
        getCategoryById(category_id),
        getSummary({ category_id }),
    ]);

    return (
        <PageContainer>
            <div className="headerContainer">
                <h1>Summary: {category.name}</h1>
            </div>
            {summary ? (
                <div>
                    <div className="statsContainer">
                        <div className="statCard">
                            <span className="statLabel">Total</span>
                            <span className="statValue">${summary.total}</span>
                        </div>
                        <div className="statCard">
                            <span className="statLabel">Average</span>
                            <span className="statValue">${summary.average}</span>
                        </div>
                        <div className="statCard">
                            <span className="statLabel">Max</span>
                            <span className="statValue">${summary.max}</span>
                        </div>
                    </div>
                    <div className="transactionListContainer">
                        {transactions.map((t: any) => {
                            return <TransactionItem key={t.id} transaction={t} categories={categories} />
                        })}
                    </div>
                </div>
            ) : (
                <p>No transactions found for this category</p>
            )}
            <Link className="backButton" href={"/"}>Back</Link>
        </PageContainer>
    );
}
