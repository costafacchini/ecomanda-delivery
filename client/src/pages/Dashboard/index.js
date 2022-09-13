import { Box, Container, Grid } from '@mui/material'
import { DashboardLayout } from './components/dashboard-layout'
import MonthMessages from './components/month-messages'
import BasicModel from './components/basic-model'

export default function Dashboard() {
  return (
    <>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          py: 1,
        }}
      >
        <DashboardLayout>
          <Container maxWidth={false}>
            <Grid container spacing={3}>
              <Grid item lg={3} sm={6} xl={3} xs={12}>
                <BasicModel />
              </Grid>
              <Grid item xl={3} lg={3} sm={6} xs={12}>
                <MonthMessages />
              </Grid>
              <Grid item xl={3} lg={3} sm={6} xs={12}>
              </Grid>
              <Grid item xl={3} lg={3} sm={6} xs={12}>
              </Grid>
            </Grid>
          </Container>
        </DashboardLayout>
      </Box>
    </>
  )
}
