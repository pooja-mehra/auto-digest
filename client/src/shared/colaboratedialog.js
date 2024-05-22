import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PaperComponent from './draggablecomponent';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';

const filter = createFilterOptions();
export default function ColaborateDialog(props){
    const {colborationDilaog,listName,colaboratorDetails, userEmail} = props
    const colboratorsEmail = colaboratorDetails.length> 0 ?colaboratorDetails.map((c)=>c.email + '(' + c.colaboratorDetails[0].permission + ')'):[]
    const colborators = colaboratorDetails.length> 0 ?colaboratorDetails.map((c)=> {
      return({email:c.email, permission: c.colaboratorDetails[0].permission})}):[]
    let emails = []
    let permission = 'view'
    let accountType= 'inventories'
    const SelectEmail =() =>{
        return (
            <Autocomplete
                multiple
                options={colboratorsEmail}
                getOptionLabel={(option) => option }
                filterSelectedOptions
                filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                const isExisting = colboratorsEmail.some((option) => inputValue.trim().toLowerCase() === option.split('(')[0]);
                if (inputValue !== '' && !isExisting && inputValue.trim().toLowerCase() !== userEmail 
                && /^([a-z0-9._%-]+@[a-z0-9.-]+\.[a-z]{2,6})*$/.test(inputValue.trim().toLowerCase())
                ){
                  filtered.push(
                    inputValue.trim().toLowerCase(),
                  );
                }
                return filtered;
              }}
              onChange={async (event, newValue) => {
                if(newValue !== null){
                  emails = newValue.map((value)=>! (colboratorsEmail.includes(value.toLowerCase()) && colboratorsEmail.map((c)=>c.split('(')[0].includes(value.toLowerCase()))) 
                  ? value
                  : value.split('(')[0].toLowerCase())
                }       
                }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="free-solo-with-text-demo"
              renderOption={(props, option) => <li {...props}>{option}</li>}
              sx={{ width: 320 }}
              renderInput={(params) => (
                <TextField {...params} label="Select/Add Email"  style={{paddingTop:5, marginTop:5}}></TextField>
              )}
            />
          );
    }
    const PermissionForm =() =>{
        return (
            <FormControl sx={{ minWidth: 320 }} style={{paddingTop:5}}>
              <InputLabel id="demo-select-small-label" >permission</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                label="Age"
                defaultValue={'view'}
                onChange={(event)=>permission = event.target.value}
              >
                <MenuItem value={'view'}>
                  <em>Viewer</em>
                </MenuItem>
                <MenuItem value={'edit'}>Editor</MenuItem>
              </Select>
            </FormControl>
          );
    }

    const setAccountType = (accounts) =>{
      accountType = accounts.length > 0 ? accounts.length === 1 ? accounts[0] : 'Accounts':null
    }

    return(
      <Dialog
      open={colborationDilaog}
      onClose={()=>props.setColaborateDialog(false)}
      PaperComponent={PaperComponent}
      aria-labelledby="draggable-dialog-title">
      <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {listName === null ? 'Set Permissions for Inventories '//<MultipleSelect setAccountType={setAccountType}/>
        :'Set Permissions for '+listName}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
            <SelectEmail/>
            <br/>
            <PermissionForm/>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={()=>props.setColaborateDialog(false,null,null)}>
          Cancel
        </Button>
        <Button onClick={()=>props.setColaborateDialog(false,permission,emails,listName,accountType)}>Go Ahead</Button>
      </DialogActions>
    </Dialog>
    );
  }