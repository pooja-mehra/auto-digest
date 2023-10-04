import './App.css';
import HeaderTabs from "./components/headertabs";
export default function App() {
    return (
    <div>
      <header>
        <title><h4 data-testid="title">TextExtractor</h4></title>
      </header>
      <main>
        <HeaderTabs>
        </HeaderTabs>
      </main>
      <footer>
      </footer>
    </div>
  )
}
