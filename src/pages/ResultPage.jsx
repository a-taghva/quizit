import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  Typography,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import { supabase } from '../lib/supabase'
import { useState, useCallback } from 'react'

export function ResultPage() {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const result = useLocation().state
  const [favoriteIds, setFavoriteIds] = useState(result?.favoriteIds ?? {})

  const toggleFavorite = useCallback(
    async (questionId) => {
      const isFav = favoriteIds[questionId]
      if (isFav) {
        await supabase.from('favorites').delete().eq('question_id', questionId)
        setFavoriteIds((prev) => {
          const next = { ...prev }
          delete next[questionId]
          return next
        })
      } else {
        await supabase.from('favorites').insert({ question_id: questionId, topic_id: topicId })
        setFavoriteIds((prev) => ({ ...prev, [questionId]: true }))
      }
    },
    [favoriteIds, topicId]
  )

  if (!result) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No result data. Start a quiz first.</Typography>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>
          Go home
        </Button>
      </Box>
    )
  }

  const { totalAnswered, mistakes } = result
  const totalCorrect = totalAnswered - mistakes.length
  const percentage = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        pb: { xs: 5, sm: 4 },
        maxWidth: 640,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        sx={{
          width: { xs: 140, sm: 160 },
          height: { xs: 140, sm: 160 },
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `conic-gradient(#0f172a ${percentage}%, #e2e8f0 ${percentage}%)`,
          position: 'relative',
          mb: { xs: 3, sm: 4 },
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: { xs: 112, sm: 130 },
            height: { xs: 112, sm: 130 },
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          position: 'absolute',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant="h4" component="span" fontWeight="bold">
            {percentage}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {totalCorrect}/{totalAnswered}
          </Typography>
        </Box>
      </Box>

      <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ mb: 3, minHeight: 48 }}>
        Go home
      </Button>

      <Typography variant="h6" sx={{ mb: 2, alignSelf: 'stretch' }}>
        Mistakes
      </Typography>

      {mistakes.length === 0 ? (
        <Typography color="text.secondary" sx={{ alignSelf: 'stretch' }}>No mistakes.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {mistakes.map((m, i) => (
            <Card key={m.question_id ?? i} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {m.question}
                  </Typography>
                  <IconButton
                    onClick={() => toggleFavorite(m.question_id)}
                    color={favoriteIds[m.question_id] ? 'error' : 'default'}
                    size="small"
                    sx={{ m: -0.5 }}
                  >
                    {favoriteIds[m.question_id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'error.main' }}>
                    Your answer: {m.user_answer}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    Correct: {m.correct_answer}
                  </Typography>
                </Box>
                {m.explanation && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {m.explanation}
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  )
}
