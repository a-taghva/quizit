import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import GoogleIcon from '@mui/icons-material/Google'
import { supabase } from '../lib/supabase'

export function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from?.pathname || '/'

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${from}`,
        },
      })
      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
        return
      }
      setError('Redirect to Google sign-in failed. Please try again.')
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        pt: 'env(safe-area-inset-top)',
        pb: 'env(safe-area-inset-bottom)',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Plumber Exam
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Button
          fullWidth
          variant="outlined"
          size="large"
          disabled={loading}
          onClick={handleGoogleSignIn}
          startIcon={<GoogleIcon />}
          sx={{ mt: 2, mb: 1, minHeight: 48 }}
        >
          {loading ? 'Signing in...' : 'Sign in with Google'}
        </Button>
        <Button
          fullWidth
          variant="text"
          size="large"
          disabled={loading}
          onClick={() => navigate(from)}
          sx={{ mb: 2, minHeight: 48, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
        >
          Continue as guest
        </Button>
      </Paper>
    </Box>
  )
}
