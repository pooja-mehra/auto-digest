import Divider from '@mui/material/Divider';
import "./shoppinglist.css";
import ItemTable from '../functionality/itemTable';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import axios from 'axios';
import SimpleDialog from '../functionality/simpleDialog'
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import ClearIcon from '@mui/icons-material/Clear';
import Tooltip from '@mui/material/Tooltip';
import DoneOutlineIcon from '@mui/icons-material/DoneOutline';

export default function ShoppingList() {
    const [shoppingList,setShoppingList] = useState(
      () => {
        const storedData = localStorage.getItem('shoppinglist');
        return storedData ? JSON.parse(storedData) : [];
      })
    const [shoppedList,setShoppedList] = useState([])
    const [openDialog, setOpenDialog] = useState(false);
    const [openAlert, setOpenAlert] = useState({isOpen:false,status:'none',msg:''});
    const [details, setDetails]  = useState(null)
    const [consumed,setConsumed] = useState({used:0,left:0})
    const header=[{id:'addicon',label:<AddIcon/>,maxWidth: 50,type:'icon'},
    {id:'name',label:'Name',minWidth: 170, type:"string"},
    {id:'qty',label:'Quantity',minWidth: 170, type:"number"}]
    const  shoppedHeader=[{id:'none',label:'',minWidth: 50},
    {id:'name',label:'Name',minWidth: 170, type:"string"},
    {id:'left',label:'Quantity Left',minWidth: 170, type:"number"},
    {id:'lastPurchaseDate',label:'Last Purcahse Date',minWidth: 100},
    {id:'frequency', label:' Buying Frequency', minWidth: 170},
    {id:'details',label:'',minWidth: 100}]

    useEffect(()=>{
      getAllUserGrocery(localStorage.getItem('details')?JSON.parse(localStorage.getItem('details')):null)
      details && setConsumed({used:details.used?details.used:0,left:details.used?details.qty-details.used:details.qty})
    },[details])

    useEffect(()=>{
      openAlert.isOpen && openAlert.isOpen === true && setTimeout(()=>{
        setOpenAlert({isOpen:false,status:'none',msg:''})
      },2000)
    },[openAlert])

    useEffect(()=>{
      shoppingList.length>0 && localStorage.setItem('shoppinglist',JSON.stringify(shoppingList.filter((item,i)=>item.name !== '' && item.qty !=='' && item.qty >0)))
    },[shoppingList])

    const getAllUserGrocery = async(details) =>{
     if(details === null){
        try{
          await axios.get("http://localhost:8080/api/getallusergrocery",).then((res)=>{
          if(res && res.data.length > 0){
            details = res.data
            localStorage.setItem('details',JSON.stringify(details))
          } 
          })
        } catch(e){
          console.log(e)
        }
      }
      if(details !== null || (details && details.length > 0)){
        let data = details.map((d,i)=> ({name:d.name,qty:d.qty, left:d.left, used:d.used,
          lastPurchaseDate: new Date(d.lastPurchaseDate).toLocaleDateString('en-us'),
          daysTillNow:d.daysTillNow,
          frequency:calcFrequency(d.qty,d.daysTillNow)
          })).sort((a,b)=> new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime())
          setShoppedList(data)
      } 
  }
    const calcFrequency = (qty,daysTillNow) =>{
      if(daysTillNow <= 7){
        return `${qty + ' in a week'} `
      } else{
        let j = 1
      do{
        if(Math.round(qty/(daysTillNow/(7*j))) > 0){
          return Math.round(qty/(daysTillNow/(7*j))) + ` in ${j===1? (' a week'): (j+ ' weeks')}`
        } 
        j = j +1 
        
      }while(Math.round(qty/(daysTillNow/(7*(j-1)))) === 0)
      }
      
    }
    const addItem = (row,page,rowsPerPage) =>{
      let itemExists = false
      setShoppingList(shoppingList.map((s,i)=>{
        if(s.name === row.name && s.name !== '' && !itemExists){
            itemExists = true
            return {...s,qty:parseInt(s.qty)+1}
      }
      return s
      }))
      if(!itemExists){
        setShoppingList([{name:row.name,qty:1},...shoppingList])
      }
      row  && row.left> 0 && setOpenAlert({isOpen:true,status:'warning',msg:row.left+' more ' + row.name+' left from past purchase'})
    }

    const deleteItem = (i,page,rowsPerPage) =>{
      setShoppingList(shoppingList.filter((item,index)=> index !== (i+(page*rowsPerPage))))

    };

    const formatItem =(label,text,page,rowsPerPage,i)=>{
      setShoppingList(shoppingList.map((item,index)=> {
        if(index === (i+(page*rowsPerPage))){
          return ({...item,[label]:text.toUpperCase()})
        } else{
          return item
        }
      }))
    }

    const mergeShoppingList = (items) =>{
      let itemMap = new Map()
      let itemArray =[]
      items.forEach((item)=>{
        if(itemMap.has(item.name.toUpperCase())){
          let value = itemMap.get(item.name)  + parseInt(item.qty)
          itemMap.set(item.name.toUpperCase(),value)
        } else{
          itemMap.set(item.name.toUpperCase(),parseInt(item.qty))
        }
      })
      if(itemMap.size > 0)
        {
          for (const [key, value] of itemMap){
            itemArray.push({name:key,qty:value})
          }
        }
      return itemArray
    }

    const setDialog = async (isOpen, isCancel, purchaseDate) =>{
      setOpenDialog(isOpen)
      if(!isCancel){
        if(shoppingList.length > 0){
          let shoppingListQuery = mergeShoppingList(shoppingList)
          try{  
            await axios.post("http://localhost:8080/api/putusergrocery",{purchaseDate:purchaseDate,queryItems:shoppingListQuery}).then((res)=>{
              getAllUserGrocery(null)
              /*if(new Date(purchaseDate).getTime() <= Date.now() &&
              new Date(purchaseDate).getTime() >= Date.now()-30*24*3600*1000){
                localStorage.removeItem('details')
              }*/
            setShoppingList([]) 
            setOpenAlert({isOpen:true,status:'success',msg:'Items sucessfully added to Inventory'})
            })
          } catch(e){
            console.log(e)
          }
        } else{
          setOpenAlert({isOpen:true,status:'error',msg:'No Items to Add'})
        }
      }
    }
    const getDetails = (name) =>{
      if(localStorage.getItem('details') && JSON.parse(localStorage.getItem('details')).length > 0){
        let data = JSON.parse(localStorage.getItem('details')).filter((item,i)=> item.name === name)
        data && data.length > 0 && setDetails(data[0])
      } else{
        setDetails(null)
        getAllUserGrocery(null)
      }
    }

    const changeDetails = (used,left) =>{
      setConsumed({used:used,left:left})
    }

    const updateItem = async() =>{
      const itemName = details.name
      try{
        await axios.post('http://localhost:8080/api/updateusergrocerybyname',{name:details.name,used:consumed.used}).then((res)=>{
          if(res && res.status === 200){
            getAllUserGrocery(null)
            setOpenAlert({isOpen:true,status:'success',msg:`Successfully updated item: ${itemName}`})
          }
        })
        
      } catch(e){
        console.log(e)
        setOpenAlert({isOpen:false,status:'error',msg:`Failed to updated item: ${itemName}`})
      }
       
    }

    return(
        <div className="main" style={{display: 'flex',height:'90vh', flexDirection:'column'}}>
        <div className='presentlist'>
          <ItemTable shoppingList={shoppingList} formatItem={formatItem} deleteItem ={deleteItem} addItem={addItem} header={header} type={'presentList'}/>
          <div style={{width:'100%'}}>
          {
            openAlert.isOpen &&
            <Alert variant="filled" severity={openAlert.status}>{openAlert.msg}</Alert>
          }
            <div className='shoppinglistFooter'>
              <div  className="shoppingfile-upload">
                  <Tooltip title='Clear All' >
                  <p><ClearIcon size="large" style={{color:'white'}} onClick={()=>{
                    setShoppingList([])
                  }}/></p>
                </Tooltip>
              </div>
              <div className='shoppingfile-upload'>
                <Tooltip title='Save to Inventory' >
                <p>
                <DoneOutlineIcon style={{color:'white'}} onClick={()=>{
                  setShoppingList(shoppingList.filter((item,i)=> item.name !== '' && item.qty !== '' && item.qty >0))
                  setOpenDialog(true)
                }}/>
                </p>
                </Tooltip>
              </div>
              </div>
            </div>
          </div>
        <div style={{marginTop:'1vh'}}>
            <Divider>
            <Chip label='Past Purchase'></Chip>
            </Divider>
        </div>
        <div className="pastlist">
          <ItemTable type={'pastList'} addItem={addItem} shoppingList={shoppedList} consumed={consumed}
          changeDetails ={changeDetails} getDetails ={getDetails} details={details} updateItem ={updateItem}
          header={shoppedHeader}/>
        </div>
        <SimpleDialog openDialog ={openDialog} itemList={shoppedList} type = {'date'} setDialog={setDialog}></SimpleDialog>
        </div>
        
    )
}
