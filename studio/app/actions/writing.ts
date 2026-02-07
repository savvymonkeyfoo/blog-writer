'use server'

import { generateDraft as generateDraftAI, type DraftResult } from '@/lib/ai/writing'
import { instructionSchema, contentSchema } from '@/lib/validation/schemas'
import { withRateLimit } from '@/lib/rate-limit/middleware'
import type { Angle } from '@/lib/ai/ideation'
import type { ResearchResult } from '@/lib/ai/research'

async function generateDraftHandler(
    angle: Angle,
    research: ResearchResult
): Promise<{ draft?: DraftResult; error?: string }> {
    try {
        const draft = await generateDraftAI(angle, research)
        return { draft }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
        return { error: 'An unexpected error occurred during draft generation' }
    }
}

export const generateDraftAction = withRateLimit('writing', 2)(generateDraftHandler)

async function generateSocialPostHandler(
    draft: DraftResult,
    angle: Angle
): Promise<{ post?: string; error?: string }> {
    try {
        const post = await import('@/lib/ai/writing').then(mod => mod.generateSocialPost(draft, angle))
        return { post }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
        return { error: 'An unexpected error occurred during social post generation' }
    }
}

export const generateSocialPostAction = withRateLimit('writing')(generateSocialPostHandler)

async function refineDraftHandler(
    currentContent: string,
    instruction: string
): Promise<{ refinedContent?: string; error?: string }> {
    try {
        // Validate inputs
        const validatedContent = contentSchema.parse(currentContent)
        const validatedInstruction = instructionSchema.parse(instruction)

        const refinedContent = await import('@/lib/ai/writing').then(mod =>
            mod.refineDraft(validatedContent, validatedInstruction)
        )
        return { refinedContent }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
        return { error: 'An unexpected error occurred during draft refinement' }
    }
}

export const refineDraftAction = withRateLimit('writing')(refineDraftHandler)
