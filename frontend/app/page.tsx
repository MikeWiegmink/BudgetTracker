import PageContainer from "@/components/pageContainer";
import "@/styles/index.css";
import { TransactionItem, TransactionHeader } from "@/components/transactionItem";
import { CategoryItem, CategoryHeader } from "@/components/categoryItem";
import { getTransactions, getCategories } from "@/lib/api"

export default async function Home() {
    const categoryOptions = await getCategories();

    const getTransactionList = async () => {
        const transactions = await getTransactions()

        return (
            <div className="transactionListContainer">
                {transactions.map((t : any) => {
                    return <TransactionItem key={t.id} transaction={t} categories={categoryOptions} />
                })}
            </div>
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
                <div className="transactionContainer">
                    <TransactionHeader categories={categoryOptions} />
                    {getTransactionList()}
                </div>
                <div className="categoryContainer">
                    <CategoryHeader />
                    {getCategoryList()}
                </div>
            </div>
            <div className="footerContainer"></div>
        </PageContainer>
    );
}
