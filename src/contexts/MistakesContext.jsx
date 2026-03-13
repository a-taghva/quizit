import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

const MistakesContext = createContext(null)

export function MistakesProvider({ children }) {
  const [mistakesCount, setMistakesCount] = useState(0)

  const refreshMistakesCount = useCallback(() => {
    supabase.from('mistakes').select('*', { count: 'exact', head: true }).then(({ count }) => {
      setMistakesCount(count ?? 0)
    })
  }, [])

  useEffect(() => {
    refreshMistakesCount()
  }, [])

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
