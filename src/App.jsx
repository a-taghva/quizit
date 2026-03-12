import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BooksPage } from './pages/BooksPage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'

const theme = createTheme()

function BookPage() {
  return null
}

function TopicsPage() {
  return null
}

function TopicPage() {
  return null
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
              <Route path="/books" element={<BooksPage />} />
              <Route path="/book/:bookId" element={<BookPage />} />
              <Route path="/book/:bookId/topics" element={<TopicsPage />} />
              <Route path="/book/:bookId/topics/:topicId" element={<TopicPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/books" replace />} />
            <Route path="*" element={<Navigate to="/books" replace />} />
          </Routes>
        </BrowserRouter>
    </ThemeProvider>
  )
}
