import {useEffect,useState} from 'react';
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
import Fab from '@mui/material/Fab';

export default function ItemTable(props) {
  //const {shoppingList} = props
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

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
                  onClick={()=>{if(column.id === 'icon'){
                    props.addItem({name:'',qty:1})
                  }}}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {props.shoppingList
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row,i) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code} maxHeight={10}>
                    {props.header.map((column,index) => {
                      const value = row[column.id]
                      return (
                        column.id === 'none' ?  <TableCell>
                        <Fab size="small" style={{backgroundColor:'black'}} aria-label="add">
                        <AddIcon onClick={()=>{
                          props.addItem(row)
                        }}style={{color:'white'}}/>
                        </Fab></TableCell>: column.id === 'icon'?
                        <TableCell>
                        <Fab size="small" style={{backgroundColor:'black'}} aria-label="add">
                        <DeleteIcon onClick={()=>{
                          if(column.id === 'icon'){
                            props.deleteItem(i)
                          }
                        }}style={{color:'white'}}/></Fab>
                        </TableCell>
                        :<TableCell contentEditable={props.type === 'presentList' && column.id !== 'icon'} suppressContentEditableWarning={true} key={column.id} align={column.align} 
                        onMouseOut={(e)=>{
                          props.type === 'presentList' && column.type !== 'icon' && props.formatItem(i,column.id,e.target.innerText)
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
      />
    </Paper>
  );
}
