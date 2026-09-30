import PageContainer from "@/components/pageContainer";
import "@/styles/index.css";
import TransactionItem from "@/components/transactionItem";
import { getTransactions, getCategories } from "@/lib/api"

export default async function Home() {

    const getTransactionList = async () => {
        const transactions = await getTransactions()

        return (
            <div className="transactionListContainer">
                {transactions.map((t : any) => {
                    return <TransactionItem key={t.id} transaction={t} />
                })}
            </div>
        )
    }

    const getCategoryList = async () => {
        const categories = await getCategories();

        return(
            <div className="categoryListContainer">
                {categories.map((c : any) => {
                    return (
                        <div key={c.id} className="categoryItemContainer">
                            <p>{c.name}</p>
                        </div>
                    )
                })}
            </div>
        )
    }

    const handleAddTransaction = () => {
        console.log("Add Transaction button clicked");
    }

    const handleAddCategory = () => {
        console.log("Add Category button clicked");
    }

    return (
        <PageContainer>
            <div className="headerContainer">
                <h1>A Budget Tracker</h1>
                <p>A budget tracking app by Mike Wiegmink</p>
            </div>
            <div className="contentContainer">
                <div className="transactionContainer">
                    <div className="transactionHeaderContainer">
                        <h1 className="headerText">Transactions</h1>
                        <button className="addTransactionButton">
                            + Add
                        </button>
                    </div>
                    {getTransactionList()}
                </div>
                <div className="categoryContainer">
                    <div className="categoryHeaderContainer">
                        <h1 className="headerText">Categories</h1>
                        <button className="addCategoryButton">
                            + Add
                        </button>
                    </div>
                    {getCategoryList()}
                </div>
            </div>
            <div className="footerContainer"></div>
        </PageContainer>
    );
}
