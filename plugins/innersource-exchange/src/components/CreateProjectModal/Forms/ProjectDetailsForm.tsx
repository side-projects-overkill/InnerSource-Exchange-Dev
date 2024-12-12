import React from 'react';
import { Grid } from '@material-ui/core';
import { FormInputTextField } from '../Inputs/FormInputTextField';
import { FormInputOwnerName } from '../Inputs/FormInputOwner';
import { FormInputSkills } from '../Inputs/FormInputSkills';
import { useFormContext } from 'react-hook-form';
import { Form1 } from '../Inputs/types';

export const WorkstreamDetailsForm = () => {
  const { watch, getValues } = useFormContext<Form1>();

  watch('startDate');

  return (
    <Grid container>
      <Grid item xs={12}>
        <FormInputTextField
          name="name"
          label="Project Name"
          placeholder="Enter Project Name"
          textFieldProps={{ multiline: false }}
          rules={{ required: 'Please enter project name' }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInputOwnerName />
      </Grid>
      <Grid item xs={6}>
        <FormInputTextField
          name="startDate"
          label="Start Date"
          placeholder="Enter Start Date"
          textFieldProps={{
            multiline: false,
            type: 'date',
            InputLabelProps: {
              shrink: true,
            },
          }}
        />
      </Grid>
      <Grid item xs={6}>
        <FormInputTextField
          name="endDate"
          label="End Date"
          placeholder="Enter End Date"
          textFieldProps={{
            multiline: false,
            type: 'date',
            InputProps: {
              inputProps: {
                min: getValues('startDate') ?? undefined,
              },
            },
            InputLabelProps: {
              shrink: true,
            },
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInputTextField
          name="type"
          label="Type"
          placeholder="Enter Type"
          textFieldProps={{ multiline: false }}
        />
      </Grid>
      <Grid item xs={12}>
        <FormInputSkills />
      </Grid>
      <Grid item xs={12}>
        <FormInputTextField
          name="description"
          label="Description"
          placeholder="Enter some description"
          textFieldProps={{ multiline: true, rows: 5 }}
        />
      </Grid>
    </Grid>
  );
};
