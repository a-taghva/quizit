import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BookPage } from './pages/BookPage'
import { LoginPage } from './pages/LoginPage'
import { FavoritesQuizPage } from './pages/FavoritesQuizPage'
import { MistakesQuizPage } from './pages/MistakesQuizPage'
import { QuizPage } from './pages/QuizPage'
import { SignupPage } from './pages/SignupPage'

const theme = createTheme()

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/" element={<BookPage />} />
              <Route path="/favorites" element={<FavoritesQuizPage />} />
              <Route path="/mistakes" element={<MistakesQuizPage />} />
              <Route path="/:topicId/quiz" element={<QuizPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </ThemeProvider>
  )
}
