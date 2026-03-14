import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const MistakesContext = createContext(null)

export function MistakesProvider({ children }) {
  const { user } = useAuth()
  const [mistakesCount, setMistakesCount] = useState(0)

  const refreshMistakesCount = useCallback(() => {
    if (!user) return
    supabase.from('mistakes').select('*', { count: 'exact', head: true }).then(({ count }) => {
      setMistakesCount(count ?? 0)
    })
  }, [user])

  useEffect(() => {
    if (user) {
      refreshMistakesCount()
    } else {
      setMistakesCount(0)
    }
  }, [user, refreshMistakesCount])

  const value = useMemo(
    () => ({ mistakesCount, refreshMistakesCount }),
    [mistakesCount, refreshMistakesCount]
  )

  return <MistakesContext.Provider value={value}>{children}</MistakesContext.Provider>
}

export function useMistakes() {
  const context = useContext(MistakesContext)
  if (!context) {
    throw new Error('useMistakes must be used within a MistakesProvider')
  }
  return context
}
