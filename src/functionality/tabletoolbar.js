import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import { useState, useEffect } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
const filter = createFilterOptions();

export default function TableToolbar(props){
    const {listName,listNames,items} = props
    const [title,setTitle] = useState(listName)
    const [listItems,setListItems] = useState(items)
    const [disable,isDisable] = useState(false)

    useEffect(()=>{
        setTitle(listName)
        setListItems(items)
    },[listName,items])

    return(
        <Toolbar> 
        <Autocomplete
        value={title}
        getOptionDisabled={(option) => listNames.includes(option) && disable}
        onChange={async (event, newValue) => {
        if(newValue !== null){
          if (typeof newValue === 'string') {
            if(listNames.includes(newValue)){
                await props.getShoppingListByName(newValue)
            } else{
                setTitle(newValue.replace('Add Title:',''));
                props.setShoppingListTitle(newValue.replace('Add Title:',''))
            }
          } else if (newValue) {
            // Create a new value from the user input
            setTitle(newValue.replace('Add Title:',''));
            props.setShoppingListTitle(newValue.replace('Add Title:',''))
          } else {
            setTitle(newValue.replace('Add Title:',''));
            props.setShoppingListTitle(newValue.replace('Add Title:',''))
          }
        }
        }}
        filterOptions={(options, params) => {
          const filtered = filter(options, params);
          const { inputValue } = params;
          // Suggest the creation of a new value
          const isExisting = options.some((option) => inputValue === option);
          if (inputValue !== '' && !isExisting) {
            filtered.push(
              `Add Title: ${inputValue}`,
            );
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
          if (option) {
            return option;
          }
          // Regular option
          return title;
        }}
        renderOption={ (props, option) => 
            <ListItem {...props} key={option} component="div" 
                secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <DeleteIcon />
                    </IconButton>
                }
                disablePadding>
                    <ListItemButton>
                      <ListItemText primary={option} />
                    </ListItemButton>
                  </ListItem>
            }
        freeSolo
        fullWidth
        renderInput={(params) => (
          <TextField  {...params} label="Type to Add Title / Choose Existing List" onClick={(e)=>{
            if(listName ==='' && listItems.length > 0){
                isDisable(true)
            }else{
                isDisable(false)
            }}}/>
        )}
      />
        </Toolbar>
    )
}