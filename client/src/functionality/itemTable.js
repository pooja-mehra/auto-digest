import {useState, Fragment} from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HandleMouseOver from './handleMouseOver';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Fab from '@mui/material/Fab';
import SaveIcon from '@mui/icons-material/Save';

export default function ItemTable(props) {
  const {shoppingList,type,details,consumed,permission} = props
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [open, setOpen] = useState({isOpen:false,id:-1});

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Paper sx={{ width: '95%', overflow: 'auto', margin:'auto' ,marginTop:'1vh',marginBottom:'1vh'}}>
      <TableContainer style={{height:'100%',margin:'auto'}}>
        <Table stickyHeader aria-label="sticky table" size="small">
          <TableHead>
            <TableRow>
              {props.header.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  onClick={()=>{
                    if(column.id === 'addicon'){
                    props.addItem({name:'',qty:1},page,rowsPerPage)
                  }}}
                >
                <Tooltip title={column.id === 'addicon'?'Add Item':''} enterTouchDelay={0}>
                  {column.label}
                </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {shoppingList
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row,i) => {
                return (
                  <Fragment>
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code} maxheight={10}>
                    {props.header.map((column,index) => {
                      const value = row[column.id]
                      return (
                        column.id === 'none' ?  <TableCell key={column.id+(i+page * rowsPerPage)}>
                        <Tooltip title='Add Item to Shopping List' enterTouchDelay={0}>
                        <Fab size="small" aria-label="add"><AddIcon onClick={()=>{
                          props.addItem(row, page, rowsPerPage)
                        }}/></Fab>
                        </Tooltip>
                        </TableCell>: column.id === 'addicon'?
                        <TableCell key={column.id+(i+page * rowsPerPage)}>
                        <Tooltip title='Delete Item' enterTouchDelay={0}>
                        <Fab size="small" aria-label="add"><DeleteIcon onClick={()=>{
                          if(column.id === 'addicon'){
                            props.deleteItem(i,page,rowsPerPage)
                          }
                        }}/></Fab>
                        </Tooltip>
                        </TableCell>
                        :column.id==='details'? <TableCell key={column.id+(i+page * rowsPerPage)}>
                        {
                          open.isOpen?
                          <Fab size="small" aria-label="add"><KeyboardArrowUpIcon onClick={()=>{
                            setOpen({isOpen:!open.isOpen,id:(i+(page*rowsPerPage))})
                          }}/></Fab> :
                          <Fab size="small" aria-label="add"><KeyboardArrowDownIcon onClick={()=>{
                            props.getDetails(row.name,row.account)
                            setOpen({isOpen:!open.isOpen,id:(i+(page*rowsPerPage))})
                          }}/></Fab>
                        }
                        </TableCell>:
                        <TableCell id = {column.id+(i+page * rowsPerPage)} key={column.id+(i+page * rowsPerPage)} contentEditable={((props.type === 'presentList' || props.type === 'shoppingList') && permission !== 'View Only') && column.id !== 'addicon'} 
                        suppressContentEditableWarning={true} align={column.align} 
                        onMouseOver={()=>{
                          (props.type === 'presentList'|| props.type === 'shoppingList') && HandleMouseOver(column.id+(i+page * rowsPerPage))
                        }}
                        onMouseOut={(e)=>{
                          (props.type === 'presentList' || props.type === 'shoppingList')&& column.type !== 'icon' && props.formatItem(column.id,e.target.innerText,page,rowsPerPage,i)
                          }}
                          onKeyDown={(e)=>{
                            column.type === 'number' &&  e.key.match(/[^0-9]/) && e.key !== 'Backspace' && e.preventDefault()
                          }}
                          >
                          {column.format && typeof value === 'number'
                            ? column.format(value)
                            : value}
                           
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {
                    props.type === 'pastList' &&
                    <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0, margin:'auto',textAlign:'right'}} colSpan={6}>
                      <Collapse in={open.isOpen && open.id === (i+(page*rowsPerPage))} timeout="auto" unmountOnExit>
                          <Table size="small" style={{margin:'auto', border:'solid', width:'50%'}} >
                            <TableHead>
                              <TableRow>
                                <TableCell>Purchase Date</TableCell>
                                <TableCell>Purchase Quantity</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                            {
                                details &&  details.details &&  details.details.length>0 &&
                                details.details.map((item,index)=>{
                                  return(
                                    <TableRow>
                                    <TableCell>
                                    {new Date(item.purchaseDate).toLocaleDateString('en-us')}
                                    </TableCell>
                                    <TableCell>
                                    {item.qty}
                                    </TableCell>
                                    </TableRow>
                                  );
                                })
                              }
                              <TableRow>
                              <Table size="small" style={{paddingBottom: 0, paddingTop: 0,backgroundColor:'#482880', marginLeft:'10%'}}>
                              <TableRow >
                              <TableCell style={{color:'white',backgroundColor:'#673ab7',}}>purchased:</TableCell>
                              <TableCell style={{color:'white'}}>{details?details.qty:0}
                              </TableCell>
                              <TableCell style={{color:'white',backgroundColor:'#673ab7',}}>Used:</TableCell>
                              <TableCell style={{color:'white'}} id={'used'+(i+(page*rowsPerPage))}>
                              <input disabled={details && details.permission === 'view'} type="number" min ="0" max={details && details.qty} value={consumed?consumed.used:0} onChange={(e)=>{
                                props.changeDetails(parseInt(e.target.value),details.qty - parseInt(e.target.value))}}/>
                              </TableCell>
                              <TableCell style={{backgroundColor:'#673ab7',color:'white'}}>Left:</TableCell>
                              <TableCell style={{color:'white'}}>{consumed?consumed.left:details.qty}
                              </TableCell>
                              <TableCell><Button size="small" style={{backgroundColor:'#673ab7', color:'white', marginTop:'-0.5vh', marginBottom:'-0.5vh'}} 
                              variant="contained" onClick={()=> {
                                  props.updateItem()
                                  setOpen({isOpen:false,id:-1})
                                }}><SaveIcon size="small"></SaveIcon >Save</Button>
                              </TableCell>
                              </TableRow>
                              </Table>

                              </TableRow>
                              
                            </TableBody>
                          </Table>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                  }
                  </Fragment>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={props.shoppingList.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        showFirstButton={true}
        showLastButton ={true}
      />
    </Paper>
  );
}
