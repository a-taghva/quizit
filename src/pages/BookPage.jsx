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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [topicsRes, statusRes] = await Promise.all([
        supabase.from('topics').select('id, title, total_questions').eq('book_id', bookId).order('id'),
        supabase.from('status').select('topic_id, question_index').eq('book_id', bookId),
      ])

      if (!topicsRes.error) {
        setTopics(topicsRes.data ?? [])
      }
      if (!statusRes.error) {
        const map = {}
        ;(statusRes.data ?? []).forEach((r) => { map[r.topic_id] = r.question_index })
        setStatusByTopic(map)
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
