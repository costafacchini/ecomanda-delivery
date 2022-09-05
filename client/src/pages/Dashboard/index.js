import { Box, Container, Grid } from '@mui/material'
import { DashboardLayout } from './components/dashboard-layout'
import { MonthMessages } from './components/month-messages'

export default function Dashboard() {
  return (
    <>
      <h1>Dashboard 1</h1>
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <DashboardLayout>
          <Container maxWidth={false}>
            <Grid container spacing={3}>
              <Grid item lg={3} sm={6} xl={3} xs={12}>
                <MonthMessages/>
              </Grid>
              <Grid item xl={3} lg={3} sm={6} xs={12}>

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
