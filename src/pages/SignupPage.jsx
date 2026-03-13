import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
} from '@mui/material'
import { supabase } from '../lib/supabase'

export function SignupPage() {
  const [email, setEmail] = useState('')
  const [confirmEmail, setConfirmEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (email !== confirmEmail) {
      setError('Email addresses do not match')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Failed to sign up')
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
          Sign up
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Confirm email address"
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            required
            margin="normal"
            error={confirmEmail !== '' && email !== confirmEmail}
            helperText={
              confirmEmail !== '' && email !== confirmEmail
                ? 'Email addresses do not match'
                : ''
            }
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            margin="normal"
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{ mt: 3, mb: 2, minHeight: 48 }}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <Typography align="center">
          Already have an account? <Link to="/login">Log in</Link>
        </Typography>
      </Paper>
    </Box>
  )
}
