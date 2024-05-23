import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PaperComponent from './draggablecomponent';

export default function ClearAllDialog(props) {
  const {openClearAllDialog,isDelete} = props;

  const handleClose = (isClear) => {
   props.clearAll(isClear)
  };

  return (
      <Dialog
        open={openClearAllDialog}
        onClose={handleClose}
        PaperComponent={PaperComponent}
        aria-labelledby="draggable-dialog-title"
      >
        <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
        {isDelete ? 'Delete List' :'Clear List'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isDelete? 'Are you sure, you want to delete the list' : 'Are you sure, you want to clear list?'}
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