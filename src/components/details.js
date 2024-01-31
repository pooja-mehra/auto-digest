import { BarChart } from '@mui/x-charts';
import { useState, useEffect} from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import SimpleDialog from '../functionality/simpleDialog';
import Alert from '@mui/material/Alert';
const base_url = process.env.REACT_APP_BASE_URL

export default function Details(prop) {
    const [openAlert, setOpenAlert] = useState({isOpen:false,status:'none',msg:''});
    const [openDialog, setOpenDialog] = useState(false);
    const [details,setDetails] = useState(() => {
        const storedData = localStorage.getItem('details');
        return storedData ? JSON.parse(storedData) : null;
      });
      const [dateRange,setDateRange] = useState(() => {
        const storedData = localStorage.getItem('daterange');
        return storedData ? JSON.parse(storedData) : null;
      });
    const [item =new Map(),setItem] = useState()

    useEffect(()=>{
        if(details === null && prop.userId !== '' && prop.userId !== null){
            getUserGrocery(null)
        }
        if(item && item.size >0 && details && details.length>0 ){
            let values = Object.keys([...item.values()][0])
            if(details.filter((d,i)=>values.includes(d.name)).length > 0){
                Object.keys([...item.values()][0]).forEach((value,i)=>{
                    alterItems(value,values)                
                })
                let value = [...item.values()]
                let keys = [...item.keys()]
                value.filter((v,index)=>{
                if(Object.values(v).reduce((a,b)=> {return a+b}) === 0){
                    item.delete(keys[index])
                    setItem(new Map(item))
                }})
            } else{
                setItem(new Map())
            }
        }else{
            setItem(new Map())
    }
    },[dateRange,prop])

    useEffect(()=>{
        openAlert.isOpen && openAlert.isOpen === true && setTimeout(()=>{
          setOpenAlert({isOpen:false,status:'none',msg:''})
        },4000)
    },[openAlert])

    const data = (itemIndex) =>{
        const maxLength = Math.max(...details.map(arr => arr.count));
        const mergedData = [];
        const mergedlabel = []
        for (let i = 0; i < maxLength; i++) {
            let dataArray = []
            //let labelArray = []
            for (let j = 0; j < details.length; j++) {
            if (details[j].details[i] !== undefined) {
                dataArray.push({qty:details[j].details[i].items.qty,purchaseDate:details[j].details[i].purchaseDate,name:details[j].name,index:j});
            } else {
                dataArray.push({qty:'',purchaseDate:'',name:details[j].name,index:j});
            }
            }
            mergedData.push(dataArray)
            mergedlabel.push({data:dataArray.map((l,i)=>l.qty),label:'Quantity',stack:'total',
            valueFormatter:((value)=>{
                let qty = dataArray.map((l,i)=>l.qty)
                let purchaseDate =dataArray.map((l,i)=>l.purchaseDate)
                let index = qty.indexOf(value)
               return qty[index]===''?0:qty[index] 
               +' Purchased on '+ new Date(purchaseDate[index]).toLocaleDateString('en-us')
            })
            })
        }
        return mergedlabel
    }
    const alterItems = (itemName,values)=>{
        let filteredDetails = []
        details.forEach((d,i)=>{
            if(values.includes(d.name)){
            d.details.forEach((a,i)=>{
                filteredDetails.push({...a,name:d.name})
            })
        }
        return filteredDetails
        })
        if(item.size > 0){
            for (const [key, value] of item) {
                value[itemName] = 0
            }
        }
        filteredDetails.forEach((d,i)=>{
            if(item.has(d.purchaseDate)){
                let value = item.get(d.purchaseDate)
                let qty = Object.keys(value).includes(itemName)?parseInt(value[itemName]):0
                if(d.name === itemName){
                    value[itemName] = d.qty + qty
                }
                setItem(new Map(item.set(d.purchaseDate,value)))
                } else{
                    setItem(new Map(item.set(d.purchaseDate,{[itemName]:d.qty})))
                    if(values.length > 0){
                        values.forEach((v,i)=>{
                        let obj = item.get(d.purchaseDate)
                        if(!Object.keys(obj).includes(v)){
                            obj[v] = 0
                            setItem(new Map(item.set(d.purchaseDate,{...obj,[v]:0})))
                        }
                    })
                }
        
            }   
        })        
    }
    const handleChange = (event,values,reason) => {
        let itemName = event.target.innerText
        if(reason === 'removeOption' || reason === 'clear'){
            let itemMap = new Map()
            let keys = [...item.keys()]
            let obj = [...item.values()]
            obj.map((item,i)=>{
                let itemObj = {}
                values.forEach((v,index)=>{
                    itemObj[v] = item[v]
            })
            Object.values(itemObj).length === 0 || Object.values(itemObj).filter(e => e > 0).length === 0? itemMap.delete(keys[i]) :itemMap.set(keys[i],itemObj)
            })
            setItem(itemMap)
        } else {
            if(details && details.length > 0){
                alterItems(itemName,values)
            }    
        }
    };


const getData =() =>{
        let data = []
        let keys =[...item.values()]
        Object.keys(keys[0]).forEach((k,i)=>{
            data.push({ dataKey: k, label: k})
        })
        return data
    }

   const getUserGrocery = async(dateRange) =>{
    if(details === null){
        try{
            await axios.get(`${base_url}api/getallusergrocery`,{headers: {
                Authorization: `Bearer ${prop.userId}`,
                Accept: 'application/json'
            }}).then((res)=>{
            if(res && res.data.length > 0){
                localStorage.setItem('details',JSON.stringify(res.data))
                setDetails(res.data)
            } else{
                localStorage.setItem('details',[])
                setDetails([])
                setOpenAlert({isOpen:true,status:'error',msg:'No Details Found!'})
            }
            })
        } catch(e){
            console.log(e)
        }
        dateRange && localStorage.removeItem('daterange')
        setDateRange(null)
    }else{
        localStorage.getItem('details') && localStorage.getItem('details').length >0  ? setDetails(JSON.parse(localStorage.getItem('details')).map((item,index)=> 
        ({count:item.count,name:item.name,qty:item.qty,details:item.details.filter((d,i)=>
            new Date(d.purchaseDate) >= new Date(dateRange.startDate) && 
            new Date(d.purchaseDate) <= new Date(dateRange.endDate))})).filter((m,i)=> m.details.length>0)) :
            setOpenAlert({isOpen:true,status:'error',msg:'No Details Found!'})
        localStorage.setItem('daterange',JSON.stringify({startDate:dateRange.startDate,endDate:dateRange.endDate}))
        setDateRange({startDate:dateRange.startDate,endDate:dateRange.endDate})
    }
    }
    
    const setDialog = async (isOpen, isCancel, purchaseDaterange) =>{
        setOpenDialog(isOpen)
        if(!isCancel){
            await getUserGrocery({startDate:purchaseDaterange.startDate,endDate:purchaseDaterange.endDate})
        }  
    }

    return (
        <div className="main" >
            <div className="listHeader">
            {
                (details !== null || (details && details.length >0)) &&
                <div style={{display:'flex'}}>
                <Autocomplete
                multiple
                limitTags={2}
                id="combo-box-demo"
                options={details.map((d,i)=>d.name)}
                getOptionLabel={(option) => option}
                onChange={(e,v,r)=>handleChange(e,v,r)}
                sx={{width:'50vw'}}
                value={item.size>0?Object.keys([...item.values()][0]):[]}
                renderInput={(params) => <TextField {...params}  label="Select Item"/>}
            />
            </div>
            }
            <Button size="large" variant="outlined" style={{color:'grey', borderColor:'grey', border:'solid 0.5px'}} 
            onClick={()=>{ prop.userId === '' || prop.userId === null ? setOpenAlert({isOpen:true, status:'error',msg:'Please SIGNIN to proceed'}) : setOpenDialog(true)
            }}> Purchase Date</Button>
        </div>
        <div style={{maxWidth:'100vw', width:'auto', maxHeight:'50vh', height:'auto',marginTop:'2vh'}} >
        {
            (details !== null && (details && details.length >0)) && item.size === 0 &&
            <BarChart
            height={450}
            dataset={details}
            series={[{dataKey:'qty',label:'Total Quantity',}]}
            slotProps={{                
                legend: {
                 hidden:true
                },
                /*bar: { 
                    onClick: (event) => {console.log(event)} 
                }*/
              }}
            yAxis={[{label:'Total Quantity'}]}
            xAxis={[{ scaleType: 'band', dataset:details,
            dataKey:'name',
            label:dateRange === null ? '' :'(Date Range: '+ new Date(dateRange.startDate).toLocaleDateString('en-us') +' - '+ new Date(dateRange.endDate).toLocaleDateString('en-us')+ ' )' 
        }]}
            />  }
        {
        (details !== null || (details && details.length >0)) && item.size > 0 &&
        <BarChart
        height={450}
        dataset={[...item.values()]}
        series={getData()}
        slotProps={{
            legend: {
              direction: 'row',
              position: { vertical: 'top', horizontal: 'middle' },
              padding: 0,
            },
          }}
        yAxis={[{label:'Quantity'}]}
        xAxis={[{ scaleType: 'band', data:[...item.keys()], 
        valueFormatter:(value)=>{
            return(new Date(value).toLocaleDateString('en-us'))},label:dateRange === null ? '' : '(Date Range: '+ new Date(dateRange.startDate).toLocaleDateString('en-us') +' - '+ new Date(dateRange.endDate).toLocaleDateString('en-us')+ ' )' }]}
        />}
        {
            openAlert.isOpen &&
            <Alert variant="filled" severity={openAlert.status}>{openAlert.msg}</Alert>
              
        }
        </div>
        
        {
            <SimpleDialog openDialog ={openDialog} type={'daterange'} setDialog={setDialog}></SimpleDialog>
        }
        </div>
    );
}
