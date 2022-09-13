import { useEffect, useState, useContext, useCallback } from 'react'
import { Avatar, Box, Card, CardContent, Grid, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox'

function BasicModel(props) {
  return (
    <Card sx={{ height: '100%' }} {...props}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
          <Grid item>
            <Typography color='textSecondary' gutterBottom variant='overline'>
              Text secondary
            </Typography>
            <Typography color='textPrimary' variant='h4'>
              primary
            </Typography>
          </Grid>
          <Grid item>
            <Avatar
              sx={{
                backgroundColor: 'info.main',
                height: 56,
                width: 56,
              }}
            >
              <ForwardToInboxIcon />
            </Avatar>
          </Grid>
        </Grid>
        <Box
          sx={{
            pt: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography color='textPrimary' variant='h3'>
            Box
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default BasicModel
