import { Box, Button, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export function PricingSuccessPage() {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        Payment was successful
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Now you have full access to questions.
      </Typography>
      <Button variant="contained" size="large" onClick={() => navigate('/')}>
        Go home
      </Button>
    </Box>
  )
}

