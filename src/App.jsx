import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BookPage } from './pages/BookPage'
import { LoginPage } from './pages/LoginPage'
import { FavoritesQuizPage } from './pages/FavoritesQuizPage'
import { MistakesQuizPage } from './pages/MistakesQuizPage'
import { QuizPage } from './pages/QuizPage'
import { ResultPage } from './pages/ResultPage'
import { SignupPage } from './pages/SignupPage'

const theme = createTheme({
  palette: {
    primary: { main: '#0f172a' },
    background: { default: '#f8fafc', paper: '#ffffff' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
    htmlFontSize: 14,
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: 12, minHeight: 48 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
      },
    },
  },
})

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
              <Route path="/:topicId/result" element={<ResultPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
    </ThemeProvider>
  )
}
