import './App.css';
import HeaderTabs from "./components/headertabs";
import { useEffect, useState, createContext } from 'react';
import MainToolabr from './components/maintoolbar';
export var UserContext = createContext(null);

export default function App() {
  const [userId,setUserId] = useState(null)

  const setUser = (user) =>{
    setUserId(user.userId)
  }
  useEffect(()=>{
    localStorage.removeItem('details')
    localStorage.removeItem('shoppinglist')
    localStorage.removeItem('shoppinglistnames')
  })

  useEffect(()=>{
    UserContext = createContext(userId)
  },[userId])
  
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
