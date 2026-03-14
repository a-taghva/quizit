import { Box, CircularProgress } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ children }) {
  const { loading } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return children
}
