'use client'

import { ErrorBoundary } from './error-boundary'
import type { ReactNode } from 'react'

export function IdeationErrorBoundary({
  children,
  onReset
}: {
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <ErrorBoundary
      context="ideation"
      fallbackTitle="Failed to Generate Ideas"
      fallbackDescription="We couldn't generate article angles. This might be due to an AI service issue or network problem."
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ResearchErrorBoundary({
  children,
  onReset
}: {
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <ErrorBoundary
      context="research"
      fallbackTitle="Research Failed"
      fallbackDescription="We couldn't complete the research phase. You can try again or select a different angle."
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  )
}

export function WritingErrorBoundary({
  children,
  onReset
}: {
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <ErrorBoundary
      context="writing"
      fallbackTitle="Writing Failed"
      fallbackDescription="We couldn't generate or refine your content. Please try again."
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  )
}

export function AssetsErrorBoundary({
  children,
  onReset
}: {
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <ErrorBoundary
      context="assets"
      fallbackTitle="Asset Generation Failed"
      fallbackDescription="We couldn't generate image prompts or images. You can proceed without images."
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ReviewErrorBoundary({
  children,
  onReset
}: {
  children: ReactNode
  onReset?: () => void
}) {
  return (
    <ErrorBoundary
      context="review"
      fallbackTitle="Review Error"
      fallbackDescription="There was an error displaying the review. Your content is saved."
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  )
}
