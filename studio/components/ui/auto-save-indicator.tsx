'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveIndicatorProps {
    status: SaveStatus
    lastSaved?: Date
    className?: string
}

export function AutoSaveIndicator({
    status,
    lastSaved,
    className
}: AutoSaveIndicatorProps) {
    const formatTime = (date: Date) => {
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const seconds = Math.floor(diff / 1000)
        const minutes = Math.floor(seconds / 60)

        if (seconds < 5) return 'Just now'
        if (seconds < 60) return `${seconds}s ago`
        if (minutes < 60) return `${minutes}m ago`
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className={cn("flex items-center gap-2 text-sm", className)}>
            <AnimatePresence mode="wait">
                {status === 'saving' && (
                    <motion.div
                        key="saving"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-muted-foreground"
                    >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Saving...</span>
                    </motion.div>
                )}

                {status === 'saved' && (
                    <motion.div
                        key="saved"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-primary"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring" as const, stiffness: 500, damping: 30 }}
                        >
                            <Check className="h-4 w-4" />
                        </motion.div>
                        <span>Saved {lastSaved && formatTime(lastSaved)}</span>
                    </motion.div>
                )}

                {status === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2 text-destructive"
                    >
                        <CloudOff className="h-4 w-4" />
                        <span>Save failed</span>
                    </motion.div>
                )}

                {status === 'idle' && lastSaved && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 text-muted-foreground"
                    >
                        <Cloud className="h-4 w-4" />
                        <span>Saved {formatTime(lastSaved)}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Hook for managing auto-save
export function useAutoSave(
    content: string,
    saveFunction: (content: string) => Promise<void>,
    delay: number = 2000
) {
    const [status, setStatus] = React.useState<SaveStatus>('idle')
    const [lastSaved, setLastSaved] = React.useState<Date | undefined>()
    const timeoutRef = React.useRef<NodeJS.Timeout>()
    const previousContentRef = React.useRef<string>(content)

    React.useEffect(() => {
        // Skip if content hasn't changed
        if (content === previousContentRef.current) return

        // Clear existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set new timeout for debounced save
        timeoutRef.current = setTimeout(async () => {
            setStatus('saving')

            try {
                await saveFunction(content)
                setStatus('saved')
                setLastSaved(new Date())
                previousContentRef.current = content

                // Reset to idle after showing "saved" message
                setTimeout(() => {
                    setStatus('idle')
                }, 2000)
            } catch {
                setStatus('error')

                // Reset to idle after showing error
                setTimeout(() => {
                    setStatus('idle')
                }, 3000)
            }
        }, delay)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [content, saveFunction, delay])

    return { status, lastSaved }
}
