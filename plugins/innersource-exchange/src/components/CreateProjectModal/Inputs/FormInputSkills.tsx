import { stringifyEntityRef } from '@backstage/catalog-model';
import { useApi } from '@backstage/core-plugin-api';
import {
  catalogApiRef,
  EntityDisplayName,
} from '@backstage/plugin-catalog-react';
import { Checkbox, TextField } from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { SkillEntity } from 'backstage-plugin-innersource-exchange-common';
import React, { useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useAsync, useDebounce } from 'react-use';

export const FormInputSkills = () => {
  const catalogApi = useApi(catalogApiRef);
  const [skillOptions, setSkillOptions] = useState<SkillEntity[]>([]);
  const [searchText, setSearchText] = useState<string>();

  const { control } = useFormContext<{ skills: SkillEntity[] }>();

  useEffect(() => {
    catalogApi
      .queryEntities({ filter: { kind: 'Skill' }, limit: 100 })
      .then(res => setSkillOptions(res.items as SkillEntity[]));
  }, [catalogApi]);

  useAsync(async () => {
    if (searchText === undefined) {
      const res = await catalogApi.queryEntities({
        filter: { kind: 'Skill' },
        limit: 100,
      });
      setSkillOptions(res.items as SkillEntity[]);
    }
  }, [catalogApi, searchText]);

  useDebounce(
    () => {
      if (searchText) {
        catalogApi
          .queryEntities({
            limit: 20,
            filter: { kind: 'Skill' },
            fullTextFilter: {
              term: searchText,
              fields: ['metadata.name', 'metadata.title'],
            },
          })
          .then(res => setSkillOptions(res.items as SkillEntity[]));
      }
    },
    400,
    [searchText],
  );

  return (
    <Controller
      name="skills"
      control={control}
      render={({ field: { onBlur, onChange, value } }) => {
        return (
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={skillOptions}
            getOptionSelected={(option, val) =>
              stringifyEntityRef(option) === stringifyEntityRef(val)
            }
            getOptionLabel={option => {
              return option.metadata.title ?? option.metadata.name;
            }}
            renderOption={(option, { selected }) => {
              return (
                <>
                  <Checkbox checked={selected} />
                  <EntityDisplayName entityRef={option} disableTooltip />
                </>
              );
            }}
            onBlur={onBlur}
            onChange={(_e, val) => onChange(val)}
            onInputChange={(_, val) => {
              if (val.length > 2) setSearchText(val);
              else setSearchText(undefined);
            }}
            value={value}
            renderInput={params => (
              <TextField
                {...params}
                variant="outlined"
                fullWidth
                label="Add skills"
                placeholder="Select from list"
                helperText="Optional can be added later"
              />
            )}
          />
        );
      }}
    />
  );
};
