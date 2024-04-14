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
import GridLoader from 'react-spinners/GridLoader'
import SimpleDialog from '../functionality/simpleDialog'
import UploadIcon from '@mui/icons-material/Upload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import ItemTable from "../functionality/itemTable";
import BarcodeScanner from "../functionality/barcodescanner";
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import Fuse from "fuse.js";
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import {isMobile} from 'react-device-detect';
import PaperComponent from '../shared/draggablecomponent';
import { DialogTitle } from "@mui/material";
import ClearAllDialog from "../shared/cleardialog";

const base_url = process.env.REACT_APP_BASE_URL

export default function TextExtractor(prop) {
    const [ocr, setOcr] = useState([]);
    const [imageData, setImageData] = useState(null);
    const [parsedItem,isParsedItem] = useState(false);
    const webcamRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [openScanner, setOpenScanner] = useState(false);
    const [openDialog, setOpenDialog] = useState({isOpen:false,dialogType:''});
    const [openAlert, setOpenAlert] = useState({isOpen:false,status:'none',msg:''});
    const [scannedData,setScannedData] = useState(null)
    const fileInputRef=useRef();

    const handleScan = async(decodedText) => {
      try{  
        await axios.get(`${base_url}api/getscannedgrocerybycode`,{params:{code:parseInt(decodedText)}})
        .then((res)=>{
          window.sessionStorage.setItem('code',decodedText);
        if(res && res.status === 200 && res.data){
          setScannedData({name:res.data.name,qty:1})
        } else{
          setOpenAlert({isOpen:true,status:'warning', msg:'Item Not Found! Enter Item Name'})
        }
        })} catch(e){
          setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
        }
    };

    useEffect(()=>{
      scannedData && setOcr([scannedData,...ocr])
    },[scannedData])

  const handleClose = () => {
    setOpen(false);
  };

  const switchStore = (textArray)=>{
    let items = []
    for(let i =0; i<textArray.length; i++){
      let rows = textArray[i].split(' ')
      const fuse = new Fuse(rows)
      for(let j =0; j<rows.length; j++){
        if(!(rows[j].indexOf(".") === -1) && fuse.search('coupon').length === 0 && fuse.search('@').length === 0){
          if(textArray[i].match(/[a-zA-Z]+'?[a-zA-Z]+/g)){
            let itemName = textArray[i].match(/[a-zA-Z]+'?[a-zA-Z]+/g).reduce((p,c)=> p + ' ' +c)
            items.push({name:itemName,qty:1})
          }
          break
        }
        if(fuse.search('subtotal').length > 0){
          return items
        }
      }
    }
    return items
}
    const [videoConstraints,setVideoConstraints] = useState({
      width: 500,
      height: 600,
      facingMode: isMobile?"environment":"user"
    });
    const convertImageToText = async() => {
    const worker = await createWorker()
      if (!imageData) return;
      const {
        data: { text },
      } = await worker.recognize(imageData);
        if(text && text.length > 0){
            let itemArray = text.split('\n')
            let items = []
            /*const fuse = new Fuse([...itemArray[0].split(' ')])
            const storeNames = ['target','costco','walmart','walgreens']
            let storeName = storeNames.filter((s,i)=> fuse.search(s).length>0)*/
            items = switchStore(itemArray);
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
      },4000)
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
        PaperComponent={PaperComponent}
        style={{textAlign:'center'}}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">Capture Reciept</DialogTitle>
        <DialogContent>
          <div className="container" >
            <Webcam ref={webcamRef}  screenshotFormat="image/png" videoConstraints = {videoConstraints}/>   
          </div>
        </DialogContent>
        <div style={{margin:'1vh'}} className="capture">
        <Button onClick={capture}  size="small" variant="contained" >Capture</Button>
        </div>
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

    const header=[{id:'addicon',label:<Fab size="small" aria-label="add"><AddIcon /></Fab>,maxWidth: 50,type:'icon'},
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
      setOpenDialog({isOpen:isOpen,dialogType:'simple'})
      setImageData(null)
      if(!isCancel){
        if(ocr.length > 0 && (prop.userId !== '' || prop.userId !== null)){
          let ocrQuery = mergeShoppingList(ocr,true)
          try{  
            await axios.post(`${base_url}api/putusergrocery`,{purchaseDate:purchaseDate,queryItems:ocrQuery},
            {headers: {
              Authorization: `Bearer ${prop.userId}`,
              Accept: 'application/json'}
            }).then((res)=>{
              if(res && res.data && res.data.success === true){
                window.sessionStorage.removeItem('details')
                setOpenAlert({isOpen:true,status:'success',msg:'Items sucessfully added to Inventory'})
              }
            })
          } catch(e){
            setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
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

    const clearAll = (isClear) =>{
      if(isClear){
        setOcr([])
        setImageData(null)
      }
      setOpenDialog({isOpen:false,type:'clear'})
    }
    
    return (
      <div className="main" style={{display: 'flex',height:'80vh',flexDirection:'column',overflowY:'auto',marginTop:'2vh'}}>
      <BarcodeScanner handleScan={handleScan} openScanner={openScanner} setScanStatus={setScanStatus}/> 
\      {
        open &&
        <CustomWebcam />
      }
      <div  style={{display: 'flex',height:'80vh',flexDirection:'column'}}>
      {     
        imageData != null && !parsedItem ?
        <LoadingSpinner  />  :
        <ItemTable shoppingList={ocr} formatItem={formatItem} deleteItem ={deleteItem} addItem={addItem} header={header} type={'presentList'}/>
        
      }
      <div style={{ width:'95vw',marginLeft:'auto',marginRight:'auto'}}>
          {
            openAlert.isOpen &&
            <Alert severity={openAlert.status}>{openAlert.msg}</Alert>
          }
      </div>
      <div className="listFooter" >
        <div  className="file-upload">
            <Tooltip title='Clear List' enterTouchDelay={0}>
            <Button size="small" variant="contained" onClick={()=>{
              setOpenDialog({isOpen:true,dialogType:'clear'})
            }}>
            {!isMobile && 
              <ClearIcon size="small"/>}
            Clear List</Button>
            </Tooltip>
          </div>
          <div  className="file-upload">
            <Tooltip title='Upload Image of Reciept from Device' enterTouchDelay={0}>
            <Button size="small" variant="contained"
            onClick={()=>fileInputRef.current.click()}>
            {!isMobile &&  
              <UploadIcon size="small">
              </UploadIcon>
            }
            Device Upload
            </Button>
            <input
            type="file"
            id="file"
            data-testid="file-upload"
            onChange={handleImageChange}
            ref={fileInputRef}
            accept="image/*"
            hidden
            />
            </Tooltip>
          </div>
          <div className="camera">
            <Tooltip title='Take a Picture of Reciept' enterTouchDelay={0}>
              <Button size="small" variant="contained" onClick = {()=> setOpen(!open)}> 
              {!isMobile && 
                <PhotoCameraIcon size="small"></PhotoCameraIcon> 
              }   
              Capture Reciept</Button>
            </Tooltip>
          </div>
          <div className="camera">
            <Tooltip title='Scan Barcode' enterTouchDelay={0}>
              <Button size="small" variant="contained"  onClick = {()=> setOpenScanner(!openScanner)}>
              {
                !isMobile &&
                <QrCodeScannerIcon size="small"></QrCodeScannerIcon>
              }
             Scan Barcode</Button>  
            </Tooltip>
          </div>
          <div className="file-upload">
            <Tooltip title='Add to Inventory' enterTouchDelay={0}>
              <Button size="small"  variant="contained"  onClick={()=>{
                setOcr(ocr.filter((item,i)=> item.name !== '' && item.qty !== '' && item.qty >0))
                prop.userId === '' || prop.userId === null ? setOpenAlert({isOpen:true, status:'error',msg:'Please SIGNIN to proceed'}) : setOpenDialog({isOpen:true,dialogType:'simple'})
              }}>

              {
                !isMobile &&
                <SaveIcon size="small"/>
                
              }
              Save Inventory</Button>
            </Tooltip>
          </div>
        </div>
        </div>
        {
          openDialog.dialogType === 'simple'?
          <SimpleDialog openDialog ={openDialog.isOpen} itemList={ocr} type = {'date'} setDialog={setDialog}></SimpleDialog>
          : openDialog.dialogType === 'clear' &&
          <ClearAllDialog openClearAllDialog = {openDialog.isOpen} clearAll = {clearAll}></ClearAllDialog>
        }
      </div>
    );
  }