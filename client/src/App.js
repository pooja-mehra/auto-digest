import './App.css';
import HeaderTabs from "./components/headertabs";
import { useEffect, useState, createContext } from 'react';
import MainToolabr from './components/maintoolbar';
import axios from "axios";
export var UserContext = createContext(null);
const base_url = process.env.REACT_APP_BASE_URL

export default function App() {
  const [userId,setUserId] = useState(null)

  const setUser = (user) =>{
    setUserId(user.userId)
  }
  useEffect(()=>{
    handleScan()
    localStorage.removeItem('details')
    localStorage.removeItem('shoppinglist')
    localStorage.removeItem('shoppinglistnames')
  })

  useEffect(()=>{
    UserContext = createContext(userId)
  },[userId])
  
  const handleScan = async() => {
    try{  
      await axios.get(base_url)
      .then((res)=>{
        console.log(res)
      })} catch(e){
        console.log(e)
        console.log(base_url)
      }
  };
  return (
    <div>
      <header>
        <title><h4 data-testid="title">TextExtractor</h4></title>
      </header>
      <main>
        <MainToolabr setUser={setUser}></MainToolabr>
          <UserContext.Provider value={userId}>
            <HeaderTabs>
            </HeaderTabs>
          </UserContext.Provider>
      </main>
      <footer>
      </footer>
    </div>
  )
}
