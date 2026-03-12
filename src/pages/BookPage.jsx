import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CircularProgress,
} from '@mui/material'
import { supabase } from '../lib/supabase'

export function BookPage() {
  const { bookId } = useParams()
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTopics() {
      const { data, error } = await supabase
        .from('topics')
        .select('id, title, total_questions')
        .eq('book_id', bookId)
        .order('id')

      if (!error) {
        setTopics(data ?? [])
      }
      setLoading(false)
    }

    fetchTopics()
  })

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
      {topics.map((topic) => (
        <Card key={topic.id} sx={{ width: '100%', maxWidth: 600 }}>
          <CardActionArea onClick={() => navigate(`/book/${bookId}/topic/${topic.id}`)}>
          <CardContent>
            <Typography variant="h6" component="h2">
              {topic.title}
            </Typography>
            <Typography color="text.secondary">
              {topic.total_questions} questions
            </Typography>
          </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  )
}
