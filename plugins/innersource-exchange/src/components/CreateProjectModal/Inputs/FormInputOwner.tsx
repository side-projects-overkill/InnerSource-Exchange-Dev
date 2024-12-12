import { stringifyEntityRef, UserEntity } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  humanizeEntityRef,
} from '@backstage/plugin-catalog-react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAsync, useDebounce } from 'react-use';

export const FormInputOwnerName = () => {
  const catalogApi = useApi(catalogApiRef);
  const { control } = useFormContext<{
    owner: UserEntity | null;
  }>();

  const [ownerOptions, setOwnerOptions] = useState<UserEntity[]>([]);
  const [ownerName, setOwnerName] = useState<string>();
  const [loading, setLoading] = useState(false);

  useAsync(async () => {
    if (ownerName === undefined) {
      const res = await catalogApi.queryEntities({
        filter: { kind: 'User' },
        limit: 10,
      });
      setOwnerOptions(res.items as UserEntity[]);
    }
  }, [catalogApi, ownerName]);

  useDebounce(
    async () => {
      if (loading && ownerName) {
        const res = await catalogApi.queryEntities({
          filter: { kind: 'User' },
          limit: 10,
          ...(ownerName && {
            fullTextFilter: {
              term: ownerName,
              fields: [
                'metadata.name',
                'metadata.title',
                'spec.profile.displayName', // This field filter does not work
              ],
            },
          }),
        });
        setOwnerOptions(res.items as UserEntity[]);
        setLoading(false);
      }
    },
    400,
    [ownerName],
  );

  const handleInput = (val: string) => {
    if (val.trim().length > 1) {
      setOwnerName(val);
      setLoading(true);
    } else setOwnerName(undefined);
  };

  const getOwnerOptionLabel = (ownerOption: UserEntity) =>
    ownerOption.spec.profile
      ? `${ownerOption.spec.profile.displayName} (${ownerOption.spec.profile.email})`
      : humanizeEntityRef(ownerOption, {
          defaultKind: 'user',
          defaultNamespace: false,
        });

  return (
    <Controller
      name="owner"
      control={control}
      rules={{ required: 'Please add project owner name' }}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => {
        return (
          <Autocomplete
            value={value ?? null}
            options={ownerOptions}
            loading={loading}
            noOptionsText="No users found (enter correct uid)"
            getOptionSelected={(option, val) =>
              stringifyEntityRef(option) === stringifyEntityRef(val)
            }
            getOptionLabel={getOwnerOptionLabel}
            onBlur={onBlur}
            onInputChange={(_e, val) => {
              if (
                (value && getOwnerOptionLabel(value) === val) ||
                ownerOptions.some(p => getOwnerOptionLabel(p) === val)
              )
                return;
              handleInput(val);
            }}
            onChange={(_e, val) => onChange(val)}
            renderInput={params => (
              <TextField
                {...params}
                fullWidth
                label="Owner name"
                error={!!error}
                helperText={error?.message ?? 'Name of the project owner'}
                variant="outlined"
                placeholder="Enter Owner name"
                required
              />
            )}
          />
        );
      }}
    />
  );
};
