import { useEffect, useCallback, useState } from 'react'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function useAutoSave(
  content: string | null,
  saveFunction: (content: string) => Promise<void>,
  debounceMs: number = 3000
) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | undefined>()

  const save = useCallback(async (contentToSave: string) => {
    if (!contentToSave) return

    setSaveStatus('saving')

    try {
      await saveFunction(contentToSave)
      setSaveStatus('saved')
      setLastSaved(new Date())
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('Auto-save error:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [saveFunction])

  useEffect(() => {
    if (!content) return

    const timer = setTimeout(() => {
      save(content)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [content, save, debounceMs])

  return {
    saveStatus,
    lastSaved,
    manualSave: save,
  }
}
