import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ShareIcon from '@mui/icons-material/Share';
import ColaborateDialog from '../shared/colaboratedialog';
import Chip from '@mui/material/Chip';
import axios from 'axios';
import { UserContext } from "../App"
import Alert from '@mui/material/Alert';
import ClearAllDialog from "../shared/cleardialog";

const base_url = process.env.REACT_APP_BASE_URL

const filter = createFilterOptions();

export default function TableToolbar(props){
    const {listName,listNames,items,userId} = props
    const [title,setTitle] = useState('')
    const [listItems,setListItems] = useState(items)
    const [disable,isDisable] = useState(false)
    const [openDialog, setOpenDialog] = useState({isOpen:false,dialogType:''});
    const [colaboratorDetails,setColaboratorDetails] = useState([])
    const [openAlert, setOpenAlert] = useState({isOpen:false,status:'',msg:''})

    useEffect(()=>{
        setTitle(listName)
        setListItems(items)
    },[listName,items])

    useEffect(()=>{
      openAlert.isOpen && openAlert.isOpen === true && setTimeout(()=>{
        setOpenAlert({isOpen:false,status:'none',msg:''})
      },2000)
    },[openAlert])

    const clearAll = (isClear) =>{
      isClear &&  props.deleteList(title)
      setOpenDialog({isOpen:false,dialogType:''})
    }

    const setColaborateDialog = (isOpen,permission,emails,listName,accountType) =>{
      if(permission && permission !== null && emails && emails.length>0){
        props.setpermissions(permission,emails,listName)
      }
      setOpenDialog({isOpen:isOpen,dialogType:''})
    }

    const getColaborators = async(listName) =>{
      try{
          await axios.get(`${base_url}api/getcolaboratorsemail`,
          { params:{listName:listName},
            headers: {
              Authorization: `Bearer ${userId}`,
              Accept: 'application/json'
          }}).then((res)=>{
              if(res && res.data){
                setColaboratorDetails(res.data)
              }
          })
      } catch(e){
        setOpenAlert({isOpen:true,status:'error',msg:'Something went wrong!'})
      }
       
  }
    return(
      <div>
      <div style={{width:'95%',margin:'auto'}}>
      {
        openAlert.isOpen &&
        <Alert severity={openAlert.status}>{openAlert.msg}</Alert>
      }
      </div>
        <div style={{display:'flex',width:'95vw', margin:'auto', marginBotom:'0px' ,paddingTop:'1vh'}} id ='listtitle'> 
        <Autocomplete
        value={title}
        getOptionDisabled={(option) => listNames.includes(option.listName) && disable}
        onChange={async (event, newValue) => {
        if(newValue !== null){
            if(listNames.includes(newValue)){
                await props.getShoppingListByName(newValue)
            } else{
                setTitle(newValue.listName.replace('Add',''));
                props.setShoppingListTitle(newValue.listName.replace('Add',''))
            }
        }}}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option.listName);
          if (inputValue !== '' && !isExisting) {
            filtered.push({
              inputValue,
              listName: `Add ${inputValue}`,
            });
          }
          return filtered;
        }}
        selectOnFocus
        clearOnBlur
        handleHomeEndKeys
        id="free-solo-with-text-demo"
        options={listNames}
        getOptionLabel={(option) => {
          // Value selected with enter, right from the input
          if (typeof option === 'string') {
            return option;
          }
          // Add "xxx" option created dynamically
          if (option.inputValue) {
            return option.inputValue.listName;
          }
          // Regular option
          return option.listName;
        }}
        renderOption={ (props, option) => 
            <ListItem {...props} key={option.listName} component="div" 
                secondaryAction={
                  <div style={{display:'flex'}}>
                  {
                    option.permission === 'Owner' &&
                    <div style={{display:'flex'}}>
                      <IconButton  aria-label="delete" onClick={()=> {
                        setTitle(option.listName)
                        setOpenDialog({isOpen:true,dialogType:'clear'})
                      }}>
                        <DeleteIcon />
                      </IconButton>
                      <IconButton style={{marginLeft:'5vw'}} aria-label="share" onClick={()=>
                        { 
                          setTitle(option.listName)
                          getColaborators(option.listName)
                          setOpenDialog({isOpen:true, dialogType:'colaborator'})
                        }}>
                        <ShareIcon />
                      </IconButton>
                    </div>
                  }
                  <IconButton style={{marginLeft:'5vw'}}>
                  <Chip label={option.permission}></Chip>
                  </IconButton>
                  </div>
                }
                disablePadding>
                    <ListItemButton>
                      <ListItemText primary={option.listName} />
                    </ListItemButton>
                  </ListItem>
            }
        freeSolo
        fullWidth
        renderInput={(params) => (
          <TextField {...params} label="Add Title to Create New List / Choose Existing List" onClick={(e)=>{
            if(listName ==='' && listItems.length > 0){
                isDisable(true)
            }else{
                isDisable(false)
            }}}
            >             
            </TextField>
        )}
      />
      {
        openDialog.dialogType === 'colaborator' ?
        <UserContext.Consumer>
        {value => <ColaborateDialog colborationDilaog={openDialog.isOpen} setColaborateDialog={setColaborateDialog}
        listName={title} colaboratorDetails={colaboratorDetails} userId={value?value.userId:null} userEmail={value?value.email:null}/>}
        </UserContext.Consumer>
        : openDialog.dialogType === 'clear' &&
        <ClearAllDialog openClearAllDialog = {openDialog.isOpen} clearAll = {clearAll} isDelete ={true}></ClearAllDialog>
      }
        </div>
        </div>
    )
}