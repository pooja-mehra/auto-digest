import { createWorker } from "tesseract.js";
import { useState, useEffect } from "react";
import axios from "axios";
import "./textextractor.css";
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import Fab from '@mui/material/Fab';

export default function TextExtractor() {
    const [ocr, setOcr] = useState(new Map());
    const [imageData, setImageData] = useState(null);
    const [parsedItem,isParsedItem] = useState(false)
    const convertImageToText = async() => {
    const worker = await createWorker()
      if (!imageData) return;
      //await worker.load();
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      const {
        data: { text },
      } = await worker.recognize(imageData);
        const excludedItems =['TOTALS','SUBTOTALS','SAVINGS','COUPONS', 'TAX', 'CARDS',
            'PAYS', 'PAYMENTS','CHECKOUTS', 'ACCOUNTS']
        if(text && text.length > 0){
            let itemArray = text.split('\n')
            let filteredItem =[]
            let items = []
            itemArray.forEach((item,i)=>{
                let test = [...item.split(' ')].filter((itemI,i)=>
                    excludedItems.includes(itemI.toUpperCase()) || excludedItems.includes(itemI.concat('S').toUpperCase()))
                if(test.length === 0 ){
                    if(item.match(/[a-zA-Z]+'?[a-zA-Z]+/g)){
                        let itemName = item.match(/[a-zA-Z]+'?[a-zA-Z]+/g).reduce((p,c)=> p + ' ' +c)
                        items.push(itemName.toLowerCase())
                        filteredItem.push([...itemName.split(' ')].map((item)=> `^${item[0]}.*[${item}].*${item[item.length-1]}$`))
                    }
                }
            })
            getListItems(items,filteredItem)
            //guessListItems(filteredItem)
        }
    };
  
    useEffect(() => {
      convertImageToText();
      setOcr(new Map())
      isParsedItem(false)
    }, [imageData]);

    const getListItems = async (items,filteredItem) =>{
      let itemMap = new Map()
      const urls = [
        "http://localhost:8080/api/getgrocery",
        //"http://localhost:8080/api/guessgrocery"
      ];
      
      await Promise.all(
        urls.map(url => axios.get(url,{params:{items:url===urls[0]?items:filteredItem}}).then(
          res => {
          if (res && res.data && res.data.finalResult && res.data.finalResult.length > 0){
            return res.data.finalResult
          } 
        }).then((result)=>{
        if(result && result.length > 0){
          result.forEach((item)=>{
            if(itemMap.has(item.name)){
              let value = itemMap.get(item.name) +1
              itemMap.set(item.name,value)
            } else{
              itemMap.set(item.name,1)
            }
          })
        }
       
      }) 
        ))
        setOcr(itemMap)
        isParsedItem(true)
    }
    const guessListItems = async (items) => {
      try{
        await axios
        .get('http://localhost:8080/api/guessgrocery', {params:{items:items}})
        .then((res) => {
            if (res && res.data && res.data.finalResult && res.data.finalResult.length > 0){
              return res.data.finalResult
            } 
        }).then((result)=>{
          let itemMap = new Map()
          if(result && result.length > 0){
            result.forEach((item)=>{
              if(itemMap.has(item.name)){
                let value = itemMap.get(item.name) +1
                itemMap.set(item.name,value)
              } else{
                itemMap.set(item.name,1)
              }
            })
          }
          setOcr(itemMap)
          isParsedItem(true)
        })
      }catch(err){
        console.log(err)}
      }

    function handleImageChange(e) {
      const file = e.target.files[0];
      if(!file)return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUri = reader.result;
        setImageData(imageDataUri);
      };
      reader.readAsDataURL(file);
    }
    const ListHeader = (props) =>{
      return (
        <div style={{display:'flex', margin:'5vw'}}>
        <p style={{margin:'auto', flex:'2 1', textAlign:'left'}}>Items</p>
        <p style={{margin:'auto', flex:'1 1', textAlign:'left'}}>Qty</p>
        </div>
      )
    }

    const LoadingSpinner = () =>{
      return (
        <Box sx={{ display: 'flex' , margin:'45%'}}>
          <CircularProgress />
        </Box>
      )
    }

    const ItemsTooltip = () =>{
      return (
        <Tooltip title="Delete">
          Click to edit!
        </Tooltip>
      );
    }
    return (
      <div className="App">
        <div className="parent">
            <div className="file-upload">
            <p>Choose an Image of Receipt or list Items </p>
                <input
                type="file"
                id="file"
                data-testid="file-upload"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
        </div>
        <div className="display-flex" data-testid="items">
        {
          parsedItem && 
          <div>
            <ListHeader/> 
            <Fab position={'bottom'} style={{marginLeft:'45%'}} color="primary" aria-label="add">
              <AddIcon />
            </Fab>          
          </div>
           
        }
        {

            ocr && ocr.size > 0 &&
            Array.from(ocr.keys()).map((item,i)=>{
              return (
                <div  style={{display:'flex'}} key={i}>
                <Tooltip title="Click to edit!" placement="top-start">
                  <p contentEditable suppressContentEditableWarning={true} style={{margin:'5vw', flex:'2 1', textAlign:'left'}}>{item}
                  </p>
                </Tooltip>
                <Tooltip title="Click to edit!" placement="top-start">
                  <p contentEditable suppressContentEditableWarning={true} style={{margin:'5vw', flex:'1 1', textAlign:'left'}}>{ocr.get(item)}</p>
                  </Tooltip>
                </div>
              )
            })
        }
        {
          document.getElementById('file') && document.getElementById('file').attributes.type.ownerElement.value &&
          ocr.size === 0 && !parsedItem &&
            <LoadingSpinner />
        }
        </div>
      </div>
    );
  }