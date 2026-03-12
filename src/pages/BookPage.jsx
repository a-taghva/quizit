import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

export function BookPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [statusByTopic, setStatusByTopic] = useState({})
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [mistakesCount, setMistakesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [topicsRes, statusRes, favoritesRes, mistakesRes] = await Promise.all([
        supabase.from('topics').select('id, title, total_questions').eq('book_id', bookId).order('id'),
        supabase.from('status').select('topic_id, question_index').eq('book_id', bookId),
        supabase.from('favorites').select('*', { count: 'exact', head: true }).eq('book_id', bookId),
        supabase.from('mistakes').select('*', { count: 'exact', head: true }).eq('book_id', bookId),
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
      if (!mistakesRes.error) {
        setMistakesCount(mistakesRes.count ?? 0)
      }
      setLoading(false)
    }

    fetchData()
  }, [bookId])

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
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      <Box sx={{ display: 'flex', gap: 3, width: '100%', maxWidth: 600, justifyContent: 'space-between' }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" component="h2">
              Favorites
            </Typography>
            <Typography color="text.secondary">{favoritesCount}</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" component="h2">
              Mistakes
            </Typography>
            <Typography color="text.secondary">{mistakesCount}</Typography>
          </CardContent>
        </Card>
      </Box>
      {topics.map((topic) => {
        const answered = statusByTopic[topic.id] ?? 0
        const total = topic.total_questions || 1
        const progress = Math.min(100, (answered / total) * 100)
        return (
          <Card key={topic.id} sx={{ width: '100%', maxWidth: 600 }}>
            <CardActionArea onClick={() => navigate(`/book/${bookId}/topic/${topic.id}`)}>
              <CardContent>
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
