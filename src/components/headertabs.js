import React, { useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextExtractor from "./textextractor";
import Details from "./details";
import InsightsIcon from '@mui/icons-material/Insights';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingList from "./shoppinglist";

export default function HeaderTabs() {
    const [tabNumber, setTabNumber] = useState(0);
    const handleChange = (event, newValue) => {
        setTabNumber(newValue);
    };
    return (
        <div>
        <Tabs value={tabNumber} onChange={handleChange} aria-label="icon tabs example" style={{backgroundColor:'black'}}>
            <Tab icon={<LibraryAddIcon />} style={{width:'calc(100vw / 4)' ,color:'white',margin:'auto'}} aria-label="upload" label="Add to Inventory">
            </Tab>
            <Tab icon={<InsightsIcon />} style={{width:'calc(100vw / 4)' ,color:'white',margin:'auto'}} aria-label="detail" label="Insights"/>
            <Tab icon={<AddShoppingCartIcon />} style={{width:'calc(100vw / 4)' ,color:'white',margin:'auto'}} aria-label="detail" label="Shopping List"/>

        </Tabs>       
        <div>
            {
                tabNumber === 0 &&
                <TextExtractor/>
            }
            {
                tabNumber === 1 &&
                <Details/>
            }
            {
                tabNumber === 2 &&
                <ShoppingList/>
            }
        </div>
        </div>
    );
}