import { ErrorBoundary } from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import {
  Box,
  Button,
  ButtonProps,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Tab,
  Theme,
  Typography,
} from '@material-ui/core';
import { TabContext, TabList } from '@material-ui/lab';
import TabPanel from '@material-ui/lab/TabPanel';
// import { kebabCase } from 'lodash';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { innersourceExchangeApiRef } from '../../api';
import { Form1, Form2 } from './Inputs/types';
import { WorkstreamDetailsForm } from './Forms/WorkstreamDetailsForm';
import { CollaboratorsForm } from './Forms/CollaboratorsForm';

const useStyles = makeStyles((theme: Theme) => ({
  fullHeightDialog: {
    height: '90vh',
  },
  root: {
    flexGrow: 1,
    display: 'flex',
    padding: 0,
  },
  tabs: {
    borderRight: `1px solid ${theme.palette.divider}`,
    minWidth: '15rem',
    padding: '0',
  },
  tabRoot: {
    maxWidth: 'none',
    cursor: 'default',
  },
  tabSpan: {
    alignItems: 'flex-start',
    width: '100%',
  },
  panel: {
    overflowY: 'auto',
  },
  dialogActions: {
    justifyContent: 'flex-start',
    marginLeft: '15rem',
    paddingLeft: '16px',
    '& button': {
      margin: '8px',
    },
  },
}));

const TabTitle = (props: { index: string; label: string; value: string }) => {
  return (
    <Box display="flex" alignItems="center" style={{ padding: '5px 0' }}>
      <Chip
        style={{ marginBottom: '0' }}
        color={props.value === props.index ? 'primary' : 'default'}
        label={props.index}
      />
      <Typography variant="body1">{props.label}</Typography>
    </Box>
  );
};

export const CreateProjectModal = () => {
  const classes = useStyles();
  const innersourceApi = useApi(innersourceExchangeApiRef);
  const [value, setValue] = React.useState<string>('1');

  // Changed needed here
  const form1 = useForm<Form1>({
    mode: 'onTouched',
  });

  const form2 = useForm<Form2>({
    values: {
      kind: { label: 'Rover User', value: 'user' },
      searchQuery: null,
      selectedMembers: [],
    },
    mode: 'all',
  });

  const handleChange = (val: string) => {
    if (form1.formState.isValid) {
      setValue(val);
    }
  };

  const [openFinalModal, setOpenFinalModal] = useState(false);

  const tabsMap = [
    {
      index: '1',
      label: 'Workstream details',
      children: (
        <FormProvider {...form1}>
          <Typography variant="h2">Project details form</Typography>
          <WorkstreamDetailsForm />
        </FormProvider>
      ),
    },
    {
      index: '2',
      label: 'Member details',
      children: (
        <ErrorBoundary slackChannel={{ name: 'one-platform' }}>
          <FormProvider {...form2}>
            <Typography variant="h2">Collaborators form</Typography>
            <CollaboratorsForm form1={form1} />
            <></>
          </FormProvider>
        </ErrorBoundary>
      ),
    },
    {
      index: '3',
      label: 'Review',
      children: (
        <>
          <Typography variant="h2">Review form</Typography>
          {/* <ReviewDetailsContent form1={form1} form2={form2} /> */}
        </>
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  function handleClose() {
    form1.reset();
    form2.reset();
    setValue('1');
    // setWorkstreamData(undefined);
    setOpenFinalModal(false);
    setOpen(false);
  }

  const nextButtonProps = (): ButtonProps => {
    if (value === '1')
      return {
        // onClick: form1.handleSubmit(() => setValue('2')),
        onClick: () => setValue('2'),
        disabled: !form1.formState.isValid,
        children: 'Next',
      };
    if (value === '2')
      return {
        onClick: form2.handleSubmit(() => setValue('3')),
        // onClick: () => setValue('3'),
        children: 'Next',
      };
    return {
      children: 'Create',
      // disabled: loading,
      // onClick: handleCreate,
    };
  };

  const backButtonProps = (): ButtonProps => {
    return {
      onClick: () => {
        if (value === '2') {
          setValue('1');
          // form2.resetField('searchQuery');
        } else if (value === '3') {
          setValue('2');
          // form2.resetField('searchQuery');
        }
      },
      children: 'Back',
    };
  };

  // const {
  //   filters: { kind },
  // } = useEntityList();
  // if (kind?.value !== 'workstream') {
  //   return <></>;
  // }

  return (
    <div>
      <Button
        variant="contained"
        style={{ margin: '0 8px 0 8px' }}
        onClick={() => setOpen(true)}
        color="primary"
      >
        Create Project
      </Button>
      {open && (
        <Dialog
          open={open}
          maxWidth="lg"
          onClose={(_e, reason) =>
            reason !== 'backdropClick' ? setOpen(false) : null
          }
          PaperProps={{ className: classes.fullHeightDialog }}
        >
          <DialogTitle>Create a Project</DialogTitle>
          <DialogContent dividers className={classes.root}>
            <TabContext value={value}>
              <TabList
                className={classes.tabs}
                onChange={(_e, val) => handleChange(val)}
                orientation="vertical"
              >
                {tabsMap.map(tab => (
                  <Tab
                    key={tab.index}
                    classes={{
                      wrapper: classes.tabSpan,
                      root: classes.tabRoot,
                    }}
                    value={tab.index}
                    fullWidth
                    label={
                      <TabTitle
                        label={tab.label}
                        index={tab.index}
                        value={value}
                      />
                    }
                  />
                ))}
              </TabList>
              {tabsMap.map(tab => (
                <TabPanel
                  key={tab.index}
                  className={classes.panel}
                  value={tab.index}
                >
                  {tab.children}
                </TabPanel>
              ))}
            </TabContext>
          </DialogContent>
          <DialogActions className={classes.dialogActions}>
            {value !== '1' && (
              <Button
                color="primary"
                variant="outlined"
                {...backButtonProps()}
              />
            )}
            <Button
              color="primary"
              variant="contained"
              {...nextButtonProps()}
            />
            <Button
              style={{ marginLeft: '2rem' }}
              color="primary"
              variant="text"
              onClick={() => handleClose()}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
      {openFinalModal && (
        <Dialog maxWidth="sm" fullWidth open={openFinalModal}>
          <DialogContent>
            <Grid container>
              <Grid item xs={12}>
                <Typography variant="h5">
                  Your workstream {`{{Project Name here}}`}
                  {/* <b>
                    <EntityRefLink
                      entityRef={`project:default/${workstreamData?.name}`}
                    />
                  </b>{' '} */}
                  has been created successfully.
                </Typography>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleClose()}
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
