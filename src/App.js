import './App.css';
import HeaderTabs from "./components/headertabs";
import { useEffect } from 'react';
export default function App() {
  useEffect(()=>{
    if(localStorage.getItem('details')){
      localStorage.removeItem('details')
    }
  })
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
