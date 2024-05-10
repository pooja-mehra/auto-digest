import './App.css';
import HeaderTabs from "./components/headertabs";
import { useEffect, useState, createContext } from 'react';
import MainToolabr from './components/maintoolbar';
import Pointer from './shared/pointer';
export var UserContext = createContext(null);
export var DemoContext = createContext(null);

export default function App() {
  const [user,setUser] = useState(null)
  const [demo,setDemo] = useState(null)

  const setUserContext = (user) =>{
    setUser(user)
  }

  const setDemoContext = (demo) =>{
    setDemo(demo)
  }

  useEffect(()=>{
    window.sessionStorage.removeItem('details')
    window.sessionStorage.removeItem('shoppinglist')
    window.sessionStorage.removeItem('shoppinglistnames')
  })

  useEffect(()=>{
    UserContext = createContext(user)
  },[user])

  useEffect(()=>{
    DemoContext = createContext(demo)
  },[demo])

  return (
    <div>
      <header>
        <title><h4 id="title">TextExtractor</h4></title>
      </header>
      {
        demo &&
        <div style={{position:'absolute',zIndex:2,left:demo.x,top:demo.y}}>
          <Pointer position={{x:demo.x,y:demo.y}}></Pointer>
        </div>
      }
        <main>
          <MainToolabr setUser={setUserContext} user={user} setDemoContext={setDemoContext}>
          </MainToolabr>
          <DemoContext.Provider value ={demo}>
            <UserContext.Provider value={user} >
              <HeaderTabs>
              </HeaderTabs>
            </UserContext.Provider>
            </DemoContext.Provider>
        </main>
      <footer>
      </footer>      
    </div>
  )
}
