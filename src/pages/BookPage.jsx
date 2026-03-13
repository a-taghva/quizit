import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import { supabase } from '../lib/supabase'
import { useMistakes } from '../contexts/MistakesContext'

export function BookPage() {
  const navigate = useNavigate()
  const { mistakesCount } = useMistakes()
  const [topics, setTopics] = useState([])
  const [statusByTopic, setStatusByTopic] = useState({})
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [topicsRes, statusRes, favoritesRes] = await Promise.all([
        supabase.from('topics').select('id, title, total_questions').order('id'),
        supabase.from('status').select('topic_id, question_index'),
        supabase.from('favorites').select('*', { count: 'exact', head: true }),
      ])

      if (!topicsRes.error) {
        setTopics(topicsRes.data ?? [])
      }
      if (!statusRes.error) {
        const map = {}
        ;(statusRes.data ?? []).forEach((r) => { map[r.topic_id] = r.question_index })
        setStatusByTopic(map)
      }
      if (!favoritesRes.error) {
        setFavoritesCount(favoritesRes.count ?? 0)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        px: { xs: 2, sm: 3 },
        pb: { xs: 4, sm: 5 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 2, sm: 3 },
        maxWidth: 600,
        mx: 'auto',
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: { xs: 'column', sm: 'row' } }}>
        <Card sx={{ flex: 1, minHeight: 88 }}>
          <CardActionArea onClick={() => navigate('/favorites')} sx={{ height: '100%', minHeight: 88 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" component="h2">
                Favorites
              </Typography>
              <Typography color="text.secondary">{favoritesCount}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
        <Card sx={{ flex: 1, minHeight: 88 }}>
          <CardActionArea onClick={() => navigate('/mistakes')} sx={{ height: '100%', minHeight: 88 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" component="h2">
                Mistakes
              </Typography>
              <Typography color="text.secondary">{mistakesCount}</Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>
      {topics.map((topic) => {
        const answered = statusByTopic[topic.id] ?? 0
        const total = topic.total_questions || 1
        const progress = Math.min(100, (answered / total) * 100)
        return (
          <Card key={topic.id} sx={{ width: '100%' }}>
            <CardActionArea onClick={() => navigate(`/${topic.id}/quiz`)} sx={{ minHeight: 96 }}>
              <CardContent sx={{ py: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="h6" component="h2">
                  {topic.title}
                </Typography>
                <Typography color="text.secondary">
                  {topic.total_questions} questions
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
              </CardContent>
            </CardActionArea>
          </Card>
        )
      })}
    </Box>
  )
}
