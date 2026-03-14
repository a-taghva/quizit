import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'

const MESSAGES = {
  'all-questions': 'You need to sign in & subscribe to access to all questions',
  features: 'To unlock these features you need to sign in',
  progress: 'Your progress will be lost unless you sign in',
}

export function SignInPromptModal({ open, onClose, onOk, variant = 'features' }) {
  const navigate = useNavigate()
  const message = MESSAGES[variant] ?? MESSAGES.features

  const handleSignIn = () => {
    onClose()
    navigate('/login')
  }

  const handleOk = () => {
    onOk?.()
    onClose()
  }

  const isProgress = variant === 'progress'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isProgress ? '' : 'Sign in required'}</DialogTitle>
      <DialogContent>
        {message}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={isProgress ? handleOk : onClose}>{isProgress ? 'OK' : 'Cancel'}</Button>
        <Button variant="contained" onClick={handleSignIn}>
          Sign in
        </Button>
      </DialogActions>
    </Dialog>
  )
}
