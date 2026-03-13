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
        p: 2,
        maxWidth: 800,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)',
      }}
    >
      <Box
        sx={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `conic-gradient(#4caf50 ${percentage}%, #e0e0e0 ${percentage}%)`,
          position: 'relative',
          mb: 4,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 130,
            height: 130,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            boxShadow: 2,
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

      <Typography variant="h6" sx={{ mb: 2, alignSelf: 'stretch' }}>
        Mistakes
      </Typography>

      {mistakes.length === 0 ? (
        <Typography color="text.secondary" sx={{ alignSelf: 'stretch' }}>No mistakes.</Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
          {mistakes.map((m, i) => (
            <Card key={m.question_id ?? i}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Typography variant="body1" sx={{ flex: 1 }}>
                    {m.question}
                  </Typography>
                  <IconButton
                    onClick={() => toggleFavorite(m.question_id)}
                    color={favoriteIds[m.question_id] ? 'error' : 'default'}
                    size="small"
                  >
                    {favoriteIds[m.question_id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Box>
                <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 195, 185)' }}>
                    Your answer: {m.user_answer}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(180, 225, 190)' }}>
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

      <Button variant="contained" size="large" onClick={() => navigate('/')} sx={{ mt: 4 }}>
        Go home
      </Button>
    </Box>
  )
}
