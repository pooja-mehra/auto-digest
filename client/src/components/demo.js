import { animated,useTransition, useSpring } from '@react-spring/web'
import {useState, Fragment, forwardRef, useEffect} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';
import PreviewIcon from '@mui/icons-material/Preview';
import additem from '../shared/images/additem.png';
import addinventory from '../shared/images/addinventory.png';
import selectdate from '../shared/images/selectdate.png';
import insights from '../shared/images/insights.png';
import createshoppinglist from '../shared/images/createshoppinglist.png';
import sharelist from '../shared/images/sharelist.png';
import listpermission from '../shared/images/listpermission.png';
import accounttable from '../shared/images/accounttable.png';
import used from '../shared/images/used.png';
import shareinventories from '../shared/images/shareinventories.png';

import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
  });
  
export default function Demo(props) {
  const texts = ['SIGNIN with Google account','See next slides to see different ways to Add Items to Inventory',
  'Click on Add Icon on Left','Upload Image of Receipt from Device','Take a Picture of Receipt','Scan Barcode of Items',
  'Save the Inventory on Select Date', 'Select Insights tab to analyze quantity or purcahse date of Inventory',
  'Select Shopping Tab for Shopping Lists and Inventory table','Create or Select a Shopping, add Items and Save',
  'Select Shopping List and Click Share Icon to Share Your Shopping List','Save list as Inventory after Purchase','Table of Inventories among Shared Accounts',
  'Click Arrowdown Icon to See Details of Purchased Items and Edit Used Quantity','Select Set Permissions from Menu Icon on Top Left corner to Share Inventory']

  const labels = ['SIGNIN','ADD TO INVENTORY',<AddIcon/>,'DEVICE UPLOAD', 'CAPTURE RECEIPT', 'SCAN BARCODE', 'SAVE INVENTORY','INSIGHTS',
  'SHOPPING','SAVE SHOPPING LIST',<ShareIcon/>,'SAVE INVENTORY','',<KeyboardArrowDownIcon/>,<AdminPanelSettingsIcon/>]

  const images = {1:addinventory,2:additem,6:selectdate,7:insights,9:createshoppinglist,10:listpermission,11:selectdate,12:accounttable,13:used,14:shareinventories}

  const [open, setOpen] = useState(false);
  const [frame,setFrame] = useState(props.frame)
  const [text,setText] =useState(texts[frame])
  const [label,setLabel] = useState(labels[frame])
  const handleClickOpen = () => {
    setOpen(true);
  };

  useEffect(()=>{
    if(frame <= texts.length-1){
      setLabel(labels[frame])
      setText(texts[frame])
    } else{
      setFrame(0)
    }
  },[frame])

  const handleClose = () => {
    setOpen(false);
  };

  const cursorAnime = useSpring({
    from: { opacity:0.5, y: -78, x:0},
    to: [
      
      { opacity:0},
      {opacity:0.5},
      { opacity:0},
      {opacity:0.5},
    ],
    loop: false,
  })

  const button = useSpring({
    from: { opacity:0.7 ,scale:0.5},
    to: [
      { opacity:0.8 },
      {opacity:0.9 },
      {  opacity:1, scale:1 },
      { opacity:0},
    ],
    loop: true,
  })

  const Circle = (props) =>{
    return(
      <animated.div style={{
        width: 50,
        height: 50,
        background: 'pink',
        borderRadius: 50,
        margin:'auto',
        marginTop:'20px',
        ...props.cursorAnime
        }}>
    </animated.div>
    )
  }

  const Box =(props) =>{
    return(
      <animated.div style={{
        width: 'auto',
        height: 'auto',
        background: '#673ab7',
        borderRadius: 20,
        color:'white',
        margin:'auto',
        display:'flex',justifyContent:'center',alignItems:'center'
        }}><h3>{props.label}</h3>
    </animated.div>
    )
  }

  const textAnime = useSpring({
    from: { opacity:1, scale:0.5,color:'#482880'},
    to: [
      {  opacity:0.6, color:'green'},
      {  opacity:1, scale:0.7, color:'#482880'},
      {  opacity:0.8, color:'green'},
      {  opacity:1, scale:0.7, color:'#482880'},
      {  opacity:1, color:'#482880'}
    ],
    delay: 1000,
  })

  const next = () =>{
    setFrame(frame+1)
  }

  const back = () =>{
    setFrame(frame-1)
  }

  return (
    <Fragment>
    <Chip
        avatar={<PreviewIcon size="small" style={{color:"#5393ff"}}></PreviewIcon>}
        label='DEMO'
        variant="outlined"
        style={{color:'white' }}
        id='demo'
        onClick={() => handleClickOpen()}
    />
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleClose}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle> 
        <animated.div style={{padding:'0px',...textAnime}}>
            <h2 style={{textAlign:'center'}}>{text}</h2>
            </animated.div>
        </DialogTitle>
        <DialogContent>
        {
          label && label !== '' &&
          <Box label={label}/>
        }
          <Circle cursorAnime={cursorAnime}/>
          {
            images[frame] &&
            <img alt="shots" src={images[frame]} width='100%'></img>

          }
        </DialogContent>
        <DialogActions>
          {frame > 0 && <Button onClick={back}>Back</Button>}
          <Button onClick={handleClose}>Close</Button>
          {frame < texts.length &&<Button onClick={next}>Next</Button>}
        </DialogActions>
      </Dialog>
    </Fragment>
  );
  }