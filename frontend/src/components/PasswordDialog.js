import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

const PasswordDialog = ({ open, onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const handleSubmit = () => {
    onSubmit(password);
    setPassword('');
  };
  const handleClose = () => {
    onClose();
    setPassword('');
  };
  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Encryption Password</DialogTitle>
      <DialogContent>
        <TextField 
          autoFocus
          margin="dense"
          label="Encryption Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">OK</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PasswordDialog;
