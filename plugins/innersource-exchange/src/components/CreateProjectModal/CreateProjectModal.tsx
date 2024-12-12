import { ErrorBoundary, TableColumn, Table } from '@backstage/core-components';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
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
  TextField,
  Theme,
  Typography,
} from '@material-ui/core';
import { Autocomplete, TabContext, TabList } from '@material-ui/lab';
import TabPanel from '@material-ui/lab/TabPanel';
import React, { useEffect, useState } from 'react';
import { FormProvider, useForm, UseFormReturn } from 'react-hook-form';
import { innersourceExchangeApiRef } from '../../api';
import { Form1, Form2, TableRowDataType } from './Inputs/types';
import { WorkstreamDetailsForm } from './Forms/ProjectDetailsForm';
import { CollaboratorsForm } from './Forms/CollaboratorsForm';
import { UserEntity, stringifyEntityRef } from '@backstage/catalog-model';
import {
  EntityDisplayName,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import {
  ProjectData,
  SkillEntity,
} from 'backstage-plugin-innersource-exchange-common';
import useAsync from 'react-use/esm/useAsync';

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

const ReviewDetailsContent = (props: {
  form1: UseFormReturn<Form1>;
  form2: UseFormReturn<Form2>;
}) => {
  const { form1, form2 } = props;
  const projectDetails = form1.getValues();
  const { selectedMembers } = form2.getValues();
  const columns: TableColumn<TableRowDataType>[] = [
    {
      id: 'name',
      title: 'Name',
      field: 'user.spec.profile.displayName',
      render: data => (
        <EntityDisplayName entityRef={data.user} hideIcon disableTooltip />
      ),
    },
    {
      id: 'email',
      title: 'Email',
      field: 'user.spec.profile.email',
      render: data => <>{data.user.spec.profile?.email}</>,
    },
    {
      id: 'role',
      title: 'Role',
      field: 'role',
      render: data => data.role,
    },
  ];

  function getHumanReadableValue(option: UserEntity) {
    return option.spec.profile
      ? `${option.spec.profile.displayName} (${option.spec.profile.email})`
      : humanizeEntityRef(option, {
          defaultKind: 'user',
          defaultNamespace: false,
        });
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h3">Review</Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">Project Details</Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          label="Name"
          value={projectDetails.name}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          label="Description"
          value={projectDetails?.description}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          label="Owner"
          value={
            projectDetails.owner
              ? getHumanReadableValue(projectDetails.owner)
              : '-'
          }
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          fullWidth
          label="Start Date"
          value={projectDetails?.startDate}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          variant="outlined"
          fullWidth
          label="End Date"
          value={projectDetails?.endDate}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          label="Type"
          value={projectDetails?.type}
          InputProps={{ readOnly: true }}
        />
      </Grid>
      {/* <Grid item xs={12}>
        <TextField
          variant="outlined"
          fullWidth
          label="Slack Link"
          value={projectDetails.slackChannelUrl}
          InputProps={{ readOnly: true }}
        />
      </Grid> */}
      <Grid item xs={12}>
        <Autocomplete
          freeSolo
          disableClearable
          multiple
          fullWidth
          options={[] as SkillEntity[]}
          value={projectDetails.skills ?? []}
          getOptionLabel={option =>
            option.metadata.title ?? option.metadata.name
          }
          renderTags={(value, renderProps) =>
            value.map((option, index) => (
              <Chip
                label={option.metadata.title ?? option.metadata.name}
                {...renderProps({ index })}
                deleteIcon={<></>}
              />
            ))
          }
          renderInput={params => (
            <TextField {...params} variant="outlined" label="Portfolio" />
          )}
        />
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body1">Member Details</Typography>
      </Grid>

      <Grid item xs={12}>
        <Table
          columns={columns}
          data={[
            ...(projectDetails.owner
              ? [
                  {
                    role: 'Owner',
                    user: projectDetails.owner,
                  },
                ]
              : []),
            ...selectedMembers,
          ]}
          options={{
            toolbar: false,
            padding: 'dense',
          }}
        />
      </Grid>
    </Grid>
  );
};

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
  const identityApi = useApi(identityApiRef);

  const { value: currentUser } = useAsync(async () => {
    return (await identityApi.getBackstageIdentity()).userEntityRef;
  });

  // Changed needed here
  const form1 = useForm<Form1>({
    values: {
      name: undefined,
      owner: undefined,
      skills: [],
    },
    mode: 'onTouched',
  });

  const form2 = useForm<Form2>({
    values: {
      searchQuery: null,
      selectedMembers: [],
    },
    mode: 'all',
  });

  const [projectData, setProjectData] = useState<ProjectData>();
  const [loading, setLoading] = useState<boolean>(false);

  const projectDetails = form1.getValues();
  const { selectedMembers } = form2.getValues();

  function handleCreate(_e: any) {
    if (projectDetails.name && projectDetails.owner) {
      setLoading(true);
      setProjectData({
        id: 'subject-to-change',
        name: projectDetails.name,
        collaborators: selectedMembers.map(v => stringifyEntityRef(v.user)),
        type: projectDetails?.type,
        startDate: projectDetails?.startDate,
        endDate: projectDetails?.endDate,
        skills:
          projectDetails?.skills.map(skill => stringifyEntityRef(skill)) ?? [],
        owner: stringifyEntityRef(projectDetails.owner),
        createdOn: new Date().toISOString(),
        description: projectDetails.description ?? 'No description',
        extras: {
          createdBy: currentUser,
        },
      });
    }
  }

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
          {/* <Typography variant="h2">Review form</Typography> */}
          <ReviewDetailsContent form1={form1} form2={form2} />
        </>
      ),
    },
  ];

  const [open, setOpen] = useState(false);

  function handleClose() {
    form1.reset();
    form2.reset();
    setValue('1');
    setProjectData(undefined);
    setOpenFinalModal(false);
    setOpen(false);
  }

  useEffect(() => {
    if (loading && projectData) {
      innersourceApi
        .addNewProject(projectData)
        .then(_data => {
          setLoading(false);
          form1.reset();
          form2.reset();
          setOpenFinalModal(true);
        })
        .catch(_err => {
          setLoading(false);
        });
    }
  }, [innersourceApi, projectData, form2, form1, loading]);

  const nextButtonProps = (): ButtonProps => {
    if (value === '1')
      return {
        onClick: form1.handleSubmit(() => setValue('2')),
        // onClick: () => setValue('2'),
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
      disabled: loading,
      onClick: handleCreate,
    };
  };

  const backButtonProps = (): ButtonProps => {
    return {
      onClick: () => {
        if (value === '2') {
          setValue('1');
          form2.resetField('searchQuery');
        } else if (value === '3') {
          setValue('2');
          form2.resetField('searchQuery');
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
                  Your project has been created successfully.
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
