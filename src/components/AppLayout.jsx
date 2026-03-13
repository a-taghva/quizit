import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMistakes } from '../contexts/MistakesContext'
import { supabase } from '../lib/supabase'

export function AppLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const { mistakesCount, refreshMistakesCount } = useMistakes()
  const [menuAnchor, setMenuAnchor] = useState(null)
  const isMainPage = location.pathname === '/'
  const isQuizOrResult = /\/quiz$|\/result$/.test(location.pathname)
  const showBack = location.pathname !== '/' && !isQuizOrResult

  async function handleSignOut() {
    setMenuAnchor(null)
    await supabase.auth.signOut()
    navigate('/login')
  }

  async function handleResetMistakes() {
    setMenuAnchor(null)
    if (!user?.id) return
    await supabase.from('mistakes').delete().eq('user_id', user.id)
    refreshMistakesCount()
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 'env(safe-area-inset-bottom)', bgcolor: 'background.default' }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'primary.main', pt: 'env(safe-area-inset-top)' }}>
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          {showBack && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => navigate(-1)}
              sx={{ mr: 1, p: 1.25 }}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              position: 'absolute',
              left: 48,
              right: 48,
              textAlign: 'center',
              cursor: 'pointer',
            }}
          >
            Plumber Exam
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {isMainPage ? (
            <>
              <IconButton
                color="inherit"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label="menu"
                sx={{ p: 1.25 }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={!!menuAnchor}
                onClose={() => setMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem
                  onClick={handleResetMistakes}
                  disabled={mistakesCount === 0}
                  sx={{ color: mistakesCount > 0 ? 'error.main' : 'text.disabled' }}
                >
                  Reset mistakes
                </MenuItem>
                <MenuItem onClick={handleSignOut}>Sign out</MenuItem>
              </Menu>
            </>
          ) : null}
        </Toolbar>
      </AppBar>
      <Outlet />
    </Box>
  )
}
