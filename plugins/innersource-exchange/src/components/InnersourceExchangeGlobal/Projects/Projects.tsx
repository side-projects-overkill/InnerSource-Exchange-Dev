import { parseEntityRef, stringifyEntityRef } from '@backstage/catalog-model';
import {
  ItemCardGrid,
  ItemCardHeader,
  Progress,
} from '@backstage/core-components';
import {
  EntityDisplayName,
  EntityKindFilter,
  EntityRefLink,
  EntityTextFilter,
  useEntityList,
} from '@backstage/plugin-catalog-react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@material-ui/core';
import { ProjectEntity } from 'backstage-plugin-innersource-exchange-common';
import React, { useEffect, useState } from 'react';
import { CreateProjectModal } from '../../CreateProjectModal';
import { useRouteRef } from '@backstage/core-plugin-api';
import { catalogPlugin } from '@backstage/plugin-catalog';
import { useNavigate } from 'react-router-dom';

export const ProjectsTabContent = () => {
  const { entities, updateFilters, filters } = useEntityList();
  const [filterText, setFilterText] = useState<string>();

  const catalogRoute = useRouteRef(catalogPlugin.routes.catalogEntity);
  const navigate = useNavigate();

  useEffect(() => {
    updateFilters({
      kind: new EntityKindFilter('Project'),
      text: new EntityTextFilter(filterText ?? ''),
    });
  }, [updateFilters, filterText]);

  if (filters.kind?.value !== 'Project') return <Progress />;

  return (
    <Box>
      <Grid container alignItems="center">
        <Grid item xs={8}>
          <Typography variant="h3">Marketplace</Typography>
        </Grid>
        <Grid item xs={2}>
          <TextField
            fullWidth
            variant="standard"
            label="Find a project"
            onChange={e => {
              setFilterText(e.target.value);
            }}
            placeholder="Enter a keyword"
            helperText="Enter some text to search"
          />
        </Grid>
        <Grid item xs={2}>
          <CreateProjectModal />
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12}>
          <ItemCardGrid>
            {(entities as ProjectEntity[]).map(d => (
              <Card key={d.metadata.uid}>
                <CardMedia>
                  <ItemCardHeader subtitle={d.spec.type}>
                    <Typography variant="h3">{d.metadata.title}</Typography>
                  </ItemCardHeader>
                </CardMedia>
                <CardContent>
                  <Grid container spacing={1} direction="column">
                    <Grid item xs={12}>
                      <Typography variant="body2">
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
                </CardContent>
                <CardActions style={{ justifyContent: 'space-between' }}>
                  <EntityRefLink entityRef={d.spec.owner} />
                  <Button
                    onClick={() => {
                      navigate(
                        catalogRoute(parseEntityRef(stringifyEntityRef(d))),
                      );
                    }}
                    variant="outlined"
                    color="primary"
                  >
                    View
                  </Button>
                </CardActions>
              </Card>
            ))}
          </ItemCardGrid>
        </Grid>
        <Grid item xs={12}>
          <Divider />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h3">Completed Projects</Typography>
        </Grid>
      </Grid>
    </Box>
  );
};
