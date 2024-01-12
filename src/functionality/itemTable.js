import {useEffect,useState, Fragment} from 'react';
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
import EditIcon from '@mui/icons-material/Edit';


export default function ItemTable(props) {
  const {shoppingList,type,details,consumed} = props
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

  useEffect(()=>{
  },)

 
  return (
    <Paper sx={{ width: '95%', overflow: 'auto', margin:'auto' ,marginTop:'1vh',marginBottom:'1vh'}}>
      <TableContainer style={{height:'90%',margin:'auto'}}>
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
                  {column.label}
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
                        <AddIcon onClick={()=>{
                          props.addItem(row, page, rowsPerPage)
                        }}/>
                        </TableCell>: column.id === 'addicon'?
                        <TableCell key={column.id+(i+page * rowsPerPage)}>
                        <DeleteIcon onClick={()=>{
                          if(column.id === 'addicon'){
                            props.deleteItem(i,page,rowsPerPage)
                          }
                        }}/>
                        </TableCell>
                        :column.id==='details'? <TableCell key={column.id+(i+page * rowsPerPage)}>
                        {
                          open.isOpen?
                          <KeyboardArrowUpIcon onClick={()=>{
                            setOpen({isOpen:!open.isOpen,id:(i+(page*rowsPerPage))})
                          }}/> :
                          <KeyboardArrowDownIcon onClick={()=>{
                            props.getDetails(row.name)
                            setOpen({isOpen:!open.isOpen,id:(i+(page*rowsPerPage))})
                          }}/>
                        }
                        </TableCell>:
                        <TableCell id = {column.id+(i+page * rowsPerPage)} key={column.id+(i+page * rowsPerPage)} contentEditable={props.type === 'presentList' && column.id !== 'addicon'} 
                        suppressContentEditableWarning={true} align={column.align} 
                        onMouseOver={()=>{
                          props.type === 'presentList' && HandleMouseOver(column.id+(i+page * rowsPerPage))
                        }}
                        onMouseOut={(e)=>{
                          props.type === 'presentList' && column.type !== 'icon' && props.formatItem(column.id,e.target.innerText,page,rowsPerPage,i)
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
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                      <Collapse in={open.isOpen && open.id === (i+(page*rowsPerPage))} timeout="auto" unmountOnExit>
                          <Table size="small" aria-label="purchases" style={{backgroundColor:'beige'}}>
                            <TableHead>
                              <TableRow>
                                <TableCell>Purchase Date</TableCell>
                                <TableCell>Purchase Quantity</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                            {
                                details && 
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
                              <Table size={'small'} style={{backgroundColor:'lightgrey'}}>
                              <TableRow>
                              <TableCell>purchased:</TableCell>
                              <TableCell >{details?details.qty:0}</TableCell>
                              <TableCell>Used:</TableCell>
                              <TableCell id={'used'+(i+(page*rowsPerPage))} contentEditable ={true} suppressContentEditableWarning={true}
                              onKeyUp={(e)=>{
                                if( e.key.match(/[^0-9]/) && e.key !== 'Backspace'){
                                  e.preventDefault()
                                } else{
                                  parseInt(e.target.innerText) > 0 && parseInt(e.target.innerText) <= details.qty && e.target.innerText !== '' && 
                                  props.changeDetails(parseInt(e.target.innerText),details.qty - parseInt(e.target.innerText))
                                }
                              }}
                              onMouseOver={()=>open.isOpen && open.id === (i+(page*rowsPerPage)) && HandleMouseOver('used'+(i+(page*rowsPerPage)))} 
                              >{consumed?consumed.used:0}
                              </TableCell>
                              <TableCell>Left:</TableCell>
                              <TableCell>{consumed?consumed.left:details.qty}
                              </TableCell>
                              <TableCell><Button onClick={()=> {
                                  props.updateItem()
                                  setOpen({isOpen:false,id:-1})
                                }}>Save</Button>
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
