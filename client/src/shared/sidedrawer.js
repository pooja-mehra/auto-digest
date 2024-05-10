import {useState} from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuSharpIcon from '@mui/icons-material/MenuSharp';
import ExitToAppSharpIcon from '@mui/icons-material/ExitToAppSharp';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export default function SideDrawer(props) {
  const [state, setState] = useState(false)
  const listItems = [{title:'Set Pemissions',icon:<AdminPanelSettingsIcon/>,action:props.showColaborationDialog},
      {title:'SIGNOUT',icon:<ExitToAppSharpIcon/>,action:props.signout}]

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState(open);
  };

  const list = (anchor) => (
    <Box
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {listItems.map((item, index) => (
          <ListItem key={item.title} disablePadding>
            <ListItemButton onClick={item.action}>
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
          <Button style={{color:'white'}} onClick={toggleDrawer(true)}><MenuSharpIcon id='menu'/></Button>
          <Drawer
            anchor={'left'}
            open={state}
            onClose={toggleDrawer(false)}
          >
            {list('left')}
            <Button onClick={toggleDrawer(false)} id="closedrawer">Close</Button>
          </Drawer>
    </div>
  );
}