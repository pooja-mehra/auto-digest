
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';

export default function ListHeader (props){
    return (
      <div style={{display:'flex',flex:'2 1 '}}>
      <Tooltip title='Add new Item'>
      <AddIcon style={{margin:'auto',marginRight:'2vw',marginLeft:'2vw'}} 
      onClick={()=> props.addItem()}/>
      </Tooltip>
      <p style={{margin:'auto',marginRight:'20vw',marginLeft:'20vw'}}>ITEMS</p>
      <p style={{margin:'auto'}}>QTY</p>
      </div>
      
    )
  }