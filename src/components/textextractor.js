import { createWorker } from "tesseract.js";
import { useState, useEffect } from "react";
import axios from "axios";
import "./textextractor.css";
export default function TextExtractor() {
    const [ocr, setOcr] = useState(new Map());
    const [imageData, setImageData] = useState(null);
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
            itemArray.forEach((item,i)=>{
                let test = [...item.split(' ')].filter((itemI,i)=>
                    excludedItems.includes(itemI.toUpperCase()) || excludedItems.includes(itemI.concat('S').toUpperCase()))
                if(test.length === 0 ){
                    if(item.match(/[a-zA-Z]+'?[a-zA-Z]+/g)){
                        let itemName = item.match(/[a-zA-Z]+'?[a-zA-Z]+/g).reduce((p,c)=> p + ' ' +c)
                        filteredItem.push([...itemName.split(' ')].map((item)=> `^${item[0]}.*[${item}].*${item[item.length-1]}$`))
                         /*let subStringArray = itemName.split(" ")
                        subStringArray.forEach(name => {
                          getListItems(name,i)
                        });*/
                    }
                }
            })
            //setOcr(filteredItem)
            getListItems(filteredItem)
        }
    };
  
    useEffect(() => {
      convertImageToText();
      //setOcr([])
    }, [imageData]);

    const getListItems = async (items) => {
        await axios
            .get('http://localhost:8080/api/commongroceryguess', {params:{items:items}})
            .then((res) => {
              console.log(res)
                if (res && res.data && res.data.finalResult && res.data.finalResult.length > 0){
                    return res.data.finalResult
                }
            }).then((result)=>{
              let itemMap = new Map()
              result.forEach((item)=>{
                if(itemMap.has(item)){
                  let value = itemMap.get(item) +1
                  itemMap.set(item,value)
                } else{
                  itemMap.set(item,1)
                }
              })
              console.log(itemMap)
              setOcr(itemMap)
            })
            .catch((err) => console.log(err));
      };

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
    const ListHeader = () =>{
      return (
        <div style={{display:'flex', margin:'5vw'}}>
        <p style={{margin:'auto', flex:'2 1', textAlign:'center'}}>Item</p>
        <p style={{margin:'auto', flex:'1 1', textAlign:'center'}}>Qty</p>
        </div>
      )
    }
    return (
      <div className="App">
        <div className="parent">
            <div className="file-upload">
            <p>Choose an Image of Receipt or list Items </p>
                <input
                type="file"
                name=""
                data-testid="file-upload"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
        </div>
        <div className="display-flex" data-testid="items">
        {
          ocr && ocr.size > 0 &&
          <ListHeader/>
        }
        {
            ocr && ocr.size > 0 &&
            Array.from(ocr.keys()).map((item,i)=>{
              return (
                <div style={{display:'flex'}} key={i}>
                  <p style={{margin:'auto', flex:'2 1', textAlign:'center'}}>{item}</p>
                  <p style={{margin:'auto', flex:'1 1', textAlign:'center'}}>{ocr.get(item)}</p>
                </div>
              )
            })
        }
        </div>
      </div>
    );
  }