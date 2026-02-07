import { useState, useCallback } from 'react'
import type { Angle } from '@/lib/ai/ideation'
import type { ResearchResult } from '@/lib/ai/research'
import type { DraftResult } from '@/lib/ai/writing'
import type { ImagePrompt } from '@/lib/ai/assets'
import type { GeneratedImage } from '@/lib/ai/image-generation'

export type Phase = 'ideation' | 'research' | 'writing' | 'assets' | 'review'

export function useWorkflowState() {
  const [phase, setPhase] = useState<Phase>('ideation')
  const [topic, setTopic] = useState('')
  const [angles, setAngles] = useState<Angle[]>([])
  const [selectedAngle, setSelectedAngle] = useState<Angle | null>(null)
  const [research, setResearch] = useState<ResearchResult | null>(null)
  const [draft, setDraft] = useState<DraftResult | null>(null)
  const [socialPost, setSocialPost] = useState<string>('')
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[] | null>(null)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [acceptedImages, setAcceptedImages] = useState<Record<string, GeneratedImage>>({})
  const [sessionId, setSessionId] = useState<string>(crypto.randomUUID())
  const [error, setError] = useState<string | null>(null)

  const resetWorkflow = useCallback(() => {
    setPhase('ideation')
    setTopic('')
    setAngles([])
    setSelectedAngle(null)
    setResearch(null)
    setDraft(null)
    setSocialPost('')
    setImagePrompts(null)
    setGeneratedImage(null)
    setAcceptedImages({})
    setError(null)
    setSessionId(crypto.randomUUID())
  }, [])

  const progressToResearch = useCallback((angle: Angle) => {
    setSelectedAngle(angle)
    setPhase('research')
    setResearch(null)
    setDraft(null)
    setSocialPost('')
    setImagePrompts(null)
    setGeneratedImage(null)
    setError(null)
  }, [])

  const progressToWriting = useCallback(() => {
    setPhase('writing')
    setDraft(null)
    setSocialPost('')
    setImagePrompts(null)
    setError(null)
  }, [])

  const progressToAssets = useCallback(() => {
    setPhase('assets')
    setImagePrompts(null)
    setError(null)
  }, [])

  const progressToReview = useCallback(() => {
    setPhase('review')
  }, [])

  const handleAcceptImage = useCallback((promptId: string, image: GeneratedImage) => {
    setAcceptedImages(prev => ({
      ...prev,
      [promptId]: image
    }))
  }, [])

  return {
    // State
    phase,
    topic,
    angles,
    selectedAngle,
    research,
    draft,
    socialPost,
    imagePrompts,
    generatedImage,
    acceptedImages,
    sessionId,
    error,

    // Setters
    setPhase,
    setTopic,
    setAngles,
    setSelectedAngle,
    setResearch,
    setDraft,
    setSocialPost,
    setImagePrompts,
    setGeneratedImage,
    setError,

    // Actions
    resetWorkflow,
    progressToResearch,
    progressToWriting,
    progressToAssets,
    progressToReview,
    handleAcceptImage,
  }
}
