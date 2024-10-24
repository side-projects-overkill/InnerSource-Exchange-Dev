import {
  ItemCardGrid,
  ItemCardHeader,
  Progress
} from '@backstage/core-components';
import {
  EntityKindFilter,
  useEntityList
} from '@backstage/plugin-catalog-react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  Divider,
  Grid,
  TextField,
  Typography
} from '@material-ui/core';
import { SkillEntity } from 'backstage-plugin-innersource-exchange-common';
import React, { useEffect } from 'react';

export const SkillsTabContent = () => {
  const { entities, updateFilters, filters } = useEntityList();

  useEffect(() => {
    updateFilters({ kind: new EntityKindFilter('Skill') });
  }, [updateFilters]);

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
            placeholder="Enter a keyword"
            helperText="Enter some text to search"
          />
        </Grid>
        <Grid item xs={2}>
          <Button color="primary" variant="contained">
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
                {/* <CardContent>
                  <Grid container spacing={1} direction="column">
                    <Grid item xs={12}>
                      <Typography variant="body">
                        {d.metadata.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Divider />
                    </Grid>
                    <Grid item xs={12}>
                      {d.spec.skills.map(skill => (
                        <Chip
                          clickable={false}
                          key={skill}
                          label={
                            <EntityDisplayName
                              hideIcon
                              disableTooltip
                              entityRef={skill}
                            />
                          }
                        />
                      ))}
                    </Grid>
                  </Grid>
                </CardContent> */}
                {/* <CardActions>
                  <Button variant="contained" color="primary">
                    <EntityPeekAheadPopover entityRef={stringifyEntityRef(d)}>
                      View
                    </EntityPeekAheadPopover>
                  </Button>
                </CardActions> */}
              </Card>
            ))}
          </ItemCardGrid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
      </Grid>
    </Box>
  );
};
