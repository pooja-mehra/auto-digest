import React, { useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DetailsIcon from '@mui/icons-material/Details';
import TextExtractor from "./textextractor";
import Details from "./details";
export default function HeaderTabs() {
    const [tabNumber, setTabNumber] = useState(0);
    const handleChange = (event, newValue) => {
        setTabNumber(newValue);
    };
    return (
        <div>
        <Tabs value={tabNumber} onChange={handleChange} aria-label="icon tabs example">
            <Tab icon={<UploadFileIcon />} aria-label="upload" label="upload">
            </Tab>
            <Tab icon={<DetailsIcon />} aria-label="detail" label="details"/>
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
        </div>
        </div>
    );
}