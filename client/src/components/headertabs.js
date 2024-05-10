import React, { Fragment, useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TextExtractor from "./textextractor";
import Details from "./details";
import InsightsIcon from '@mui/icons-material/Insights';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ShoppingList from "./shoppinglist";
import { UserContext } from "../App"
import { DemoContext } from "../App";

export default function HeaderTabs() {
    const [tabNumber, setTabNumber] = useState(()=>{
        const number = window.sessionStorage.getItem('tabnumber')
        return number ? parseInt(number) :0
    });
    const handleChange = (event, newValue) => {
        setTabNumber(newValue);
        window.sessionStorage.setItem('tabnumber',newValue)
    };
   
    return (
        <div>
        <Tabs value={tabNumber} onChange={handleChange} aria-label="icon tabs example" style={{height:'auto',backgroundColor:'#673ab7'}}>
            <Tab icon={<LibraryAddIcon id="addtoinventory"/>} style={{width:'calc(100vw / 4)' ,margin:'auto',color:'white'}} aria-label="upload" label="Add to Inventory">
            </Tab>
            <Tab icon={<InsightsIcon id= "insights"/>} style={{width:'calc(100vw / 4)' ,margin:'auto',color:'white'}} aria-label="detail" label="Insights"/>
            <Tab icon={<AddShoppingCartIcon id="shopping"/>} style={{width:'calc(100vw / 4)' ,margin:'auto',color:'white'}} aria-label="detail" label="Shopping"/>

        </Tabs>       
        <div>
            {
                tabNumber === 0 &&
                <Fragment>
                <UserContext.Consumer>
                {value => <TextExtractor userId={value?value.userId:null}/>}
                </UserContext.Consumer>
                <DemoContext.Consumer>
                {value => <TextExtractor demo={value?value:null}/>}
                </DemoContext.Consumer>
                </Fragment>
            }
            {
                tabNumber === 1 &&
                <UserContext.Consumer>
                {value => <Details userId={value?value.userId:null} userEmail={value?value.email:null}/>}
                </UserContext.Consumer>
                
            }
            {
                tabNumber === 2 &&
                <UserContext.Consumer>
                {value => <ShoppingList userId={value?value.userId:null} userEmail={value?value.email:null}
                accounts = {value?value.accounts:null}/>}
                </UserContext.Consumer>

            }
        </div>
        </div>
    );
}