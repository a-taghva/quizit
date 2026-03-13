import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'

export function ReportQuestionModal({ open, onClose, questionId, onReport }) {
  const [description, setDescription] = useState('')

  const handleClose = () => {
    setDescription('')
    onClose()
  }

  const handleOk = async () => {
    if (!description.trim()) return
    await onReport({ question_id: questionId, description: description.trim() })
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Report Question</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          multiline
          rows={4}
          placeholder="Write your report..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          variant="outlined"
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" onClick={handleOk} disabled={!description.trim()}>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}
