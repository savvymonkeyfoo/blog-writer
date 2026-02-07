'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AngleCard } from '@/components/ideation/angle-card'
import { ResearchDashboard } from '@/components/research/research-dashboard'
import { WritingStudio } from '@/components/writing/writing-studio'
import { AssetStudio } from '@/components/assets/asset-studio'
import { FinalReview } from '@/components/review/final-review'
import { ProgressStepper, type Step } from '@/components/ui/progress-stepper'
import { AutoSaveIndicator } from '@/components/ui/auto-save-indicator'
import { ImageWarningDialog } from '@/components/ui/confirmation-dialog'
import { SkeletonAngleCard } from '@/components/ui/skeleton'
import { generateAnglesAction } from '@/app/actions/ideation'
import { researchTopicAction } from '@/app/actions/research'
import { generateDraftAction, generateSocialPostAction } from '@/app/actions/writing'
import { generateImagePromptsAction } from '@/app/actions/assets'
import { Sparkles, Loader2, ArrowRight, LayoutGrid, Share2, Copy, RefreshCw } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import {
  IdeationErrorBoundary,
  ResearchErrorBoundary,
  WritingErrorBoundary,
  AssetsErrorBoundary,
  ReviewErrorBoundary,
} from '@/components/error/phase-error-boundaries'
import { useValidation } from '@/lib/validation/use-validation'
import { topicSchema, instructionSchema } from '@/lib/validation/schemas'
import { sanitizeInput } from '@/lib/validation/sanitize'
import type { Angle } from '@/lib/ai/ideation'
import type { ResearchResult } from '@/lib/ai/research'
import type { DraftResult } from '@/lib/ai/writing'
import type { ImagePrompt } from '@/lib/ai/assets'
import type { GeneratedImage } from '@/lib/ai/image-generation'

type Phase = 'ideation' | 'research' | 'writing' | 'social' | 'assets' | 'review'

const WORKFLOW_STEPS: Step[] = [
  { id: 'ideation', label: 'Ideation', description: 'Choose your angle' },
  { id: 'research', label: 'Research', description: 'Gather insights' },
  { id: 'writing', label: 'Writing', description: 'Create content' },
  { id: 'social', label: 'Social', description: 'LinkedIn post' },
  { id: 'assets', label: 'Assets', description: 'Generate visuals' },
  { id: 'review', label: 'Review', description: 'Finalize & publish' },
]

const phaseToStepIndex: Record<Phase, number> = {
  ideation: 0,
  research: 1,
  writing: 2,
  social: 3,
  assets: 4,
  review: 5,
}

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>('ideation')
  const [topic, setTopic] = useState('')
  const [angles, setAngles] = useState<Angle[]>([])
  const [selectedAngle, setSelectedAngle] = useState<Angle | null>(null)
  const [research, setResearch] = useState<ResearchResult | null>(null)
  const [draft, setDraft] = useState<DraftResult | null>(null)
  const [socialPost, setSocialPost] = useState<string>('')
  const [imagePrompts, setImagePrompts] = useState<ImagePrompt[] | null>(null)
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGeneratingAngles, startGenerating] = useTransition()
  const [isResearching, startResearching] = useTransition()
  const [isResearchLoading, setIsResearchLoading] = useState(false) // Manual loading state
  const [isWriting, startWriting] = useTransition()
  const [isGeneratingSocial, startGeneratingSocial] = useTransition()
  const [isGeneratingPrompts, startGeneratingPrompts] = useTransition()
  const [acceptedImages, setAcceptedImages] = useState<Record<string, GeneratedImage>>({})
  const [sessionId, setSessionId] = useState<string>(crypto.randomUUID())

  // Validation hooks
  const { validate: validateTopic, error: topicError } = useValidation(topicSchema)
  const { validate: validateInstruction, error: instructionError } = useValidation(instructionSchema)

  // Helper to detect rate limit errors
  const isRateLimitError = (result: any): result is { rateLimited: true; error: string; retryAfter?: number } => {
    return result?.rateLimited === true
  }

  // Auto-save state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | undefined>()

  // Image warning dialog state
  const [showImageWarning, setShowImageWarning] = useState(false)

  // Check if any image has been generated/accepted
  const hasGeneratedImage = Object.keys(acceptedImages).length > 0 || generatedImage !== null
  const finalImage = Object.values(acceptedImages)[0] || generatedImage

  // Save drafts and social posts when they update or phase changes
  const saveContent = useCallback(async (type: 'article' | 'social_post', content: string, newDraft?: DraftResult) => {
    if (!content) return

    setSaveStatus('saving')

    try {
      const metadata = type === 'article' && newDraft ? { title: newDraft.title } : {}

      await import('@/app/actions/assets').then(({ saveAsset }) =>
        saveAsset({
          id: crypto.randomUUID(),
          groupId: sessionId,
          type,
          content,
          prompt: newDraft?.title || 'Social Post',
          status: 'draft',
          metadata: JSON.stringify(metadata)
        })
      )

      setSaveStatus('saved')
      setLastSaved(new Date())

      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch (error) {
      console.error('[saveContent] Failed to save content:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    }
  }, [sessionId])

  // Auto-save draft content
  useEffect(() => {
    if (draft && phase === 'writing') {
      const timer = setTimeout(() => {
        saveContent('article', draft.content, draft)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [draft?.content, phase, saveContent, draft])

  const handleAcceptImage = (promptId: string, image: GeneratedImage) => {
    setAcceptedImages(prev => ({
      ...prev,
      [promptId]: image
    }))
  }

  const handleGenerate = () => {
    const sanitized = sanitizeInput(topic)

    if (!validateTopic(sanitized)) {
      setError(topicError || 'Invalid topic')
      return
    }

    setError(null)
    setAngles([])
    setSelectedAngle(null)
    setResearch(null)
    setDraft(null)
    setSocialPost('')
    setImagePrompts(null)
    setGeneratedImage(null)
    setAcceptedImages({})
    setSessionId(crypto.randomUUID())

    startGenerating(async () => {
      const result = await generateAnglesAction(sanitized)

      if (isRateLimitError(result)) {
        setError(`${result.error} (Retry in ${result.retryAfter}s)`)
        return
      }

      if (result.error) {
        setError(result.error)
      } else if (result.angles) {
        setAngles(result.angles)
      }
    })
  }

  const handleSelectAngle = async (angle: Angle) => {
    setSelectedAngle(angle)
    setPhase('research')
    setResearch(null)
    setDraft(null)
    setSocialPost('')
    setImagePrompts(null)
    setGeneratedImage(null)
    setError(null)
    setIsResearchLoading(true)

    try {
      const result = await researchTopicAction(angle)

      // Check for rate limit error first
      if (isRateLimitError(result)) {
        setError(`${result.error} (Retry in ${result.retryAfter}s)`)
        return
      }

      // Check for regular error
      if (result.error) {
        setError(result.error)
        return
      }

      // Check for research data
      if (result.research) {
        setResearch(result.research)
      } else {
        // Handle unexpected response format
        setError('Research completed but returned no data. Please try again.')
      }
    } finally {
      setIsResearchLoading(false)
    }
  }

  const handleProceedToWriting = () => {
    if (!selectedAngle || !research) return

    setPhase('writing')
    setDraft(null)
    setSocialPost('')
    setImagePrompts(null)
    setError(null)

    startWriting(async () => {
      const result = await generateDraftAction(selectedAngle, research)
      if (result.error) {
        setError(result.error)
      } else if (result.draft) {
        setDraft(result.draft)
      }
    })
  }

  const handleGenerateSocial = () => {
    if (!draft || !selectedAngle) return
    setError(null)

    startGeneratingSocial(async () => {
      const result = await generateSocialPostAction(draft, selectedAngle)
      if (result.error) {
        setError(result.error)
      } else if (result.post) {
        setSocialPost(result.post)
        await saveContent('social_post', result.post, draft)
      }
    })
  }

  const handleProceedToSocial = () => {
    if (!draft) return

    setPhase('social')
    setError(null)

    // Auto-generate social post when entering this phase
    if (!socialPost) {
      handleGenerateSocial()
    }
  }

  const handleProceedToAssets = () => {
    if (!draft || !socialPost) return

    setPhase('assets')
    setImagePrompts(null)
    setError(null)

    startGeneratingPrompts(async () => {
      await saveContent('article', draft.content, draft)
      await saveContent('social_post', socialPost, draft)

      const result = await generateImagePromptsAction(draft)
      if (result.error) {
        setError(result.error)
      } else if (result.prompts) {
        setImagePrompts(result.prompts)
      }
    })
  }

  const handleProceedToReview = () => {
    // Check if image has been generated
    if (!hasGeneratedImage) {
      setShowImageWarning(true)
      return
    }

    proceedToReview()
  }

  const proceedToReview = () => {
    if (draft) saveContent('article', draft.content, draft)
    if (socialPost) saveContent('social_post', socialPost, draft || undefined)
    setPhase('review')
  }

  const handleRegenerate = () => {
    if (!selectedAngle || !research) return
    setDraft(null)
    setSocialPost('')
    setError(null)

    startWriting(async () => {
      const result = await generateDraftAction(selectedAngle, research)
      if (result.error) {
        setError(result.error)
      } else if (result.draft) {
        setDraft(result.draft)
      }
    })
  }

  const handleRefine = (instruction: string, content: string) => {
    const sanitizedInstruction = sanitizeInput(instruction)

    if (!validateInstruction(sanitizedInstruction)) {
      setError(instructionError || 'Invalid instruction')
      return
    }

    const isRefiningSocial = content === socialPost

    if (isRefiningSocial) {
      startGeneratingSocial(async () => {
        const { refineDraftAction } = await import('@/app/actions/writing')
        const result = await refineDraftAction(content, sanitizedInstruction)
        if (result.error) {
          setError(result.error)
        } else if (result.refinedContent) {
          setSocialPost(result.refinedContent)
          await saveContent('social_post', result.refinedContent, draft || undefined)
        }
      })
    } else {
      if (!draft) return
      startWriting(async () => {
        const { refineDraftAction } = await import('@/app/actions/writing')
        const result = await refineDraftAction(content, sanitizedInstruction)
        if (result.error) {
          setError(result.error)
        } else if (result.refinedContent) {
          setDraft({
            ...draft,
            content: result.refinedContent,
            wordCount: result.refinedContent.split(/\s+/).filter(Boolean).length
          })
        }
      })
    }
  }

  // Step navigation handler
  const handleStepClick = (stepIndex: number) => {
    const phases: Phase[] = ['ideation', 'research', 'writing', 'assets', 'review']
    const targetPhase = phases[stepIndex]

    // Only allow navigating to completed steps or the current step
    if (stepIndex <= phaseToStepIndex[phase]) {
      setPhase(targetPhase)
    }
  }

  const handleStartOver = () => {
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
  }

  const phaseDescriptions = {
    ideation: 'Transform your ideas into compelling thought leadership.',
    research: 'Review the research gathered for your article.',
    writing: 'Your article, crafted with AI assistance.',
    social: 'Create your LinkedIn post to promote the article.',
    assets: 'Generate images to accompany your article.',
    review: 'Review and publish your content.',
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-gradient-to-br from-primary via-blue-600 to-[#FF3366] text-white p-3 rounded-2xl shadow-xl shadow-primary/30 animate-pulse">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h1 className="font-mono text-4xl font-bold tracking-tight text-gradient uppercase">
                  Content Studio
                </h1>
              </div>
              <p className="text-muted-foreground text-lg font-medium">
                {phaseDescriptions[phase]}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              {/* Auto-save indicator */}
              {phase !== 'ideation' && (
                <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
              )}
              <Button variant="ghost" asChild className="gap-2">
                <a href="/assets">
                  <LayoutGrid className="h-4 w-4" />
                  View Gallery
                </a>
              </Button>
              <ModeToggle />
            </div>
          </div>

          {/* Progress Stepper */}
          <div className="mb-8 pt-4 pb-12">
            <ProgressStepper
              steps={WORKFLOW_STEPS}
              currentStep={phaseToStepIndex[phase]}
              onStepClick={handleStepClick}
            />
          </div>
        </header>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive rounded-xl p-4 mb-6 text-center backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Warning Dialog */}
        <ImageWarningDialog
          open={showImageWarning}
          onOpenChange={setShowImageWarning}
          onContinueWithoutImage={() => {
            setShowImageWarning(false)
            proceedToReview()
          }}
          onGenerateImage={() => {
            setShowImageWarning(false)
          }}
        />

        {/* Phase Content */}
        <AnimatePresence mode="wait">
          {/* Ideation Phase */}
          {phase === 'ideation' && (
            <IdeationErrorBoundary onReset={() => setAngles([])}>
              <motion.div
                key="ideation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
              <div className="mb-16 relative">
                <div className="max-w-4xl">
                  {/* Big bold label */}
                  <div className="mb-4">
                    <h2 className="font-mono text-2xl font-bold text-foreground/90 uppercase tracking-wider">
                      What's your big idea?
                    </h2>
                    <div className="h-1 w-24 bg-gradient-to-r from-primary to-[#FF3366] rounded-full mt-2"></div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-1 relative group">
                      <Input
                        placeholder="e.g., 'The rise of AI agents in the enterprise'"
                        value={topic}
                        onChange={(e) => {
                          const value = e.target.value
                          if (value.length <= 500) {
                            setTopic(value)
                          }
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        className="text-lg h-16 px-6 rounded-2xl border-2 focus:border-primary transition-all shadow-lg shadow-primary/5 group-hover:shadow-xl group-hover:shadow-primary/10 bg-card"
                        disabled={isGeneratingAngles}
                        maxLength={500}
                      />
                      {/* Character count */}
                      <div className="absolute right-4 -bottom-6 text-xs font-mono text-muted-foreground">
                        {topic.length}/500
                      </div>
                    </div>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGeneratingAngles || !topic.trim()}
                      className="h-16 px-10 gap-3 rounded-2xl"
                      variant="premium"
                      size="xl"
                    >
                      {isGeneratingAngles ? (
                        <>
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <span className="font-bold">Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-6 w-6" />
                          <span className="font-bold">Generate</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Loading Skeleton */}
              {isGeneratingAngles && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {[1, 2, 3].map((i) => (
                    <SkeletonAngleCard key={i} />
                  ))}
                </motion.div>
              )}

              {/* Angle Cards */}
              {!isGeneratingAngles && angles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  {angles.map((angle, index) => (
                    <AngleCard
                      key={angle.id}
                      angle={angle}
                      index={index}
                      onSelect={handleSelectAngle}
                      isSelected={selectedAngle?.id === angle.id}
                    />
                  ))}
                </motion.div>
              )}

              {/* Empty State */}
              {!isGeneratingAngles && angles.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-20 relative"
                >
                  {/* Electric glow backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-[#FF3366]/5 rounded-3xl blur-3xl" />

                  <div className="relative z-10">
                    <motion.div
                      className="bg-gradient-to-br from-primary/10 to-[#FF3366]/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border-2 border-primary/20"
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <Sparkles className="h-12 w-12 text-primary" />
                    </motion.div>
                    <p className="text-2xl font-bold mb-3 font-mono uppercase tracking-wide">Ready to create?</p>
                    <p className="text-muted-foreground text-lg">Enter your topic above to generate article angles</p>
                  </div>
                </motion.div>
              )}
            </motion.div>
            </IdeationErrorBoundary>
          )}

          {/* Research Phase */}
          {phase === 'research' && selectedAngle && (
            <ResearchErrorBoundary onReset={() => setPhase('ideation')}>
              <motion.div
                key="research"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ResearchDashboard
                  angle={selectedAngle}
                  research={research}
                  isLoading={isResearchLoading}
                  onProceed={handleProceedToWriting}
                />
              </motion.div>
            </ResearchErrorBoundary>
          )}

          {/* Writing Phase */}
          {phase === 'writing' && (
            <WritingErrorBoundary onReset={() => setPhase('research')}>
              <motion.div
                key="writing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <WritingStudio
                  draft={draft}
                  isLoading={isWriting}
                  onRegenerate={handleRegenerate}
                  onRefine={handleRefine}
                />
                {draft && !isWriting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center pt-4"
                  >
                    <Button
                      onClick={handleProceedToSocial}
                      variant="premium"
                      size="lg"
                      className="gap-2"
                    >
                      Create LinkedIn Post
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </WritingErrorBoundary>
          )}

          {/* Social Post Phase */}
          {phase === 'social' && (
            <WritingErrorBoundary onReset={() => setPhase('writing')}>
              <motion.div
                key="social"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="max-w-4xl mx-auto">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-primary via-blue-600 to-[#FF3366] text-white p-2.5 rounded-xl shadow-lg shadow-primary/30">
                        <Share2 className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="font-mono text-xl uppercase tracking-wide">LinkedIn Post</CardTitle>
                        <CardDescription>Your promotional post for LinkedIn</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {isGeneratingSocial && (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-4">
                          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                          <p className="text-muted-foreground font-medium">Generating LinkedIn post...</p>
                        </div>
                      </div>
                    )}

                    {socialPost && !isGeneratingSocial && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="rounded-xl border bg-muted/30 p-6">
                          <p className="whitespace-pre-wrap text-sm leading-relaxed">{socialPost}</p>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button
                            onClick={() => {
                              navigator.clipboard.writeText(socialPost)
                            }}
                            variant="outline"
                            className="gap-2"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Post
                          </Button>
                          <Button
                            onClick={handleGenerateSocial}
                            variant="outline"
                            className="gap-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Regenerate
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {socialPost && !isGeneratingSocial && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center pt-4"
                      >
                        <Button
                          onClick={handleProceedToAssets}
                          variant="premium"
                          size="lg"
                          className="gap-2"
                        >
                          Generate Visuals
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </WritingErrorBoundary>
          )}

          {/* Assets Phase */}
          {phase === 'assets' && (
            <AssetsErrorBoundary onReset={() => setPhase('social')}>
              <motion.div
                key="assets"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-8">
                  <AssetStudio
                    prompts={imagePrompts}
                    isLoading={isGeneratingPrompts}
                    generatedImage={generatedImage}
                    onImageGenerated={setGeneratedImage}
                    acceptedImages={acceptedImages}
                    onAcceptImage={handleAcceptImage}
                    sessionId={sessionId}
                  />

                  {/* Proceed Button with Image Guardrail */}
                  {imagePrompts && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center gap-4 pt-8 border-t"
                    >
                      {!hasGeneratedImage && (
                        <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          Generate an image for better engagement
                        </p>
                      )}
                      <Button
                        onClick={handleProceedToReview}
                        variant="premium"
                        size="lg"
                        className="gap-2"
                      >
                        Proceed to Final Review
                        <ArrowRight className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </AssetsErrorBoundary>
          )}

          {/* Final Review Phase */}
          {phase === 'review' && draft && (
            <ReviewErrorBoundary onReset={() => setPhase('assets')}>
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FinalReview
                  draft={draft}
                  socialPost={socialPost}
                  generatedImage={finalImage}
                  onBack={() => setPhase('assets')}
                  onStartOver={handleStartOver}
                />
              </motion.div>
            </ReviewErrorBoundary>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
