import React, { useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextExtractor from "./textextractor";
import Details from "./details";
import InsightsIcon from '@mui/icons-material/Insights';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingList from "./shoppinglist";
import { UserContext } from "../App"

export default function HeaderTabs() {
    const [tabNumber, setTabNumber] = useState(()=>{
        const number = localStorage.getItem('tabnumber')
        return number ? parseInt(number) :0
    });
    const handleChange = (event, newValue) => {
        setTabNumber(newValue);
        localStorage.setItem('tabnumber',newValue)
    };
   
    return (
        <div>
        <Tabs value={tabNumber} onChange={handleChange} aria-label="icon tabs example" style={{height:'auto',backgroundColor:'#673ab7'}}>
            <Tab icon={<LibraryAddIcon />} style={{width:'calc(100vw / 4)' ,margin:'auto',color:'white'}} aria-label="upload" label="Add to Inventory">
            </Tab>
            <Tab icon={<InsightsIcon />} style={{width:'calc(100vw / 4)' ,margin:'auto',color:'white'}} aria-label="detail" label="Insights"/>
            <Tab icon={<AddShoppingCartIcon />} style={{width:'calc(100vw / 4)' ,margin:'auto',color:'white'}} aria-label="detail" label="Shopping List"/>

        </Tabs>       
        <div>
            {
                tabNumber === 0 &&
                <UserContext.Consumer>
                {value => <TextExtractor userId={value}/>}
                </UserContext.Consumer>
            }
            {
                tabNumber === 1 &&
                <UserContext.Consumer>
                {value => <Details userId={value}/>}
                </UserContext.Consumer>
                
            }
            {
                tabNumber === 2 &&
                <UserContext.Consumer>
                {value => <ShoppingList userId={value}/>}
                </UserContext.Consumer>

            }
        </div>
        </div>
    );
}