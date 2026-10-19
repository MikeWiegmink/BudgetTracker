import PageContainer from "@/components/pageContainer";
import "@/styles/index.css";
import { TransactionList } from "@/components/transactionItem";
import { CategoryItem, CategoryHeader } from "@/components/categoryItem";
import { getTransactions, getCategories } from "@/lib/api"

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string; start_date?: string; end_date?: string }> }) {
    const { category, start_date, end_date } = await searchParams;
    const categoryOptions = await getCategories();

    const getTransactionList = async () => {
        const transactions = await getTransactions({
            ...(category && { category_id: category }),
            ...(start_date && { start_date }),
            ...(end_date && { end_date }),
        })
        return (
            <TransactionList key={`${category ?? "all"}-${start_date}-${end_date}`} transactions={transactions} categories={categoryOptions}/>
        )
    }

    const getCategoryList = async () => {
        return(
            <div className="categoryListContainer">
                {categoryOptions.map((c : any) => {
                    return (<CategoryItem key={c.id} category={c} />)
                })}
            </div>
        )
    }

    return (
        <PageContainer>
            <div className="headerContainer">
                <h1>A Budget Tracker</h1>
                <p>A budget tracking app by Mike Wiegmink</p>
            </div>
            <div className="contentContainer">
                {getTransactionList()}
                <div className="categoryContainer">
                    <CategoryHeader />
                    {getCategoryList()}
                </div>
            </div>
            <div className="footerContainer"></div>
        </PageContainer>
    );
}
