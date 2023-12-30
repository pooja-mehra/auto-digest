import { LineChart, BarChart, getValueToPositionMapper } from '@mui/x-charts';
import { useState, useEffect} from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import SimpleDialog from '../functionality/simpleDialog';

export default function Details() {
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
        if(dateRange == null){
            getUserGrocery(null)
        } else{
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
            } 
        }else{
            setItem(new Map())
        }
        }
    },[dateRange])

    const data = (itemIndex) =>{
        const maxLength = Math.max(...details.map(arr => arr.count));
        const mergedData = [];
        const mergedlabel = []
        for (let i = 0; i < maxLength; i++) {
            let dataArray = []
            //let labelArray = []
            for (let j = 0; j < details.length; j++) {
            if (details[j].details[i] !== undefined) {
                //labelArray.push(details[j].details[i].items.qty)
                dataArray.push({qty:details[j].details[i].items.qty,purchaseDate:details[j].details[i].purchaseDate,name:details[j].name,index:j});
            } else {
                dataArray.push({qty:'',purchaseDate:'',name:details[j].name,index:j});
                //labelArray.push('')
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
        let filteredDetails = details.filter((d,i)=>values.includes(d.name)).map((item,i)=> item.details)
        .reduce((p,c)=>{return [...p,...c]})
        if(item.size > 0){
            for (const [key, value] of item) {
                value[itemName] = 0
            }
        }
        filteredDetails.forEach((d,i)=>{
                if(item.has(d.purchaseDate)){
                    let value = item.get(d.purchaseDate)
                    if(d.items.name === itemName){
                        value[itemName] = d.items.qty
                    }
                    setItem(new Map(item.set(d.purchaseDate,value)))
                    } else{
                        setItem(new Map(item.set(d.purchaseDate,{[itemName]:d.items.qty})))
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
    const startDate = dateRange == null ? new Date(new Date(Date.now()).getTime() - 30 * 24 * 3600 * 1000):new Date(dateRange.startDate)
    const endDate = dateRange == null ? new Date(Date.now()):new Date(dateRange.endDate)
        try{
            await axios.get("http://localhost:8080/api/getusergrocery",{params:{startDate:startDate,endDate:endDate}}).then((res)=>{
            //let dataMap = new Map()
            if(res && res.data.length > 0){
                /*let result= res.data.map((d,i)=> {return d.items.reduce((acc, details) => {
                    acc[details.name] = { qty: details.qty, abbr: details.abbr,purchaseDate:new Date(d.purchaseDate).toLocaleDateString("en-US") };
                    return acc;},{})
                })
                    result.forEach(r => {
                    Object.entries(r).forEach(([k,v])=>{
                        if(dataMap.has(k)){
                            let value = {totalQty:dataMap.get(k).totalQty + v.qty, abbr:[...dataMap.get(k).abbr,...v.abbr], purchaseDate:[...dataMap.get(k).purchaseDate,v.purchaseDate],qty:[...dataMap.get(k).qty,v.qty]}
                            dataMap.set(k,value)
                        } else{
                            dataMap.set(k,{totalQty:v.qty,abbr:v.abbr,purchaseDate:[v.purchaseDate],qty:[v.qty]})
                        }
                    })
                    
                });*/
                
                localStorage.setItem('details',JSON.stringify(res.data))
                setDetails(res.data)
            } else{
                localStorage.removeItem('details')
                setDetails(null)
            }
            localStorage.setItem('daterange',JSON.stringify({startDate:startDate,endDate:endDate}))
            setDateRange({startDate:startDate,endDate:endDate})
            })
        } catch(e){
            console.log(e)
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
        <div className='parent'>
        <div className="listHeader">
        {
            details !== null &&
            <div style={{display:'flex'}}>
            <Autocomplete
            multiple
            limitTags={2}
            id="combo-box-demo"
            options={details.map((d,i)=>d.name)}
            getOptionLabel={(option) => option}
            onChange={(e,v,r)=>handleChange(e,v,r)}
            sx={{width:'50vw'}}
            renderInput={(params) => <TextField {...params} label="Item name" />}
        />
        </div>
    
        }
        <Button size="large" variant="outlined" style={{color:'grey', borderColor:'grey', border:'solid 0.5px'}} onClick={()=>setOpenDialog(true)}> Purchase Date</Button>

        </div>
        </div>
        <div style={{maxWidth:'100vw', width:'auto', maxHeight:'50vh', height:'auto',marginTop:'2vh'}}>
        {
            details != null && item.size === 0 &&
            <BarChart
            height={450}
            dataset={details}
            series={[{dataKey:'qty',label:'Total Quantity'}]}
            slotProps={{
                legend: {
                 hidden:true
                },
              }}
            yAxis={[{label:'Total Quantity'}]}
            xAxis={[{ scaleType: 'band', dataset:details,
            dataKey:'name',
            label:'(Date Range: '+ new Date(dateRange.startDate).toLocaleDateString('en-us') +' - '+ new Date(dateRange.endDate).toLocaleDateString('en-us')+ ' )' }]}
            />  }
        {
        details !== null && item.size > 0 &&
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
            return(new Date(value).toLocaleDateString('en-us'))},label:'(Date Range: '+ new Date(dateRange.startDate).toLocaleDateString('en-us') +' - '+ new Date(dateRange.endDate).toLocaleDateString('en-us')+ ' )' }]}
        />}
        </div>
        <SimpleDialog openDialog ={openDialog} type={'daterange'} setDialog={setDialog}></SimpleDialog>
        </div>
    );
}
