import "./shoppinglist.css";
import ItemTable from '../functionality/itemTable';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState} from 'react';
import axios from 'axios';
import SimpleDialog from '../functionality/simpleDialog'
import Alert from '@mui/material/Alert';
import ClearIcon from '@mui/icons-material/Clear';
import Tooltip from '@mui/material/Tooltip';
import AddBoxIcon from '@mui/icons-material/AddBox';
import TableToolbar from '../functionality/tabletoolbar';
import Fab from '@mui/material/Fab';
import Button from '@mui/material/Button';
import {isMobile} from 'react-device-detect';
import SaveIcon from '@mui/icons-material/Save';
import ClearAllDialog from "../shared/cleardialog";
import InventoryFilters from "../shared/inventoryfilters";
import useWebSocket from 'react-use-websocket';

const base_url = process.env.REACT_APP_BASE_URL
const ws_url = process.env.REACT_APP_WS

export default function ShoppingList(prop) {
    const [shoppingList,setShoppingList] = useState(
      () => {
        const storedData = window.sessionStorage.getItem('shoppinglist');
        return storedData ? JSON.parse(storedData) : {listName:'',items:[],permission:'',ownedBy:''};
      })
      const [shoppingListNames,setShoppingListNames] = useState(
        () => {
          const storedData = window.sessionStorage.getItem('shoppinglistnames');
          return storedData ? JSON.parse(storedData) : [];
        })
    const [shoppedList,setShoppedList] = useState([])
    const [openDialog, setOpenDialog] = useState({isOpen:false,dialogType:''});
    const [openAlert, setOpenAlert] = useState({isOpen:false,status:'none',msg:''});
    const [details, setDetails]  = useState(null)
    const [consumed,setConsumed] = useState({used:0,left:0})
    const header=[{id:'addicon',label:<Fab size="small" aria-label="add"><AddIcon /></Fab>,maxWidth: 50,type:'icon'},
    {id:'name',label:'Name',minWidth: 50, type:"string"},
    {id:'qty',label:'Quantity',minWidth: 50, type:"number"}]
    const  shoppedHeader=[{id:'none',label:'',minWidth: 50},
    {id:'name',label:'Name',minWidth: 50, type:"string"},
    {id:'left',label:'Quantity Left',minWidth: 50, type:"number"},
    {id:'lastPurchaseDate',label:'Last Purcahse Date',minWidth: 50},
    {id:'frequency', label:' Buying Frequency', minWidth: 50},
    {id:'account',label:'Account',minWidth: 50},
    {id:'details',label:'',minWidth: 50}]

    const [socketUrl] = useState(ws_url); 
    const { sendMessage, lastMessage } = useWebSocket(socketUrl);

    useEffect(() => {
      if (lastMessage && lastMessage.data) {
        lastMessage.data.text().then((d)=>{
          const notification =  JSON.parse(d)
          if(notification.channel === 'delete-list' && notification.ownedBy !== prop.userEmail){
            setShoppingListNames(shoppingListNames.filter(list => list.listName !== notification.listName ))
            shoppingList.listName === notification.listName && shoppingList.ownedBy === notification.ownedBy && setShoppingList({listName:'',items:[],permission:'',ownedBy:''})
            setOpenAlert({isOpen:true, status:'warning',msg:notification.listName +' has been deleted by '+ notification.ownedBy})
          }
          if(notification.channel === 'edit-list' && notification.editor !== prop.userEmail){
            shoppingList.listName === notification.listName && shoppingList.ownedBy === notification.ownedBy && setShoppingList({...shoppingList, items:notification.items})
            setOpenAlert({isOpen:true, status:'success',msg:notification.listName +' has been changed by ' + notification.editor})
          }
          if(notification.channel === 'share-list' && notification.ownedBy !== prop.userEmail){
            setShoppingListNames([...shoppingListNames,{listName:notification.listName, permission:notification.permission,details:{ownedBy:notification.ownedBy}}])
            setOpenAlert({isOpen:true, status:'success',msg:notification.listName +' has been shared by '+notification.ownedBy + ' to ' +notification.permission})
          }
        })
      }
    }, [lastMessage]);

    useEffect(()=>{
      prop && prop.accounts && prop.accounts.length>0 && getUserGrocery(prop.accounts)
      details && setConsumed({used:details.used?details.used:0,left:details.used?details.qty-details.used:details.qty})
    },[details,prop])

    useEffect(()=>{
      openAlert.isOpen && openAlert.isOpen === true && setTimeout(()=>{
        setOpenAlert({isOpen:false,status:'none',msg:''})
      },4000)
    },[openAlert])

    /*useEffect(()=>{
        const filteredShoppingList = shoppingList.items.filter((item,index)=>item.name !== '')      
        if(filteredShoppingList && filteredShoppingList.length>0){
          //window.sessionStorage.setItem('shoppinglist',JSON.stringify({...shoppingList,
          //items:shoppingList.items.filter((item,i)=>item.name !== '' && item.qty !=='' && item.qty >0)}))
        }
    },[shoppingList])*/

    useEffect(()=>{
      shoppingListNames.length === 0 && prop.userId !== '' && prop.userId !== null && getUserShoppingListNames()
    })

    const getUserGrocery = async (accounts) =>{
      let userEmails = accounts.length > 0 ? accounts.filter((c)=>c.email !== 'All' && c.details.level !== 'shopping').map((a)=>a.email):[]
      if(userEmails.length > 0 && prop.userId !== '' && prop.userId !== null && details === null){
          try{
            await axios.get(`${base_url}api/getallusersgrocery`,{
              params:{userEmails:userEmails},
              headers: {
              Authorization: `Bearer ${prop.userId}`,
              Accept: 'application/json'
          }}).then((res)=>{
            if(res && res.data.length > 0){
              let data = res.data.map((inv,i)=> {return inv.inventories
                .map((d)=> ({...d,account:inv.email.filter((e)=>e !== null)[0],permission:accounts.filter((a)=>a.email === inv.email.filter((e)=>e !== null)[0]).map((i)=>i.details.permission)[0]}))
                })
                let list =[]
                data.forEach((d,i)=>{
                  list.push(...d)
                })
              window.sessionStorage.setItem('details',JSON.stringify(list))
              setDetails(list)
            } 
            })
          } catch(e){
            setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
          }
      } 
      if(details !== null || (details && details.length > 0)){
        let details = JSON.parse(sessionStorage.getItem('details'))
        userEmails.length === 0 ? setShoppedList([]) :
        setShoppedList(details.filter((d)=>userEmails.includes(d.account))
          .map((detail)=>{return {...detail,lastPurchaseDate: new Date(detail.lastPurchaseDate).toLocaleDateString('en-us'),
          daysTillNow:detail.daysTillNow,frequency:calcFrequency(detail.qty,detail.daysTillNow)}})
          .sort((a,b)=> new Date(b.lastPurchaseDate).getTime() - new Date(a.lastPurchaseDate).getTime()))
      }
    }

    const getAllUserGrocery = async(details) =>{
     if(details === null && prop.userId !== '' && prop.userId !== null){
        try{
          await axios.get(`${base_url}api/getallusergrocery`,{headers: {
            Authorization: `Bearer ${prop.userId}`,
            Accept: 'application/json'
        }}).then((res)=>{
          if(res && res.data.length > 0){
            details = res.data[0].inventories
            window.sessionStorage.setItem('details',JSON.stringify(details))
          } 
          })
        } catch(e){
          setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
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
      setShoppingList({...shoppingList,items:shoppingList.items.map((s,i)=>{
        if(s.name === row.name && s.name !== '' && !itemExists){
            itemExists = true
            return {...s,qty:parseInt(s.qty)+1}
      }
      return s
      })})
      if(!itemExists){
        shoppingList.items.length === 0 ? setShoppingList({...shoppingList,items:[{name:row.name,qty:1}]}): 
        setShoppingList({...shoppingList,items:[{name:row.name,qty:1},...shoppingList.items]})
      }
      row  && row.left> 0 && setOpenAlert({isOpen:true,status:'warning',msg:row.left+' more ' + row.name+' left from past purchase'})
    }

    const deleteItem = (i,page,rowsPerPage) =>{
      setShoppingList({...shoppingList,items:shoppingList.items.filter((item,index)=> index !== (i+(page*rowsPerPage)))})

    };

    const formatItem =(label,text,page,rowsPerPage,i)=>{
      setShoppingList({...shoppingList,items:shoppingList.items.map((item,index)=> {
        if(index === (i+(page*rowsPerPage))){
          return ({...item,[label]:text.toUpperCase()})
        } else{
          return item
        }
      })})
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
      if(prop && prop.userId !== null && prop.userId !== ''){
      setOpenDialog({isOpen:isOpen,dialogType:'simple'})
      if(!isCancel){
        if(shoppingList.items.length > 0){
          let shoppingListQuery = mergeShoppingList(shoppingList.items)
          if(shoppingList.listName !== ''){
            setUserShoppingList()
          }
          try{  
            await axios.post(`${base_url}api/putusergrocery`,{purchaseDate:purchaseDate,queryItems:shoppingListQuery},
            {headers: {
              Authorization: `Bearer ${prop.userId}`,
              Accept: 'application/json'}
            })
            .then((res)=>{
              if(res && res.data && res.data.success === true){
                //getUserGrocery(prop.accounts)
                setDetails(null)
                setShoppingList({listName:'',items:[],permission:'',ownedBy:''}) 
                //window.sessionStorage.setItem('shoppinglist',JSON.stringify({listName:'',items:[]}))
                setOpenAlert({isOpen:true,status:'success',msg:'Items sucessfully added to Inventory'})
              }
            })
          } catch(e){
            setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
          }
        } else{
          setOpenAlert({isOpen:true,status:'error',msg:'No Items to Add'})
        }
      }} else{
        setOpenAlert({isOpen:true,status:'error',msg:'Please SIGNIN to proceed'})
      }
    }
    const getDetails = (name,account) =>{
      if(window.sessionStorage.getItem('details') && JSON.parse(window.sessionStorage.getItem('details')).length > 0){
        let data = JSON.parse(window.sessionStorage.getItem('details'))
        .filter((item,i)=> item.name === name && item.account === account)
        data && data.length > 0 && setDetails(data[0])
      } else{
        setDetails(null)
        //prop && prop.userId !== null && prop.userId !== '' && prop.accounts && getUserGrocery(prop.accounts)
      }
    }

    const changeDetails = (used,left) =>{
      setConsumed({used:used,left:left})
    }

    const updateItem = async() =>{
      if(prop && prop.userId !== null && prop.userId !== ''){ 
        const itemName = details.name
        const isAccount = details.account === prop.userEmail 
        try{
          await axios.post(`${base_url}api/updateusergrocerybyname`,{email:prop.userEmail,name:details.name,used:consumed.used,isAccount:isAccount,account:details.account},
          {headers: {
            Authorization: `Bearer ${prop.userId}`,
            Accept: 'application/json'}
          })
          .then((res)=>{
            if(res && res.status === 200 && res.data.acknowledged){
                res.data.modifiedCount > 0 &&  setDetails(null)//getUserGrocery(prop.accounts)
                setOpenAlert({isOpen:true,status:'success',msg:`Successfully updated item: ${itemName}`})
            }
          })
        } catch(e){
          setOpenAlert({isOpen:false,status:'error',msg:`Failed to updated item: ${itemName}`})
        }
      }else{
        setOpenAlert({isOpen:false,status:'error',msg:'Please SIGNIN to proceed'})
      }
       
    }

    const editOwnerShoppingList = async() =>{
      const filteredShoppingList = shoppingList.items.filter((item,index)=>item.name !== '')   
      const listName = shoppingList.listName.replace(/[^a-zA-Z ]/g,"").replace(/^\s+|\s+$/g, "")
      if(filteredShoppingList && listName && listName !== '' && prop.userId !== null && prop.userId !== '' && shoppingList.permission === 'Edit Only'){
        let shoppingListQuery = mergeShoppingList(filteredShoppingList)
        try{  
          await axios.post(`${base_url}api/editownershoppinglist`,
            {listName:shoppingList.listName,queryItems:shoppingListQuery, editorEmail:prop.userEmail, ownerEmail:shoppingList.ownedBy},
            )
          .then((res)=>{
            if(res && res.status === 200 ){
              setOpenAlert({isOpen:true,status:'success',msg:'Shopping List created/updated under Name: '+ shoppingList.listName})
              //getUserShoppingListNames()
            }
        })
        } catch(e){
          setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
        }
      }
    }

    const setUserShoppingList = async () =>{
      const filteredShoppingList = shoppingList.items.filter((item,index)=>item.name !== '')   
      const listName = shoppingList.listName.replace(/[^a-zA-Z ]/g,"").replace(/^\s+|\s+$/g, "")
      if(filteredShoppingList && listName && listName !== '' && prop.userId !== null && prop.userId !== ''){
        let shoppingListQuery = mergeShoppingList(filteredShoppingList)
        try{  
          await axios.post(`${base_url}api/putusershoppinglist`,
            {listName:shoppingList.listName,queryItems:shoppingListQuery, ownerEmail:prop.userEmail},
            {headers: {
              Authorization: `Bearer ${prop.userId}`,
              Accept: 'application/json'}}
            )
          .then((res)=>{
            if(res && res.status === 200){
              setOpenAlert({isOpen:true,status:'success',msg:'Shopping List created/updated under Name: '+ shoppingList.listName})
              getUserShoppingListNames()
            }
        })
        } catch(e){
          setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
        }
      }else{
        filteredShoppingList.length > 0 && listName === '' && setOpenAlert({isOpen:true,status:'error',msg:'Please add Title'})
        (prop.userId === null || prop.userId === '') && setOpenAlert({isOpen:true,status:'error',msg:'Please SIGNIN to proceed'})
        if(filteredShoppingList.length === 0 ){
          //window.sessionStorage.setItem('shoppinglist',JSON.stringify({listName:'',items:[]}))
          setShoppingList({listName:'',items:[],permission:'',ownedBy:''}) 
        }
      }   
    }

    const getUserShoppingListNames = async(details) =>{
      let shoppingLists = []
      try{
          await axios.get(`${base_url}api/getusershoppinglistnames`,{headers: {
            Authorization: `Bearer ${prop.userId}`,
            Accept: 'application/json'
        }}).then((res)=>{
          if(res && res.data){
            if(res.data.ownedLists){
              const ownedListNames = res.data.ownedLists.map((d,i)=>{
                return {listName:d.listName, permission:'Owner',details:{ownedBy:'You',viewers:d.viewers,editors:d.editors}}})
                shoppingLists = [...shoppingLists,...ownedListNames]
            }
            if(res.data.viewableLists){
              const viewableListNames = res.data.viewableLists.map((d,i)=>{
                return {listName:d.listName, permission:'View Only',details:{ownedBy:d.ownerEmail}}})
                shoppingLists = [...shoppingLists,...viewableListNames]

            }
            if(res.data.editableLists){
              const editableListNames = res.data.editableLists.map((d,i)=>{
                return {listName:d.listName, permission:'Edit Only',details:{ownedBy:d.ownerEmail}}})
                shoppingLists = [...shoppingLists,...editableListNames]

            }
              if(shoppingLists && shoppingLists.length > 0){
                //window.sessionStorage.setItem('shoppinglistnames',JSON.stringify(shoppingLists))
                setShoppingListNames(shoppingLists)
              }
           } 
           })
         } catch(e){
          setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
        }
        sendMessage(JSON.stringify({userEmail:prop.userEmail,lists:shoppingLists}))
    }

    const setShoppingListTitle = (title) =>{
      if(title && title.trim() !== ''){
        setShoppingList({...shoppingList,listName:title.trim(),permission:'Owner',ownedBy:prop.userEmail})
      } else{
        setOpenAlert({isOpen:true,status:'error',msg:'Invalid Title'})
      }
    }

    const getShoppingListByName = async(listDetails) =>{
      if(prop.userId !== '' && prop.userId !== null){
        try{
          await axios.get(`${base_url}api/getshoppinglistbyname`,{params:{listDetails:listDetails,email:prop.userEmail},
          headers: {
            Authorization: `Bearer ${prop.userId}`,
            Accept: 'application/json'
          }}).then((res)=>{
           if(res && res.data && res.data.length>0){
            //window.sessionStorage.setItem('shoppinglist',JSON.stringify({listName:listDetails.listName,items:[...res.data[0].shoppingLists[0].items],permission:res.data[0].permission}))
             setShoppingList({listName:listDetails.listName,items:[...res.data[0].shoppingLists[0].items],
              permission:res.data[0].permission, ownedBy:res.data[0].ownedBy})
           } 
           })
         } catch(e){
          setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
        } 
        sendMessage(JSON.stringify({userEmail:prop.userEmail,listName:listDetails.listName, lists:shoppingListNames}))
      } else{
        setOpenAlert({isOpen:true,status:'error',msg:'Please SIGNIN to proceed'})
      }
    }

    const deleteList = async (option) =>{
      if(prop.userId !== '' && prop.userId !== null){
        try{
          await axios.post(`${base_url}api/deleteshoppinglistbyname`,
          {listName: option.listName, ownerEmail:prop.userEmail }, 
          {headers: { Authorization: `Bearer ${prop.userId}`,Accept: 'application/json'} })
          .then(function (res) {
            if(res && res.status === 200){
              const names = shoppingListNames.filter((list) => list.listName !== option.listName)
              setShoppingListNames(names)
              //window.sessionStorage.setItem('shoppinglistnames',JSON.stringify(names))
              //window.sessionStorage.setItem('shoppinglist',JSON.stringify({listName:'',items:[],permission:''}))
              setShoppingList({listName:'',items:[],permission:'',ownedBy:''})
            }  
        })
        } catch(e){
          setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
        }
      }
    }

    const clearAll = (isClear) =>{
      if(isClear){
        //window.sessionStorage.setItem('shoppinglist',JSON.stringify({...shoppingList,items:[]}))
        setShoppingList({...shoppingList,items:[]})
      }
      setOpenDialog({isOpen:false,dialogType:'clear'})
    }

    const setpermissions = async(permission,emails,listName) =>{
      try{
        await axios.post(`${base_url}api/putcollaborator`,{colaboratorEmails:emails,permission:permission,
          invitationDate:new Date(Date.now()),level:'shoppinglist',listName:listName,ownerEmail:prop.userEmail},
          {headers: {
            Authorization: `Bearer ${prop.userId}`,
            Accept: 'application/json'}}).then((res)=>{
              if(res && res.status === 200){
                setOpenAlert({isOpen:true, status:'success', msg:'Request sent!'})
              }
            })
            
      } catch (e){
        setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
      }
    }

    return(
        <div className="main" style={{display: 'flex',height:'80vh', flexDirection:'column'}}>
        <div className="layout">
        <TableToolbar listName={shoppingList.listName} items = {shoppingList.items} setShoppingListTitle={setShoppingListTitle} 
        listNames={shoppingListNames} getShoppingListByName={getShoppingListByName} deleteList={deleteList}
        userId={prop.userId} setpermissions={setpermissions}></TableToolbar>
        <div className='presentlist'>
        <ItemTable shoppingList={shoppingList.items} permission={shoppingList.permission} formatItem={formatItem} deleteItem ={deleteItem} addItem={addItem} header={header} type={'shoppingList'}/>
        <div style={{width:'95%'}}>
        {
          openAlert.isOpen &&
          <Alert severity={openAlert.status}>{openAlert.msg}</Alert>
        }
          <div className='shoppinglistFooter'>
          <div  className="shoppingfile-upload">
                <Tooltip title='Save Shopping List' enterTouchDelay={0}>
                <Button size="small" variant="contained"  id='savelist' onClick={()=>{
                  shoppingList.ownedBy === prop.userEmail ?setUserShoppingList(): editOwnerShoppingList()
                }}>
                {!isMobile && 
                  <AddBoxIcon size="small" />
                }
                Save Shopping List</Button>
              </Tooltip>
            </div>
            <div  className="shoppingfile-upload">
                <Tooltip title='Clear List' enterTouchDelay={0}>
                <Button size="small"  variant="contained" onClick={()=>{
                  setOpenDialog({isOpen:true,dialogType:'clear'})
                }}>
                {!isMobile && 
                  <ClearIcon size="small"/>
                }
                Clear List</Button>
              </Tooltip>
            </div>
            <div className='shoppingfile-upload'>
              <Tooltip title='Save Inventory' enterTouchDelay={0}>
              <Button size="small" variant="contained" id='saveinventory' onClick={()=>{
                setShoppingList({...shoppingList,items:shoppingList.items.filter((item,i)=> item.name !== '' && item.qty !== '' && item.qty >0)})
                prop.userId === '' || prop.userId === null ? setOpenAlert({isOpen:true, status:'error',msg:'Please SIGNIN to proceed'}) : setOpenDialog({isOpen:true,dialogType:'simple'})
              }}>
              {
                !isMobile && 
                  <SaveIcon size="small"/>
              }
              Save Inventory</Button>
              </Tooltip>
            </div>
            </div>
          </div>
        </div>
        </div>
        <div className="layout">
        {
          prop.userEmail && prop.userId && prop.accounts &&  prop.accounts.length > 0 &&
          <InventoryFilters getUserGrocery ={getUserGrocery} accounts={prop.accounts} />
        }
        {
          (details !== null || details !== undefined) &&
          <div className="pastlist" >
          {
            <div id='inventorytable' style={{display:'flex', paddingTop:'4vh', width:'95vw'}}></div>
          }
            <ItemTable type={'pastList'} addItem={addItem} shoppingList={shoppedList} consumed={consumed}
            changeDetails ={changeDetails} getDetails ={getDetails} details={details} updateItem ={updateItem}
            header={shoppedHeader}>
            </ItemTable>
          </div>

        }
        </div>
        {
          openDialog.dialogType === 'simple'?
          <SimpleDialog openDialog ={openDialog.isOpen} itemList={shoppedList} type = {'date'} setDialog={setDialog}></SimpleDialog>
          :openDialog.dialogType === 'clear' &&
          <ClearAllDialog openClearAllDialog = {openDialog.isOpen} clearAll = {clearAll} isDelete ={false}></ClearAllDialog>
        }
        </div>
    )
}
