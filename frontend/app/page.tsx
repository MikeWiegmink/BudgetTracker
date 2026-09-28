import PageContainer from "@/components/pageContainer";
import "@/styles/index.css";

export default function Home() {
    return (
        <PageContainer>
            <div className="headerContainer">
                <h1>A Budget Tracker</h1>
                <p>A budget tracking app by Mike Wiegmink</p>
            </div>
            <div className="contentContainer">
                <div className="transactionContainer"></div>
                <div className="categoryContainer"></div>
            </div>
            <div className="footerContainer"></div>
        </PageContainer>
    );
}
