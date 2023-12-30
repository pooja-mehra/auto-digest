import * as React from 'react';
import { useState,useEffect } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DateRangePicker from '../functionality/dateRangePicker';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export default function SimpleDialog(props) {
  const {openDialog, type} = props;
  const [selection,setSelection ] = useState(null)

  const handleSave = (e) => {
    props.setDialog(false,false,type === 'daterange'?selection :new Date(e.$d).toLocaleDateString("en-US"))
  };

  const handleClose = () => {
    props.setDialog(false,true)
    setSelection(null)
  };
  
  const setDateRange =(selection) =>{
    setSelection(selection)
  }
  return (
    <Dialog onClose={handleClose} open={openDialog}>
      <DialogTitle>Set Purchase Date {type === 'daterange'&&' Range'}</DialogTitle>
      <DialogContent>
      {
        type === 'daterange'?
        <DateRangePicker setDateRange={setDateRange}></DateRangePicker>:
        <LocalizationProvider dateAdapter={AdapterDayjs}>
        <StaticDatePicker defaultValue={dayjs(Date.now())} onAccept={(e)=>handleSave(e)} onClose={handleClose}/>
        </LocalizationProvider>
        }
      </DialogContent>
      {type === 'daterange' &&
      <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} autoFocus>Ok</Button>
        </DialogActions>}
    </Dialog>
  );
}