import { createWorker } from "tesseract.js";
import { useState, useEffect } from "react";
export default function TextExtractor() {
    const [ocr, setOcr] = useState([]);
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
            itemArray.filter((item,i)=>{
                let test = [...item.split(' ')].filter((itemI,i)=>
                    excludedItems.includes(itemI.toUpperCase()) || excludedItems.includes(itemI.concat('S').toUpperCase()))
                if(test.length === 0 ){
                    if(item.match(/[a-zA-Z]+'?[a-zA-Z]+/g)){
                        filteredItem.push(item.match(/[a-zA-Z]+'?[a-zA-Z]+/g).reduce((p,c)=> p + ' ' +c))
                    }
                }
            })
            setOcr(filteredItem)
        }
    };
  
    useEffect(() => {
      convertImageToText();
      setOcr([])
    }, [imageData]);
  
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
    return (
      <div className="App">
        <div>
          <p>Choose an Image</p>
          <input
            type="file"
            name=""
            id=""
            onChange={handleImageChange}
            accept="image/*"
          />
        </div>
        <div className="display-flex">
        {
            ocr && ocr.length > 0 &&
            ocr.map((value,j)=>{
                    return (
                        <div style={{display:'flex'}} key={j}>
                            <p style={{margin:'auto'}}>{value}</p>
                        </div>
                    )})
        }
        </div>
      </div>
    );
  }