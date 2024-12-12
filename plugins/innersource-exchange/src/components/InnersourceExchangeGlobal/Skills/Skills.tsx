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
  CardActionArea,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  Switch,
  TextField,
  Typography,
} from '@material-ui/core';
import { SkillEntity } from 'backstage-plugin-innersource-exchange-common';
import React, { useEffect, useState } from 'react';
import { SkillForm } from './SkillForm';
import { useRouteRef } from '@backstage/core-plugin-api';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import { useNavigate } from 'react-router-dom';

export const SkillsTabContent = () => {
  const { entities, updateFilters, filters } = useEntityList();
  const [open, setOpen] = useState(false);
  const [filterText, setFilterText] = useState<string>();

  useEffect(() => {
    updateFilters({
      kind: new EntityKindFilter('Skill'),
      text: new EntityTextFilter(filterText ?? ''),
    });
  }, [updateFilters, filterText]);
  const catalgoRoute = useRouteRef(catalogPlugin.routes.catalogEntity);
  const handleClickOpen = () => {
    setOpen(true); // Set dialog open
  };
  const [showColor, setShowColor] = useState(true);
  const navigate = useNavigate();

  if (filters.kind?.value !== 'Skill') return <Progress />;

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
            onChange={e => {
              setFilterText(e.target.value);
            }}
            placeholder="Enter a keyword"
            helperText="Enter some text to search"
          />
        </Grid>
        <Grid item xs={2} style={{ display: 'flex', flexDirection: 'row' }}>
          <Button
            color="primary"
            variant="contained"
            onClick={handleClickOpen}
            style={{ marginRight: '12px' }}
          >
            Add Skill
          </Button>
          <FormGroup row>
            <FormControlLabel
              control={
                <Switch
                  checked={showColor}
                  onChange={(_e, checked) => setShowColor(checked)}
                  name="show-colors"
                />
              }
              label="Show Colors"
            />
          </FormGroup>
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
                <Card
                  elevation={5}
                  style={{
                    opacity: '80%',
                    ...(showColor && {
                      backgroundColor: d.spec.color,
                      color: fontColor,
                    }),
                  }}
                  key={d.metadata.uid}
                >
                  <CardActionArea
                    style={{
                      padding: '16px 16px 24px',
                    }}
                    onClick={() =>
                      navigate(
                        catalgoRoute(parseEntityRef(stringifyEntityRef(d))),
                      )
                    }
                  >
                    <Typography variant="subtitle2">{d.spec.type}</Typography>
                    <Typography variant="h3">{d.metadata.title}</Typography>
                    <Chip
                      variant="default"
                      color="primary"
                      label={`${d.spec.users.length} Users`}
                    />
                    <Chip
                      variant="default"
                      color="secondary"
                      label={`${
                        d.relations?.filter(
                          relation => relation.type === 'project',
                        ).length ?? 0
                      } Projects`}
                    />
                  </CardActionArea>
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
