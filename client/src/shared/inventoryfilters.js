import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

export default function InventoryFilters(props){
    const [selectedColaborator,setSelectedColaborator] = useState(props.accounts.map((a)=>a.email))

    useEffect(()=>{
        selectedColaborator.length > 0 ? props.getUserGrocery(props.accounts.filter((a)=>selectedColaborator.includes(a.email)))
        : props.getUserGrocery([])
    },[selectedColaborator])
 
    return (
        <div style={{width:'95vw', margin:'auto', marginBotom:'0px' ,paddingTop:'1vh'}}> 
        <Autocomplete
        multiple
        limitTags={2}
        id="checkboxes-tags-demo"
        options={props.accounts.map((a)=>a.email)}
        disableCloseOnSelect
        getOptionLabel={(option) => option}
        value={selectedColaborator}
        onChange={(e,v,r,d)=>{
            if(d.option === 'All'){
                r === 'selectOption' ? setSelectedColaborator([...props.accounts.map((a)=>a.email)]) :setSelectedColaborator([])
            } else{
                r === 'selectOption' ? setSelectedColaborator([...v])
                : setSelectedColaborator(selectedColaborator.filter((s)=>s !== d.option && s !== 'All'))
            }
        }}
        
        style={{ width: 500 }}
        renderInput={(params) => (
            <TextField {...params} label="Accounts" placeholder="Select Accounts">
            </TextField>
        )}
        >
        </Autocomplete>
        </div>
    )
}