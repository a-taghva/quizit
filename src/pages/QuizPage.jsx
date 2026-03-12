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
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

export function QuizPage() {
  const { user } = useAuth()
  const { bookId, topicId } = useParams()
  const navRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [favoriteIds, setFavoriteIds] = useState({})
  const [mistakes, setMistakes] = useState({})
  const [statusIndex, setStatusIndex] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionMistakes, setSessionMistakes] = useState({})
  const [sessionAnswered, setSessionAnswered] = useState({})

  useEffect(() => {
    async function fetchAll() {
      const [questionsRes, favoritesRes, mistakesRes, statusRes] = await Promise.all([
        supabase.from('questions').select('id, question, options, explanation, answer').eq('topic_id', topicId),
        supabase.from('favorites').select('question_id').eq('topic_id', topicId),
        supabase.from('mistakes').select('question_index, user_answer, correct_answer').eq('topic_id', topicId),
        user?.id
          ? supabase.from('status').select('question_index').eq('user_id', user.id).eq('topic_id', topicId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])

      if (!questionsRes.error) {
        const q = questionsRes.data ?? []
        setQuestions(q)

        const fav = {}
        ;(favoritesRes.data ?? []).forEach((r) => { fav[r.question_id] = true })
        setFavoriteIds(fav)

        const m = {}
        ;(mistakesRes.data ?? []).forEach((r) => {
          m[r.question_index] = { user_answer: r.user_answer, correct_answer: r.correct_answer }
        })
        setMistakes(m)

        const idx = statusRes.data?.question_index ?? 0
        setStatusIndex(idx)
        setCurrentIndex(idx)
      }
      setLoading(false)
    }
    fetchAll()
  }, [topicId, user?.id])

  const combinedMistakes = { ...mistakes, ...sessionMistakes }
  const allAnswered = { ...combinedMistakes, ...sessionAnswered }

  const scrollToActive = (index) => {
    if (!navRef.current) return
    const el = navRef.current.querySelector(`[data-index="${index}"]`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }

  useEffect(() => {
    scrollToActive(currentIndex)
  }, [currentIndex])

  const handleBookmark = async () => {
    if (!user?.id) return
    setStatusIndex(currentIndex)
    await supabase.from('status').upsert(
      { user_id: user.id, topic_id: topicId, question_index: currentIndex },
      { onConflict: 'user_id,topic_id' }
    )
  }

  const isBookmarked = statusIndex === currentIndex

  const toggleFavorite = async () => {
    const q = questions[currentIndex]
    if (!q) return
    const isFav = favoriteIds[q.id]
    if (isFav) {
      await supabase.from('favorites').delete().eq('question_id', q.id).eq('topic_id', topicId)
      setFavoriteIds((prev) => {
        const next = { ...prev }
        delete next[q.id]
        return next
      })
    } else {
      await supabase.from('favorites').insert({ question_id: q.id, topic_id: topicId, book_id: bookId })
      setFavoriteIds((prev) => ({ ...prev, [q.id]: true }))
    }
  }

  const handleOptionClick = async (optionText) => {
    const q = questions[currentIndex]
    if (!q || allAnswered[currentIndex]) return

    const correct = q.answer === optionText
    const payload = { user_answer: optionText, correct_answer: q.answer }
    setSessionAnswered((prev) => ({ ...prev, [currentIndex]: payload }))

    if (!correct) {
      setSessionMistakes((prev) => ({ ...prev, [currentIndex]: payload }))
      await supabase.from('mistakes').insert({
        question_index: currentIndex,
        question_id: q.id,
        user_answer: optionText,
        correct_answer: q.answer,
        topic_id: topicId,
        book_id: bookId,
      })
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
        <Typography>No questions found.</Typography>
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
              bgcolor: i === currentIndex ? 'primary.main' : combinedMistakes[i] ? 'error.light' : allAnswered[i] ? 'success.light' : 'action.hover',
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
            <Box>
              <IconButton onClick={handleBookmark} color={isBookmarked ? 'primary' : 'default'}>
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton onClick={toggleFavorite} color={isFavorite ? 'error' : 'default'}>
                {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>
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
                    bgcolor: isWrong ? 'error.light' : isCorrect ? 'success.light' : undefined,
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
