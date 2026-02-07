'use server'

import { researchTopic as researchTopicAI, type ResearchResult } from '@/lib/ai/research'
import { withRateLimit } from '@/lib/rate-limit/middleware'
import type { Angle } from '@/lib/ai/ideation'

async function researchTopicHandler(angle: Angle): Promise<{ research?: ResearchResult; error?: string }> {
    try {
        const research = await researchTopicAI(angle)
        return { research }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
        return { error: 'An unexpected error occurred during research' }
    }
}

export const researchTopicAction = withRateLimit('research')(researchTopicHandler)
