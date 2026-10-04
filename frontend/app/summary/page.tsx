import Link from "next/link";
import PageContainer from "@/components/pageContainer";
import "@/styles/index.css";
import { getCategoryById, getSummary } from "@/lib/api";

export default async function Summary({ searchParams }: { searchParams: Promise<{ category_id?: string }> }) {
    const { category_id } = await searchParams;

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
                    <p>Total: {summary.total}</p>
                    <p>Average: {summary.average}</p>
                    <p>Max: {summary.max}</p>
                </div>
            ) : (
                <p>No transactions found for this category</p>
            )}
            <Link href="/">Back</Link>
        </PageContainer>
    );
}
