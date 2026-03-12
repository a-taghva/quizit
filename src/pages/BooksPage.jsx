import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, CardActionArea, CardContent, Typography, CircularProgress } from '@mui/material'
import { supabase } from '../lib/supabase'

let booksCache = null

export function BooksPage() {
  const [loading, setLoading] = useState(!booksCache)
  const navigate = useNavigate()
  const books = booksCache ?? []

  useEffect(() => {
    if (booksCache) return

    async function fetchBooks() {
      const { data, error } = await supabase
        .from('books')
        .select('id, total_questions, title')

      if (!error) {
        booksCache = data
      }
      setLoading(false)
    }

    fetchBooks()
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
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
      }}
    >
      {books.map((book) => (
        <Card key={book.id} sx={{ width: '100%', maxWidth: 600 }}>
          <CardActionArea onClick={() => navigate(`/book/${book.id}/topics`)}>
            <CardContent>
              <Typography variant="h6" component="h2">
                {book.title}
              </Typography>
              <Typography color="text.secondary">
                {book.total_questions} questions
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </Box>
  )
}
