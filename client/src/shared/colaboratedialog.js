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
import MultipleSelect from '../shared/multiselect';

const filter = createFilterOptions();
export default function ColaborateDialog(props){
    const {colborationDilaog,listName,colaboratorDetails, userEmail} = props
    const colboratorsEmail = colaboratorDetails.length> 0 ?colaboratorDetails.map((c)=>c.email):[]
    let emails = []
    let permission = 'view'
    let accountType= 'inventories'
    const SelectEmail =() =>{
        return (
            <Autocomplete
                multiple
                options={colboratorsEmail}
                getOptionLabel={(option) => option}
                filterSelectedOptions
                filterOptions={(options, params) => {
                const filtered = filter(options, params);
                const { inputValue } = params;
                // Suggest the creation of a new value
                const isExisting = options.some((option) => inputValue === option);
                if (inputValue !== '' && !isExisting && inputValue.toLowerCase() !== userEmail &&
                /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/.test(inputValue)) {
                  filtered.push(
                    `Add Email: ${inputValue}`,
                  );
                }
                return filtered;
              }}
              onChange={async (event, newValue) => {
                if(newValue !== null){
                  emails = newValue.map((value)=>!colboratorsEmail.includes(value.toLowerCase()) ? value.replace('Add Email:' ,''):value.toLowerCase())
                }       
                }}
              selectOnFocus
              clearOnBlur
              handleHomeEndKeys
              id="free-solo-with-text-demo"
              renderOption={(props, option) => <li {...props}>{option}</li>}
              sx={{ width: 320 }}
              renderInput={(params) => (
                <TextField {...params} label="Select/Add Email"  style={{paddingTop:5, marginTop:5}}
                >{emails}</TextField>
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