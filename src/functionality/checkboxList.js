import {useState, useEffect} from 'react';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import CommentIcon from '@mui/icons-material/Comment';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HandleMouseOver from './handleMouseOver'

export default function CheckboxList(props) {
  const {type, contentEditable, shoppingList} = props

  return (
      
      <List sx={{ width: '100vw',bgcolor: 'background.paper',marginTop:'5vh'}}>
      { shoppingList.length > 0 &&
        shoppingList.map((value,index) => {
        const name = value.name
        const qty = value.qty
        return (
          <ListItem
            key={value}
            secondaryAction={
              <IconButton edge="start" aria-label="comments" sx={{width:20}}>
              {
                type==='pastlist' &&
                <CommentIcon />
              }
              </IconButton>
            }
            disablePadding
          >
          <ListItemButton role={undefined} dense style={{maxWidth:'15%'}}>
              <ListItemIcon>
            {
              type==='pastlist' ?<AddIcon />: <DeleteIcon onClick={props.deleteFromShoppingList(value)}/>
            }
            </ListItemIcon>
            </ListItemButton>
            <ListItemText autoFocus contentEditable= {contentEditable} suppressContentEditableWarning={true} style={{maxWidth:'40%'}}
            id={'name'+value.name+index} onMouseOver={()=>HandleMouseOver('name'+value.name+index)}/>
            <ListItemText autoFocus contentEditable= {contentEditable} 
            id={'qty'+value.name+index} style={{maxWidth:'10%',marginLeft:'15%'}} suppressContentEditableWarning={true} onMouseOver={()=>HandleMouseOver('qty'+value.name+index)}
            onKeyDown={(e)=> {if (e.key.match(/[^0-9]/) && e.key !== 'Backspace') {
              e.preventDefault();
            }}}/>
          </ListItem>
        );
      })}
    </List>    
  );
}
