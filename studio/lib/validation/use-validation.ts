import { useState, useCallback } from 'react'
import { z } from 'zod'

export function useValidation<T extends z.ZodType>(schema: T) {
  const [error, setError] = useState<string | null>(null)

  const validate = useCallback(
    (data: unknown): data is z.infer<T> => {
      try {
        schema.parse(data)
        setError(null)
        return true
      } catch (err) {
        if (err instanceof z.ZodError) {
          const zodError = err as z.ZodError<unknown>
          setError(zodError.errors[0]?.message || 'Validation failed')
        } else {
          setError('Validation failed')
        }
        return false
      }
    },
    [schema]
  )

  const clearError = useCallback(() => setError(null), [])

  return { validate, error, clearError }
}
