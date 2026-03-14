import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  CircularProgress,
  LinearProgress,
} from '@mui/material'
import LockIcon from '@mui/icons-material/Lock'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useMistakes } from '../contexts/MistakesContext'
import { SignInPromptModal } from '../components/SignInPromptModal'

const PROGRESS_MODAL_KEY = 'guestProgressModalSeen'

export function BookPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { mistakesCount } = useMistakes()
  const [topics, setTopics] = useState([])
  const [statusByTopic, setStatusByTopic] = useState({})
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalVariant, setModalVariant] = useState(null)
  const [progressModalOpen, setProgressModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      if (user) {
        const [topicsRes, statusRes, favoritesRes] = await Promise.all([
          supabase.from('topics').select('id, title, total_questions').order('id'),
          supabase.from('status').select('topic_id, question_index'),
          supabase.from('favorites').select('*', { count: 'exact', head: true }),
        ])
        if (!topicsRes.error) setTopics(topicsRes.data ?? [])
        if (!statusRes.error) {
          const map = {}
          ;(statusRes.data ?? []).forEach((r) => { map[r.topic_id] = r.question_index })
          setStatusByTopic(map)
        }
        if (!favoritesRes.error) setFavoritesCount(favoritesRes.count ?? 0)
      } else {
        const topicsRes = await supabase.from('topics').select('id, title, total_questions').order('id')
        if (!topicsRes.error) setTopics(topicsRes.data ?? [])
      }
      setLoading(false)
    }
    fetchData()
  }, [user])

  useEffect(() => {
    if (!user) {
      const prompt = location.state?.prompt
      if (prompt === 'favorites' || prompt === 'mistakes') {
        setModalVariant('features')
      }
    }
  }, [user, location.state?.prompt])

  useEffect(() => {
    if (!user && !loading && !sessionStorage.getItem(PROGRESS_MODAL_KEY) && !location.state?.prompt) {
      setProgressModalOpen(true)
    }
  }, [user, loading, location.state?.prompt])

  const handleFavoritesClick = () => {
    if (user) {
      navigate('/favorites')
    } else {
      setModalVariant('features')
    }
  }

  const handleMistakesClick = () => {
    if (user) {
      navigate('/mistakes')
    } else {
      setModalVariant('features')
    }
  }

  const handleProgressModalOk = () => {
    sessionStorage.setItem(PROGRESS_MODAL_KEY, '1')
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
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
      <Box sx={{ display: 'flex', gap: 2, width: '100%', flexDirection: 'row' }}>
        <Card sx={{ flex: 1, minHeight: 88 }}>
          <CardActionArea onClick={handleFavoritesClick} sx={{ height: '100%', minHeight: 88 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" component="h2">
                Favorites
              </Typography>
              {user ? (
                <Typography color="text.secondary">{favoritesCount}</Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography color="text.secondary">Disabled</Typography>
                </Box>
              )}
            </CardContent>
          </CardActionArea>
        </Card>
        <Card sx={{ flex: 1, minHeight: 88 }}>
          <CardActionArea onClick={handleMistakesClick} sx={{ height: '100%', minHeight: 88 }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" component="h2">
                Mistakes
              </Typography>
              {user ? (
                <Typography color="text.secondary">{mistakesCount}</Typography>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography color="text.secondary">Disabled</Typography>
                </Box>
              )}
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
            <CardActionArea
              onClick={() => navigate(`/${topic.id}/quiz`, { state: { totalQuestions: topic.total_questions } })}
              sx={{ minHeight: 96 }}
            >
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
      <SignInPromptModal
        open={progressModalOpen}
        onClose={() => setProgressModalOpen(false)}
        onOk={handleProgressModalOk}
        variant="progress"
      />
      {modalVariant && (
        <SignInPromptModal
          open={!!modalVariant}
          onClose={() => setModalVariant(null)}
          variant={modalVariant}
        />
      )}
    </Box>
  )
}
