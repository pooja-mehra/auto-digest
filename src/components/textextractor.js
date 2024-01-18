import { createWorker } from "tesseract.js";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./textextractor.css";
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import Webcam from "react-webcam";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import GridLoader from 'react-spinners/GridLoader'
import SimpleDialog from '../functionality/simpleDialog'
import UploadIcon from '@mui/icons-material/Upload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import ItemTable from "../functionality/itemTable";
import BarcodeScanner from "../functionality/barcodescanner";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

export default function TextExtractor() {
    const [ocr, setOcr] = useState([]);
    const [imageData, setImageData] = useState(null);
    const [parsedItem,isParsedItem] = useState(false);
    const webcamRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [openScanner, setOpenScanner] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openAlert, setOpenAlert] = useState({isOpen:false,status:'none',msg:''});
    const [scannedData,setScannedData] = useState(null)

    const handleScan = async(decodedText) => {
      try{  
        await axios.get("http://localhost:8080/api/getscannedgrocerybycode",{params:{code:parseInt(decodedText)}})
        .then((res)=>{
        if(res && res.data){
          localStorage.setItem('code',decodedText)
          setScannedData(null)
          setScannedData({name:res.data.name,qty:1})
        }
        })} catch(e){
          console.log(e)
        }
    };

    useEffect(()=>{
      scannedData && setOcr([scannedData,...ocr])
    },[scannedData])

  const handleClose = () => {
    setOpen(false);
  };
    const [videoConstraints,setVideoConstraints] = useState({
      width: 500,
      height: 600,
      facingMode: "user"
    });
    const convertImageToText = async() => {
    const worker = await createWorker()
      if (!imageData) return;
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
                /*let test = [...item.split(' ')].filter((itemI,i)=>
                    excludedItems.includes(itemI.toUpperCase()) || excludedItems.includes(itemI.concat('S').toUpperCase()))*/
                //if(test.length === 0 ){
                    if(item.match(/[a-zA-Z]+'?[a-zA-Z]+/g)){
                        let itemName = item.match(/[a-zA-Z]+'?[a-zA-Z]+/g).reduce((p,c)=> p + ' ' +c)
                        items.push({name:itemName,qty:1})//lowercase to ckeck with db
                        filteredItem.push([...itemName.split(' ')].map((item)=> `^${item[0]}.*[${item}].*${item[item.length-1]}$`))
                    }
               // }
            })
            items.length > 0 ? mergeShoppingList(items,false) :isParsedItem(true)
        }
    };
  
    useEffect(() => {
      convertImageToText();
      isParsedItem(false)
    }, [imageData]);

    useEffect(() => {
      openAlert.isOpen && openAlert.isOpen === true && setTimeout(()=>{
        setOpenAlert({isOpen:false,status:'none', msg:''})
      },2000)
    }, [openAlert]);

    const mergeShoppingList = (items, isSaving) =>{
      let itemMap = new Map()
      let itemArray =[]
      items.forEach((item)=>{
        if(itemMap.has(item.name.toUpperCase())){
          let value = parseInt(itemMap.get(item.name.toUpperCase()))  + parseInt(item.qty)
          itemMap.set(item.name.toUpperCase(),parseInt(value))
        } else{
          itemMap.set(item.name.toUpperCase(),parseInt(item.qty))
        }
      })
      if(itemMap.size > 0)
        {
          for (const [key, value] of itemMap){
            itemArray.push({name:key,qty:parseInt(value)})
          }
        }
        if(isSaving){
          setOcr([...itemArray])
          return [...itemArray]
        } else{
          setOcr([...itemArray,...ocr])
          isParsedItem(true)
        }
    }

    function handleImageChange(e) {
      if(e.target.files.length > 0 ){
        const file = e.target.files[0];
      if(!file)return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUri = reader.result;
        setImageData(imageDataUri);
      };
      reader.readAsDataURL(file);
      }
      document.getElementById('file').value = null;
    }

    const LoadingSpinner = () =>{
      return (
        <div style={{ marginTop:'35vh', marginLeft:'45vw',width:'20vw', height:'20vh'}}>
        <GridLoader color="rgb(76, 71, 71)" />
        </div>
      )
    }

    const CustomWebcam = () => {
      return(
        <Dialog
        fullWidth
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" textAlign={'center'}>
        <button onClick={capture} className="capture">Capture photo</button>
        <button onClick={()=>handleClose()} className="capture">Cancel</button>
        <button onClick={()=>{setVideoConstraints({...videoConstraints,facingMode:videoConstraints.facingMode==='user'?'environment':'user'})}} className="capture">Switch Camera</button>
        </DialogTitle>
        <DialogContent >
          <div className="container" style={{textAlign:'center'}}>
            <Webcam ref={webcamRef}  screenshotFormat="image/png" videoConstraints = {videoConstraints}/>      
        </div>
        </DialogContent>
       
      </Dialog>
      )
      
    };

    function dataURLtoFile(dataurl, filename) {
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
          bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while(n--){
          u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, {type:mime});
  }

    const header=[{id:'addicon',label:<AddIcon/>,maxWidth: 50,type:'icon'},
    {id:'name',label:'Name',minWidth: 170, type:"string"},
    {id:'qty',label:'Quantity',maxWidth: 50, type:"number"}]

  const addItem = (row,page,rowsPerPage) =>{
    setOcr([{name:row.name,qty:parseInt(row.qty)},...ocr])
  }

  const deleteItem = (i,page,rowsPerPage) =>{
    setOcr([...ocr.filter((item,index)=> index !== (i+(page*rowsPerPage)))])
  };

  const formatItem =(label,text,page,rowsPerPage,i)=>{
    setOcr(ocr.map((item,index)=> {
      if(index === (i+(page*rowsPerPage))){
        return ({...item,[label]:text.toUpperCase()})
      } else{
        return item
      }
    }))
  }

    const setDialog = async (isOpen, isCancel, purchaseDate) =>{
      setOpenDialog(isOpen)
      setImageData(null)
      if(!isCancel){
        if(ocr.length > 0){
          let ocrQuery = mergeShoppingList(ocr,true)
          try{  
            await axios.post("http://localhost:8080/api/putusergrocery",{purchaseDate:purchaseDate,queryItems:ocrQuery}).then((res)=>{
              if(new Date(purchaseDate).getTime() <= Date.now() &&
              new Date(purchaseDate).getTime() >= Date.now()-24*6*3600*1000){
                localStorage.removeItem('daterange')
              }
            
            setOpenAlert({isOpen:true,status:'success',msg:'Items sucessfully added to Inventory'})
            })
          } catch(e){
            console.log(e)
          }
          setOcr([]) 
        } else{
          setOpenAlert({isOpen:true,status:'error', msg:'No Items to Add!'})
        }
      } 
    }

    const capture = useCallback(async() => {
      const imageSrc = webcamRef.current.getScreenshot()
      const file = dataURLtoFile(imageSrc, 'a.png');
      if(!file)return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUri = reader.result;
        setImageData(imageDataUri);
      };
      reader.readAsDataURL(file);
      handleClose()
    }, [webcamRef]);

    const setScanStatus =()=>{
      setOpenScanner(false)
    }

    return (
      <div className="main" style={{display: 'flex',height:'95vh',flexDirection:'column',overflowY:'hidden'}}>
      <BarcodeScanner handleScan={handleScan} openScanner={openScanner} setScanStatus={setScanStatus}/> 
      {
        open &&
        <CustomWebcam />
      }
      <div  style={{display: 'flex',height:'85vh',flexDirection:'column'}}>
      {     
        imageData != null && !parsedItem ?
        <LoadingSpinner  />  :
        <ItemTable shoppingList={ocr} formatItem={formatItem} deleteItem ={deleteItem} addItem={addItem} header={header} type={'presentList'}/>
        }
        </div>
        <div className="listFooter" >
            <div  className="file-upload">
              <Tooltip title='Clear All' >
              <p><ClearIcon size="large" style={{color:'white'}} onClick={()=>{
                setOcr([])
                setImageData(null)
              }}/></p>
            </Tooltip>
            </div>
              <div  className="file-upload">
                <Tooltip title='Upload from Device'>
                <p><UploadIcon style={{color:'white'}}></UploadIcon></p>
                <input
                type="file"
                id="file"
                data-testid="file-upload"
                onChange={handleImageChange}
                accept="image/*"
                hidden
              />
              </Tooltip>
            </div>
            <div className="camera">
            <Tooltip title='Take a Picture'>
              <p><PhotoCameraIcon style={{color:'white'}}></PhotoCameraIcon></p>     
              <button onClick = {()=> setOpen(!open)} >
              </button>
            </Tooltip>
            </div>
            <div className="camera">
            <Tooltip title='Scan Barcode'>
              <p><QrCodeScannerIcon style={{color:'white'}}></QrCodeScannerIcon></p>     
              <button onClick = {()=>{
                setOpenScanner(!openScanner)
              }} >
              </button>
            </Tooltip>
            </div>
            <div className="file-upload">
            <Tooltip title='Add to Inventory'>
              <p><SaveIcon style={{color:'white'}} onClick={()=>{
                setOcr(ocr.filter((item,i)=> item.name !== '' && item.qty !== '' && item.qty >0))
                setOpenDialog(true)
              }}/></p>
            </Tooltip>
            </div>
        </div>
        <SimpleDialog openDialog ={openDialog} itemList={ocr} type = {'date'} setDialog={setDialog}></SimpleDialog>
        <div style={{marginTop:'-7vh'}}>
        {
          openAlert.isOpen &&
          <Alert variant="filled" severity={openAlert.status}>{openAlert.msg}</Alert>
        }
        </div>
      </div>
    );
  }