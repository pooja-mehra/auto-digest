import {useState, Fragment} from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PaperComponent from './draggablecomponent';

export default function ClearAllDialog(props) {
  const {openClearAllDialog} = props;

  const handleClose = (isClear) => {
    props.clearAll(isClear);
  };

  return (
      <Dialog
        open={openClearAllDialog}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
          Clear All Items
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure, you want to remove all items?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={()=>handleClose(false)}>
            Cancel
          </Button>
          <Button onClick={()=>handleClose(true)}>Go Ahead</Button>
        </DialogActions>
      </Dialog>
  );
}