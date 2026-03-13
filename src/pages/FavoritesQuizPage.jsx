import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  IconButton,
} from '@mui/material'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { supabase } from '../lib/supabase'

export function FavoritesQuizPage() {
  const { bookId } = useParams()
  const navRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [favoriteIds, setFavoriteIds] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionMistakes, setSessionMistakes] = useState({})
  const [sessionAnswered, setSessionAnswered] = useState({})

  useEffect(() => {
    async function fetchAll() {
      const { data, error } = await supabase
        .from('favorites')
        .select('question_id, questions(id, question, options, answer, explanation, topic_id)')
        .eq('book_id', bookId)

      if (!error) {
        const seen = new Set()
        const qList = []
        ;(data ?? []).forEach((r) => {
          const q = r.questions
          if (q && !seen.has(q.id)) {
            seen.add(q.id)
            qList.push({ id: q.id, topic_id: q.topic_id, question: q.question, options: q.options, answer: q.answer, explanation: q.explanation })
          }
        })
        const fav = {}
        qList.forEach((q) => { fav[q.id] = true })
        setFavoriteIds(fav)
        setQuestions(qList)
      }
      setCurrentIndex(0)
      setLoading(false)
    }
    fetchAll()
  }, [bookId])

  const combinedMistakes = { ...sessionMistakes }
  const allAnswered = { ...combinedMistakes, ...sessionAnswered }

  const scrollToActive = (index) => {
    if (!navRef.current) return
    const el = navRef.current.querySelector(`[data-index="${index}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  useEffect(() => {
    scrollToActive(currentIndex)
  }, [currentIndex])

  const toggleFavorite = async () => {
    const q = questions[currentIndex]
    if (!q) return
    const isFav = favoriteIds[q.id]
    if (isFav) {
      await supabase.from('favorites').delete().eq('question_id', q.id).eq('book_id', bookId)
      setFavoriteIds((prev) => { const next = { ...prev }; delete next[q.id]; return next })
    } else {
      if (q.topic_id) {
        await supabase.from('favorites').insert({ question_id: q.id, topic_id: q.topic_id, book_id: bookId })
        setFavoriteIds((prev) => ({ ...prev, [q.id]: true }))
      }
    }
  }

  const handleOptionClick = (optionText) => {
    const q = questions[currentIndex]
    if (!q || allAnswered[currentIndex]) return

    const correct = q.answer === optionText
    const payload = { user_answer: optionText, correct_answer: q.answer }
    setSessionAnswered((prev) => ({ ...prev, [currentIndex]: payload }))

    if (!correct) {
      setSessionMistakes((prev) => ({ ...prev, [currentIndex]: payload }))
    }
  }

  const answered = allAnswered[currentIndex]
  const currentQuestion = questions[currentIndex]
  const isFavorite = currentQuestion && favoriteIds[currentQuestion.id]

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (questions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No favorite questions.</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 2, maxWidth: 800, mx: 'auto' }}>
      <Box
        ref={navRef}
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 2,
          '&::-webkit-scrollbar': { height: 6 },
        }}
      >
        {questions.map((_, i) => (
          <Box
            key={i}
            data-index={i}
            onClick={() => setCurrentIndex(i)}
            sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: i === currentIndex ? 'primary.main' : combinedMistakes[i] ? 'rgba(255, 195, 185)' : allAnswered[i] ? 'rgba(180, 225, 190)' : 'action.hover',
              color: i === currentIndex ? 'primary.contrastText' : 'text.primary',
              cursor: 'pointer',
              border: i === currentIndex ? 2 : 0,
              borderColor: 'primary.dark',
            }}
          >
            {i + 1}
          </Box>
        ))}
      </Box>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Question {currentIndex + 1} of {questions.length}
            </Typography>
            <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            {currentQuestion?.question}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(currentQuestion?.options ?? []).map((opt) => {
              const isWrong = answered && answered.user_answer === opt && answered.user_answer !== answered.correct_answer
              const isCorrect = answered && opt === answered.correct_answer
              return (
                <Button
                  key={opt}
                  variant="outlined"
                  onClick={() => handleOptionClick(opt)}
                  disabled={!!answered}
                  sx={{
                    justifyContent: 'flex-start',
                    textTransform: 'none',
                    bgcolor: isWrong ? 'rgba(255, 195, 185)' : isCorrect ? 'rgba(180, 225, 190)' : undefined,
                  }}
                >
                  {opt}
                </Button>
              )
            })}
          </Box>

          {answered && currentQuestion?.explanation && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {currentQuestion.explanation}
            </Typography>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<NavigateBeforeIcon />}
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          endIcon={<NavigateNextIcon />}
          onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </Button>
      </Box>
    </Box>
  )
}
