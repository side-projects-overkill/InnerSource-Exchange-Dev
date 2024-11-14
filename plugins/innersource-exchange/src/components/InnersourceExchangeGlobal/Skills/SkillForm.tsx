import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Popover,
  TextField,
} from '@material-ui/core';
import { SketchPicker } from 'react-color';
import React, { useState } from 'react';
import { addSkiil } from '../services';

export const SkillForm = (props: {
  setOpen: (arg0: boolean) => void;
  open: boolean;
}) => {
  const [submit, setSubmit] = useState(false);
  const [showPicker, setPicker] = useState<any>();
  const [formValues, setFormValues] = useState({
    name: '',
    type: '',
    color: '#ffffff',
  });

  const handleClickClose = () => {
    setSubmit(false); // set is form submitted flase
    props.setOpen(false); // Set dialog close
  };
  const handleChange = (e: any) => {
    let id: string;
    let value: string;
    if (!e?.target?.id) {
      id = 'color';
      value = e;
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
    addSkiil({ ...formValues, users: [] });
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

          <TextField
            label="Color"
            value={formValues?.color}
            onClick={e => setPicker(e.currentTarget)}
            fullWidth
            margin="dense"
          />
          <Popover
            open={Boolean(showPicker)}
            anchorEl={showPicker}
            onClose={(e, r) => setPicker(null)}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <SketchPicker
              color={formValues.color}
              disableAlpha
              onChange={color => handleChange(color.hex)}
            />
          </Popover>

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
