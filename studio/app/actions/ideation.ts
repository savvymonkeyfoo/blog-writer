'use server'

import { generateAngles as generateAnglesAI, type Angle } from '@/lib/ai/ideation'
import { topicSchema } from '@/lib/validation/schemas'
import { withRateLimit } from '@/lib/rate-limit/middleware'

async function generateAnglesHandler(topic: string): Promise<{ angles?: Angle[]; error?: string }> {
    try {
        // Validate input
        const validatedTopic = topicSchema.parse(topic)

        const angles = await generateAnglesAI(validatedTopic)
        return { angles }
    } catch (error) {
        if (error instanceof Error) {
            return { error: error.message }
        }
        return { error: 'An unexpected error occurred' }
    }
}

export const generateAnglesAction = withRateLimit('ideation')(generateAnglesHandler)
