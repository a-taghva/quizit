import { useLocation, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material'
import LogoutIcon from '@mui/icons-material/Logout'
import { Outlet } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AppLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isQuizOrResult = /\/quiz$|\/result$/.test(location.pathname)
  const showBack = location.pathname !== '/' && !isQuizOrResult

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {showBack && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => navigate(-1)}
              sx={{ mr: 1 }}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} />
          <IconButton color="inherit" onClick={handleSignOut} aria-label="sign out">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  )
}
