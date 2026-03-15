import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'

const MESSAGES = {
  'all-questions-guest': 'You need to sign in & subscribe to access all questions.',
  'all-questions-subscribe': 'You need to subscribe to access all questions.',
  features: 'To unlock these features you need to sign in.',
  progress: 'Your progress will be lost unless you sign in.',
}

export function SignInPromptModal({
  open,
  onClose,
  onOk,
  variant = 'features',
  primaryLabel,
  primaryPath,
}) {
  const navigate = useNavigate()
  const message = MESSAGES[variant] ?? MESSAGES.features

  const handlePrimary = () => {
    onClose()
    if (primaryPath) {
      navigate(primaryPath)
    } else {
      navigate('/login')
    }
  }

  const handleOk = () => {
    onOk?.()
    onClose()
  }

  const isProgress = variant === 'progress'
  const effectivePrimaryLabel = primaryLabel ?? 'Sign in'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isProgress ? '' : 'Sign in required'}</DialogTitle>
      <DialogContent>
        {message}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={isProgress ? handleOk : onClose}>{isProgress ? 'OK' : 'Cancel'}</Button>
        <Button variant="contained" onClick={handlePrimary}>
          {effectivePrimaryLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
