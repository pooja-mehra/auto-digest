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
import adminsettings from '../shared/images/adminsettings.png';
import listpermission from '../shared/images/listpermission.png';
import accounttable from '../shared/images/accounttable.png';
import used from '../shared/images/used.png';
import setpermissions from '../shared/images/setpermissions.png';
import PaperComponent from '../shared/draggablecomponent';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import MenuIcon from '@mui/icons-material/Menu';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { width } from '@mui/system';

const Transition = forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
  });
  
export default function Demo(props) {
  const links =[{texts:['SIGNIN with Google account','See next slides to see ways to Add Items to Inventory',
    'Click on Add Icon on Left','Upload Image of Receipt from Device','Take a Picture of Receipt','Scan Barcode of Items',
    'Save the Inventory on Select Date'],
    labels:['SIGNIN','ADD TO INVENTORY',<AddIcon/>,'DEVICE UPLOAD', 'CAPTURE RECEIPT', 'SCAN BARCODE', 'SAVE INVENTORY'],
    pointers:['signin','addtoinventory','addicon', 'deviceupload', 'capturereceipt','scanbarcode','saveinventory'],
    images:{1:addinventory,2:additem,6:selectdate},linkName:'addtoinventory'},
    {linkName:'insights', texts:['Select Insights tab to analyze quantity or purcahse date of Inventory','Select Item/s Or/And Purcahse Date'], pointers:['insights','insightfilters'],
    labels:['INSIGHTS','Select Items/Select Purcahse Date'], images:{1:insights}},
    {linkName:'shopping', texts:['Select Shopping Tab for Shopping Lists','Create or Select a Shopping List, Add Items and Save',
    'Select Shopping List and Click Share Icon to Share Your Shopping List','Save Shopping List Items in Inventory after Purchase','Table of Inventories among Shared Accounts',
    'Click Arrowdown Icon to See Details of Purchased Items and Edit Used Quantity'],
    labels:['SHOPPING','SAVE SHOPPING LIST',<ShareIcon/>,'SAVE INVENTORY','',<KeyboardArrowDownIcon/>],
    pointers:['shopping','savelist','listtitle','saveinventory','inventorytable','inventorytable'],
    images:{1:createshoppinglist,2:listpermission,3:selectdate,4:accounttable,5:used}},
    {texts:['Select Menu Icon on Top Left corner','Select Set Permissions'],labels:[<MenuIcon/>,<AdminPanelSettingsIcon/>], pointers:['menu','adminsettings'], 
    images:{0:setpermissions,1:adminsettings}, linkName:'menu'}
  ]
  
  const [open, setOpen] = useState(false);
  const [frame,setFrame] = useState(0)
  const [link,setLink] = useState(0)
  const [text,setText] =useState(0)
  const [label,setLabel] = useState(0)
  const [position,setPosition] = useState({x:0,y:-78})

  const handleClickOpen = () => {
    setOpen(true);
  };

  useEffect(()=>{
    if(link <=links.length -1){
      if(frame <= links[link].texts.length-1){
        changeTab(frame,link)
      } else{
        setLink(link + 1)
        setFrame(0)
      }
    } else{
      setFrame(0)
      setLink(0)
    }
  },[frame,open,link])

  const changeTab = async (frame,link) =>{
    if(frame === 0 || frame === links[link].texts.length-1){
      document.getElementById('closedrawer') && await document.getElementById('closedrawer').click()
      await document.getElementById(links[link].linkName).parentElement.click()
    }
    setLabel(links[link].labels[frame])
    setText(links[link].texts[frame])
    let element = document.getElementById(links[link].pointers[frame])
    element && props.setDemo({x:element.getBoundingClientRect().x,y:element.getBoundingClientRect().y},open)
  }
  const handleClose = () => {
    setOpen(false);
    props.setDemo(null,false)
  };

  const cursorAnime = useSpring({
    from: { opacity:0.5 },
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
      { opacity:0.8},
      { opacity:0.9},
      {  opacity:1, scale:1},
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
        x:position.x,
        y:position.y,
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
      if(frame < links[link].texts.length-1){
        setFrame(frame+1)
      } else{
        links.length > link+1 && document.getElementById(links[link+1].linkName).parentElement.click()
        setLink(link + 1)
        setFrame(0)
      }
  }

  const back = () =>{
    if(frame > 0){
      setFrame(frame-1)
    } else{
      if(link > 0){
        setLink(link-1)
        setFrame(links[link-1].texts.length-1)
      } else{
        setLink(links.length-1)
        setFrame(links[links.length -1].texts.length-1)
      }
    }
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
        sx={{ position: 'absolute', top: '40%'}}
        open={open}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        hideBackdrop
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle style={{ cursor: 'move', height:'20%',}} id="draggable-dialog-title"> 
        <animated.div style={{padding:'0px',...textAnime}}>
            <h2 style={{textAlign:'center'}}>{text}</h2>
            {
              label && label !== '' &&
              <Box label={label}/>
            }
        </animated.div>
        </DialogTitle>
        <DialogContent style={{marginTop:'-100px', height:'80%'}}>
          <Circle cursorAnime={cursorAnime}/>
          {
            link <= links.length -1 && links[link].images[frame] &&
            <img alt="shots" src={links[link].images[frame]} width='100%'></img>

          }
        </DialogContent>
        <DialogActions>
            <Button onClick={back}>Back</Button>
          <Button onClick={handleClose}>Close</Button>
          {link <= links.length -1 && frame <= links[link].texts.length -1 && <Button onClick={next}>Next</Button>}
        </DialogActions>
      </Dialog>
    </Fragment>
  );
  }