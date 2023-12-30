import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import CheckboxList from '../functionality/checkboxList';
import ListHeader from '../functionality/listheader';
import "./shoppinglist.css";
import ItemTable from '../functionality/itemTable';
import AddIcon from '@mui/icons-material/Add';
import CommentIcon from '@mui/icons-material/Comment';
import { useEffect, useState } from 'react';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import SimpleDialog from '../functionality/simpleDialog'
import Alert from '@mui/material/Alert';

export default function ShoppingList() {
    const [shoppingList,setShoppingList] = useState([{name:'',qty:1}])
    const [shoppedList,setShoppedList] = useState([])
    const [openDialog, setOpenDialog] = useState(false);
    const [openAlert, setOpenAlert] = useState({isOpen:false,status:'none'});

    const header=[{id:'icon',label:<AddIcon/>,minWidth: 50,type:'icon'},
                {id:'name',label:'Name',minWidth: 170, type:"string"},
                {id:'qty',label:'Quantity',minWidth: 170, type:"number"}]

    useEffect(()=>{
      getAllUserGrocery()
    },[])

    const getAllUserGrocery = async() =>{
      try{
        await axios.get("http://localhost:8080/api/getallusergrocery").then((res)=>{
        if(res && res.data.length > 0){
            console.log(res.data)
            setShoppedList(res.data)
        } else{
        }
        })
    } catch(e){
        console.log(e)
    }}

    const addItem = (row) =>{
      let itemExists = false
      setShoppingList(shoppingList.map((s,i)=>{
        if(s.name === row.name && s.name !== '' && !itemExists){
            itemExists = true
            return {...s,qty:parseInt(s.qty)+parseInt(row.qty)}
      }
      return s
      }))
      !itemExists && setShoppingList([{icon:<DeleteIcon/>,name:row.name,qty:row.qty},...shoppingList])
    }

    const deleteItem = (i) =>{
      setShoppingList(shoppingList.filter((d,index)=>index !== i))

    };

    const formatItem =(i, label,text)=>{
      setShoppingList(shoppingList.map((item,index)=> {
        if(index === i){
          return ({...item,[label]:text.toUpperCase()})
        } else{
          return item
        }
      }))
    }

    const setDialog = async (isOpen, isCancel, purchaseDate) =>{
      setOpenDialog(isOpen)
      if(!isCancel){
        if(shoppingList.length > 0){
          try{  
            await axios.post("http://localhost:8080/api/putusergrocery",{purchaseDate:purchaseDate,queryItems:shoppedList}).then((res)=>{
              if(new Date(purchaseDate).getTime() <= Date.now() &&
              new Date(purchaseDate).getTime() >= Date.now()-30*24*3600*1000){
                localStorage.removeItem('details')
              }
            setShoppingList([]) 
            setOpenAlert({isOpen:true,status:'success'})
            })
          } catch(e){
            console.log(e)
          }
        } else{
          setOpenAlert({isOpen:true,status:'fail'})
        }
      }
      openAlert.isOpen === true && setTimeout(()=>{
        setOpenAlert({isOpen:false,status:'none'})

      },2000)
    }
    return(
        <div className="main" style={{display: 'flex',height:'90vh', flexDirection:'column'}}>
        <SimpleDialog openDialog ={openDialog} itemList={shoppedList} type = {'date'} setDialog={setDialog}></SimpleDialog>
        <div >
        {
          openAlert.isOpen &&
          <Alert variant="filled" severity={openAlert.status==='success'?'success':'error'}>{openAlert.status==='success'?
        'Items sucessfully added to Inventory':'No Items to Add'}</Alert>
        }
        </div>
        <div  style={{display: 'flex',height:'45vh',flexDirection:'column'}}>
        <ItemTable shoppingList={shoppingList} formatItem={formatItem} deleteItem ={deleteItem} addItem={addItem} header={header} type={'presentList'}/>
        </div>
        <div>
        <div style={{backgroundColor:'black', height:'3.5vh', textAlign:'right'}} >
        <SaveIcon style={{color:'white', margin:'auto',marginRight:'5vw'}} onClick={()=>{
          setShoppingList(shoppingList.filter((item,i)=> item.name !== '' && item.qty !== '' && item.qty >0))
          setOpenDialog(true)
        }}/>
        </div>
        <Divider>
        Past Purchase
        </Divider>
        </div>
        <div className="pastlist">
        <ItemTable type={'pastlist'} addItem={addItem} shoppingList={shoppedList} 
        header={[{id:'none',label:'',minWidth: 50},...header.slice(1),
        {id:'comment',label:'Last Purcahse Date',minWidth: 170}]}/>
        </div>
        </div>
    )
}
