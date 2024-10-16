import {
  Content,
  ItemCardGrid,
  ItemCardHeader,
  PageWithHeader,
} from '@backstage/core-components';
import data from './data.json';
import {
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
import React from 'react';

export const MarketPlacePage = () => {
  return (
    <PageWithHeader themeId="home" title="InnerSource">
      <Content stretch>
        <Grid container>
          <Grid item xs={6}>
            <Typography variant="h3">Marketplace</Typography>
          </Grid>
          <Grid item xs={6}>
            <TextField placeholder="Enter a keyword" />
            <Button color="primary" variant="contained">
              Add Project
            </Button>
          </Grid>
          <Grid item xs={12}>
            <ItemCardGrid>
              {data.map(d => (
                <Card key={d.uid}>
                  <CardMedia>
                    <ItemCardHeader subtitle={d.created_on}>
                      <Typography variant="h3">{d.title}</Typography>
                    </ItemCardHeader>
                  </CardMedia>
                  <CardContent>
                    <Grid container spacing={1} direction="column">
                      <Grid item xs={12}>
                        <Typography variant="body2">{d.description}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Divider />
                      </Grid>
                      <Grid item xs={12}>
                        {d.skills.map(skill => (
                          <Chip clickable={false} key={skill} label={skill} />
                        ))}
                      </Grid>
                    </Grid>
                  </CardContent>
                  <CardActions>
                    <Button variant="contained" color="primary">
                      OPEN
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
      </Content>
    </PageWithHeader>
  );
};
