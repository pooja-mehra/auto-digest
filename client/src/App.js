import './App.css';
import HeaderTabs from "./components/headertabs";
import { useEffect, useState, createContext } from 'react';
import MainToolabr from './components/maintoolbar';
export var UserContext = createContext(null);

export default function App() {
  const [user,setUser] = useState(null)

  const setUserContext = (user) =>{
    setUser(user)
  }
  useEffect(()=>{
    window.sessionStorage.removeItem('details')
    window.sessionStorage.removeItem('shoppinglist')
    window.sessionStorage.removeItem('shoppinglistnames')
  })

  useEffect(()=>{
    UserContext = createContext(user)
  },[user])
  
  return (
    <div>
      <header>
        <title><h4 id="title">TextExtractor</h4></title>
      </header>
      <main >
        <MainToolabr setUser={setUserContext} user={user}>
        </MainToolabr>
          <UserContext.Provider value={user}>
            <HeaderTabs>
            </HeaderTabs>
          </UserContext.Provider>
      </main>
      <footer>
      </footer>
    </div>
  )
}
