import { Content, PageWithHeader } from '@backstage/core-components';
import { Grid, Typography } from '@material-ui/core';
import React from 'react';

export const MarketPlacePage = () => {
  return (
    <PageWithHeader themeId="home" title="InnerSource">
      <Content stretch>
        <Grid container>
          <Grid item xs={12}>
            <Typography variant="h3">Marketplace</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h3">Completed Projects</Typography>
          </Grid>
        </Grid>
      </Content>
    </PageWithHeader>
  );
};
