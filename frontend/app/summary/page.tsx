import Link from "next/link";
import PageContainer from "@/components/pageContainer";
import "@/styles/index.css";
import "@/styles/summary.css"
import { getCategories, getCategoryById, getSummary, getTransactions } from "@/lib/api";
import { TransactionItem } from "@/components/transactionItem";

export default async function Summary({ searchParams }: { searchParams: Promise<{ category_id?: string; start_date?: string; end_date?: string }> }) {
    const { category_id, start_date, end_date } = await searchParams;
    const startDate = start_date ?? "2000-01-01";
    const endDate = end_date ?? new Date().toISOString().split('T')[0];
    const transactions = category_id ? await getTransactions({ start_date: startDate, end_date: endDate, category_id }) : null;
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
        getSummary({ start_date: startDate, end_date: endDate, category_id }),
    ]);

    return (
        <PageContainer>
            <div className="headerContainer">
                <h1>Summary: {category.name}</h1>
            </div>
            <form className="dateSelectorContainer" method="get">
                <input type="hidden" name="category_id" value={category_id} />
                <label htmlFor="startDate">Start Date:</label>
                <input type="date" id="startDate" name="start_date" defaultValue={startDate}/>
                <label htmlFor="endDate">End Date:</label>
                <input type="date" id="endDate" name="end_date" defaultValue={endDate}/>
                <button type="submit">Apply</button>
            </form>
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
