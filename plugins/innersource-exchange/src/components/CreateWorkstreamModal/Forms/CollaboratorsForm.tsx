import { UserEntity } from '@backstage/catalog-model';
import { Table, TableColumn } from '@backstage/core-components';
import {
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from '@material-ui/core';

import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  EntityDisplayName,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import { Alert, Autocomplete } from '@material-ui/lab';
import React, { useEffect, useState } from 'react';
import {
  Controller,
  FieldArrayWithId,
  useFieldArray,
  useFormContext,
  UseFormReturn,
} from 'react-hook-form';
import { useDebounce } from 'react-use';
import RemoveCircleOutlineOutlinedIcon from '@material-ui/icons/RemoveCircleOutlineOutlined';

import { Form1, TableRowDataType } from '../Inputs/types';


export const CollaboratorsForm = (props: { form1: UseFormReturn<Form1> }) => {
  const { form1 } = props;
  const { lead } = form1.getValues();
  const catalogApi = useApi(catalogApiRef);
  const {
    control,
    setValue,
    formState,
    setError,
    clearErrors,
  } = useFormContext<{
    searchQuery: UserEntity | null;
    kind: { label: string; value: string };
    selectedMembers: TableRowDataType[];
  }>();

  const { fields, append, remove, update } = useFieldArray({
    control: control,
    name: 'selectedMembers',
    rules: {
      validate: val => {
        if (val.length > 0) {
          val.forEach((eachValue, index) => {
            if (!eachValue.role) {
              setError(`selectedMembers.${index}.role`, {
                type: 'required',
                message: 'Please select role',
              });
            } else {
              clearErrors(`selectedMembers.${index}.role`);
            }
          });
          return val.every(p => Boolean(p.role));
        }
        return true;
      },
    },
    keyName: 'id',
  });

  const [options, setOptions] = useState<(UserEntity)[]>(
    [],
  );
  const [searchText, setSearchText] = useState('');


  const roleOptions = [
    'Workstream Lead',
    'Technical Lead',
    'Software Engineer',
    'Quality Engineer',
  ];

  function handleRoleChange(
    evt: React.ChangeEvent<{ name?: string; value: unknown }>,
    data: TableRowDataType,
    index: number,
  ) {
    update(index, { user: data.user, role: evt.target.value as string });
  }

  const columns: TableColumn<
    FieldArrayWithId<
      { selectedMembers: TableRowDataType[] },
      'selectedMembers',
      'id'
    >
  >[] = [
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
      render: data => {
        const index = fields.findIndex(p => p.id === data.id);
        const fieldError = formState.errors.selectedMembers
          ? formState.errors.selectedMembers[index]?.role
          : undefined;

        return (
          <>
            <Select
              variant="standard"
              style={{ padding: '0' }}
              placeholder="Select a role"
              fullWidth
              error={!!fieldError}
              value={data.role}
              label="Select Role"
              disabled={data.role === 'Workstream Lead'}
              onChange={evt => {
                handleRoleChange(evt, data, index);
              }}
            >
              {roleOptions.map(option => (
                <MenuItem
                  disabled={option === 'Workstream Lead'}
                  key={option}
                  value={option}
                >
                  {option}
                </MenuItem>
              ))}
            </Select>
            {!!fieldError && (
              <FormHelperText error>Please select role</FormHelperText>
            )}
          </>
        );
      },
    },
    // {
    //   id: 'manager',
    //   title: 'Manager',
    //   field: 'user.spec.manager',
    //   render: data =>
    //     data.user.spec.manager ? (
    //       <EntityDisplayName
    //         hideIcon
    //         defaultNamespace="redhat"
    //         entityRef={data.user.spec.manager}
    //       />
    //     ) : (
    //       '-'
    //     ),
    // },
    {
      id: 'action',
      align: 'center',
      title: 'Actions',
      sorting: false,
      width: '5%',
      render: data =>
        data.role !== 'Workstream Lead' && (
          <Tooltip title="Remove member">
            <IconButton
              color="secondary"
              size="small"
              onClick={() => remove(fields.findIndex(p => p.id === data.id))}
            >
              <RemoveCircleOutlineOutlinedIcon />
            </IconButton>
          </Tooltip>
        ),
    },
  ];
  const [loading, setLoading] = useState(false);

  function handleInputChange(value: string) {
    if (value.trim().length > 2) {
      setLoading(true);
      setSearchText(value.trim());
    }
  }

  function setTableDataFn(
    entity: UserEntity,
    workstreamLead?: UserEntity,
  ) {
    if (entity.metadata.uid === workstreamLead?.metadata.uid) return;
    if (fields.some(p => p.user.metadata.uid === entity.metadata.uid)) return;
    append({ user: entity, role: undefined });
  }
  function handleInputSelectedEntity(
    entity: UserEntity| null,
  ) {
    if (entity) {
      setTableDataFn(entity, lead);
    }
  }

  useEffect(() => {
    setValue('searchQuery', null);
  }, [fields, setValue]);

  useDebounce(
    async () => {
      if (loading) {
        if (searchText.length > 2) {
          const res = await catalogApi.queryEntities({
            filter: [{ kind: 'User' }],
            fullTextFilter: {
              term: searchText,
              fields: [
                'spec.profile.displayName', // This field filter does not work
                'metadata.name',
                'metadata.title',
              ],
            },
          });
          setOptions(res.items as UserEntity[]);
          setLoading(false);
        } else setOptions([]);
      }
    },
    400,
    [catalogApi, setOptions, searchText, loading],
  );

  const getOptionLabel = (option:UserEntity) =>
    option.spec.profile
      ? `${option.spec.profile.displayName} (${option.spec.profile.email})`
      : humanizeEntityRef(option, {
          defaultKind: 'User',
          defaultNamespace: false,
        });

  return (
    <Grid container style={{ width: '100%' }}>
      <Grid item lg={12} md={12}>
        <Controller
          name="searchQuery"
          control={control}
          rules={{
            deps: ['kind'],
          }}
          render={({
            field: { value, onChange, onBlur },
            fieldState: { error },
          }) => {
            return (
              <Autocomplete
                options={options}
                getOptionLabel={o => getOptionLabel(o)}
                getOptionSelected={(op, sel) =>
                  op.metadata.uid === sel.metadata.uid
                }
                loading={loading}
                noOptionsText="Enter correct uid"
                onInputChange={(_e, val) => {
                  if (
                    (value && getOptionLabel(value) === val) ||
                    options.some(p => getOptionLabel(p) === val)
                  )
                    return;
                  handleInputChange(val);
                }}
                onChange={(_e, val) => {
                  handleInputSelectedEntity(val);
                  onChange(val);
                }}
                value={value ?? null}
                onBlur={onBlur}
                renderInput={params => {
                  return (
                    <TextField
                      {...params}
                      color="primary"
                      label="Enter rover user/group name"
                      placeholder="Type here"
                      variant="outlined"
                      error={!!error}
                      helperText={error ? error.message : null}
                    />
                  );
                }}
              />
            );
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Table
          data={[
            ...(lead
              ? [
                  {
                    role: 'Workstream Lead',
                    user: lead,
                    id: 'first',
                  },
                ]
              : []),
            ...fields,
          ]}
          columns={columns}
          options={{
            draggable: false,
            pageSize: 10,
            search: false,
            showTitle: false,
            toolbar: true,
            padding: 'dense',
            paginationPosition: 'both',
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <Alert severity="info">Note: Members can be added later too</Alert>
      </Grid>
    </Grid>
  );
};
