import {
  ItemCardGrid,
  ItemCardHeader,
  Progress,
} from '@backstage/core-components';
import {
  EntityKindFilter,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import { SkillEntity } from 'backstage-plugin-innersource-exchange-common';
import React, { useEffect, useState } from 'react';
import { SkillForm } from './SkillForm';

export const SkillsTabContent = () => {
  const { entities, updateFilters, filters } = useEntityList();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    updateFilters({ kind: new EntityKindFilter('Skill') });
  }, [updateFilters]);

  if (filters.kind?.value !== 'Skill') return <Progress />;

  const handleClickOpen = () => {
    setOpen(true); // Set dialog open
  };

  return (
    <Box>
      <Grid container alignItems="center">
        <Grid item xs={8}>
          <Typography variant="h3">Skills</Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            fullWidth
            variant="standard"
            label="Find a skill"
            placeholder="Enter a keyword"
            helperText="Enter some text to search"
          />
        </Grid>
        <Grid item xs={2}>
          <Button color="primary" variant="contained" onClick={handleClickOpen}>
            Add Skill
          </Button>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <ItemCardGrid>
            {(entities as SkillEntity[]).map(d => (
              <Card key={d.metadata.uid}>
                <CardMedia style={{ backgroundColor: d.spec.color }}>
                  <ItemCardHeader subtitle={d.spec.type}>
                    <Typography variant="h3">{d.metadata.title}</Typography>
                  </ItemCardHeader>
                </CardMedia>
              </Card>
            ))}
          </ItemCardGrid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
      </Grid>

      <SkillForm open={open} setOpen={setOpen} />
    </Box>
  );
};
