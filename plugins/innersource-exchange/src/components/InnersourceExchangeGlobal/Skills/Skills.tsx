import { ItemCardGrid, Progress } from '@backstage/core-components';
import {
  EntityKindFilter,
  EntityTextFilter,
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
  const [filterText, setFilterText] = useState<string>();

  useEffect(() => {
    updateFilters({
      kind: new EntityKindFilter('Skill'),
      ...(filterText && { text: new EntityTextFilter(filterText) }),
    });
  }, [updateFilters, filterText]);

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
            onChange={e => setFilterText(e.target.value)}
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
            {(entities as SkillEntity[]).map(d => {
              const getFontColor = (hexColor: string) => {
                // Convert HEX to RGB
                const bigint = parseInt(hexColor.slice(1), 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;

                // Calculate perceived brightness
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;

                // Return black for light backgrounds and white for dark backgrounds
                return brightness > 128 ? '#000' : '#FFF';
              };

              const fontColor = getFontColor(d.spec.color ?? '000');
              return (
                <Card elevation={0} key={d.metadata.uid}>
                  <CardMedia
                    style={{
                      backgroundColor: d.spec.color,
                      padding: '16px 16px 24px',
                      color: fontColor,
                    }}
                  >
                    <Typography variant="subtitle2">{d.spec.type}</Typography>
                    <Typography variant="h3">{d.metadata.title}</Typography>
                  </CardMedia>
                </Card>
              );
            })}
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
