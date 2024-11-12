import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  TextField,
} from '@material-ui/core';
import { MuiColorInput } from 'mui-color-input';
import React from 'react';
import { useState } from 'react';
import { addSkiil } from '../services/index.js';

export const SkillForm = (props: {
  setOpen: (arg0: boolean) => void;
  open: boolean;
}) => {
  const [submit, setSubmit] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    type: '',
    color: '#ffffffff'
  });

  const handleClickClose = () => {
    setSubmit(false); // set is form submitted flase
    props.setOpen(false); // Set dialog close
  };
  const handleChange = (e: any) => {
    let id: string, value: string;
    if (!e?.target?.id) {
      (id = 'color'), (value = e);
    } else {
      id = e.target.id;
      value = e.target.value;
    }
      setFormValues(prevState => ({
        ...prevState,
        [id]: value,
      }));
  };

  const validateForm = () => {
    setSubmit(true);
    if (formValues.name.length === 0 || formValues.type.length === 0) {
      props.setOpen(true);
    }
  };

  const handleSubmit = () => {
    addSkiil({...formValues,users:[]});
    handleClickClose(); // Close the dialog after submission
  };

  return (
    <Dialog open={props.open} onClose={handleClickClose}>
      <DialogContent>
        {/* Form content */}
        <form autoComplete="off" onSubmit={handleSubmit}>
          <TextField
            label="Name"
            id="name"
            value={formValues?.name}
            onChange={handleChange}
            fullWidth
            required
            margin="dense"
            autoFocus
            error={submit && !formValues.name}
          />

          <TextField
            label="Type"
            id="type"
            value={formValues?.type}
            onChange={handleChange}
            fullWidth
            required
            margin="dense"
            error={submit && !formValues.type}
          />

          <MuiColorInput
            id="color"
            isAlphaHidden
            format="hex"
            label="Color"
            value={formValues.color}
            onChange={e => handleChange(e)}
            style={{ marginTop: '1rem' }}
          />

          <DialogActions>
            <Button color="primary" onClick={handleClickClose}>
              Cancel
            </Button>
            <Button color="primary" type="submit" onClick={validateForm}>
              Submit
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};
