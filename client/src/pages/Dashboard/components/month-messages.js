import { useEffect, useState, useContext, useCallback } from 'react'
import { Avatar, Box, Card, CardContent, Grid, Typography } from '@mui/material'
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox'
import Loading from '../../../components/Loading'

function MonthMessages(date, props) {
  const [stats, setStats] = useState({ month: '', messagesDelivered: 0, messagesError: 0 })

  useEffect(() => {
    let abortController = new AbortController()

    try {
      if (stats.month === '') {
        // fetch
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        // Handling error thrown by aborting request
      }
    }

    return () => {
      abortController.abort()
    }
  }, [stats])

  if (stats.month === '') {
    return (
      <Card sx={{ height: '100%' }} {...props}>
        <CardContent sx={{ height: '100%' }} >
          <Loading />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card sx={{ height: '100%' }} {...props}>
      <CardContent>
        <Grid container spacing={3} sx={{ justifyContent: 'space-between' }}>
          <Grid item>
            <Typography color='textSecondary' gutterBottom variant='overline'>
              Mensagens enviadas
            </Typography>
            <Typography color='textPrimary' variant='h4'>
              24
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
            99
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

export default MonthMessages
