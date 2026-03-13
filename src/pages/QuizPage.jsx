import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import FlagIcon from '@mui/icons-material/Flag'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { useAuth } from '../contexts/AuthContext'
import { useMistakes } from '../contexts/MistakesContext'
import { supabase } from '../lib/supabase'
import { ReportQuestionModal } from '../components/ReportQuestionModal'

export function QuizPage() {
  const { user } = useAuth()
  const { refreshMistakesCount } = useMistakes()
  const { topicId } = useParams()
  const navigate = useNavigate()
  const navRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState([])
  const [favoriteIds, setFavoriteIds] = useState({})
  const [statusIndex, setStatusIndex] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionMistakes, setSessionMistakes] = useState({})
  const [sessionAnswered, setSessionAnswered] = useState({})
  const [reportModalOpen, setReportModalOpen] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      const [questionsRes, favoritesRes, statusRes] = await Promise.all([
        supabase.from('questions').select('id, question, options, explanation, answer').eq('topic_id', topicId),
        supabase.from('favorites').select('question_id').eq('topic_id', topicId),
        user?.id
          ? supabase.from('status').select('question_index').eq('topic_id', topicId).maybeSingle()
          : Promise.resolve({ data: null, error: null }),
      ])

      if (!questionsRes.error) {
        const q = questionsRes.data ?? []
        setQuestions(q)

        const fav = {}
        ;(favoritesRes.data ?? []).forEach((r) => { fav[r.question_id] = true })
        setFavoriteIds(fav)

        const statusRow = statusRes.data
        setStatusIndex(statusRow ? statusRow.question_index : null)
        setCurrentIndex(statusRow?.question_index ?? 0)
      }
      setLoading(false)
    }
    fetchAll()
  }, [topicId, user?.id])

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

  const handleBookmark = async () => {
    const alreadyBookmarked = statusIndex === currentIndex
    if (alreadyBookmarked) {
      setStatusIndex(null)
      await supabase.from('status').delete().eq('topic_id', topicId)
    } else {
      setStatusIndex(currentIndex)
      await supabase.from('status').upsert(
        { user_id: user.id, topic_id: topicId, question_index: currentIndex },
        { onConflict: 'user_id,topic_id' }
      )
    }
  }

  const isBookmarked = statusIndex === currentIndex

  const handleReport = async ({ question_id, description }) => {
    await supabase.from('reports').insert({ question_id, description })
  }

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
      await supabase.from('favorites').insert({ question_id: q.id, topic_id: topicId })
      setFavoriteIds((prev) => ({ ...prev, [q.id]: true }))
    }
  }

  const handleOptionClick = async (optionText) => {
    const q = questions[currentIndex]
    if (!q || allAnswered[currentIndex]) return

    const correct = q.answer === optionText
    const payload = { user_answer: optionText, correct_answer: q.answer }
    setSessionAnswered((prev) => ({ ...prev, [currentIndex]: payload }))

    setStatusIndex(currentIndex)
    await supabase.from('status').upsert(
      { user_id: user.id, topic_id: topicId, question_index: currentIndex },
      { onConflict: 'user_id,topic_id' }
    )

    if (!correct) {
      setSessionMistakes((prev) => ({
        ...prev,
        [currentIndex]: {
          question_id: q.id,
          question: q.question,
          user_answer: optionText,
          correct_answer: q.answer,
          explanation: q.explanation,
        },
      }))
      await supabase.from('mistakes').insert({ question_id: q.id, topic_id: topicId })
      refreshMistakesCount()
    }
  }

  const answered = allAnswered[currentIndex]
  const handleExitQuiz = () => {
    const mistakesList = Object.values(sessionMistakes)
    navigate(`/${topicId}/result`, {
      replace: true,
      state: {
        totalAnswered: Object.keys(sessionAnswered).length,
        mistakes: mistakesList,
        favoriteIds: { ...favoriteIds },
      },
    })
  }
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
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        pb: { xs: 5, sm: 4 },
        maxWidth: 640,
        mx: 'auto',
      }}
    >
      <Box
        ref={navRef}
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          pb: 2,
          mx: -1,
          px: 1,
          '&::-webkit-scrollbar': { height: 6 },
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {questions.map((_, i) => (
          <Box
            key={i}
            data-index={i}
            onClick={() => setCurrentIndex(i)}
            sx={{
              flexShrink: 0,
              width: 44,
              height: 44,
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

      <Card sx={{ mb: 2, overflow: 'hidden' }}>
        <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Question {currentIndex + 1} of {questions.length}
            </Typography>
            <Box>
              <IconButton onClick={handleBookmark} color={isBookmarked ? 'primary' : 'default'}>
                {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              </IconButton>
              <IconButton onClick={() => setReportModalOpen(true)} color="default" aria-label="Report question">
                <FlagIcon />
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
                    minHeight: 52,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: isWrong ? 'rgba(254, 202, 202)' : isCorrect ? 'rgba(167, 243, 208)' : undefined,
                    borderColor: isWrong ? 'error.light' : isCorrect ? 'success.light' : undefined,
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

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
          pt: 1,
        }}
      >
        <Button variant="outlined" onClick={handleExitQuiz} sx={{ minHeight: 44 }}>
          Exit quiz
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
      <ReportQuestionModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        questionId={currentQuestion?.id}
        onReport={handleReport}
      />
    </Box>
  )
}
