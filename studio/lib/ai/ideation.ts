import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { z } from 'zod'

export const AngleSchema = z.object({
    id: z.string(),
    title: z.string(),
    hook: z.string(),
    pitch: z.string(),
})

export type Angle = z.infer<typeof AngleSchema>

const AnglesResponseSchema = z.object({
    angles: z.array(AngleSchema).length(3),
})

// Configure Azure OpenAI
const azure = createAzure({
    resourceName: 'mikefoundry',
    apiKey: process.env.AZURE_OPENAI_API_KEY,
})

export async function generateAngles(topic: string): Promise<Angle[]> {
    if (!topic || topic.trim() === '') {
        throw new Error('Topic cannot be empty')
    }

    const { object } = await generateObject({
        model: azure('gpt-5.2'),
        schema: AnglesResponseSchema,
        prompt: `You are a LinkedIn thought leadership strategist. Given the topic below, generate exactly 3 distinctive angles for a thought-provoking article.

Each angle should be:
- Unique and differentiated from the others
- Provocative or contrarian enough to grab attention
- Suitable for a 600-1200 word article

Topic: ${topic}

For each angle, provide:
- id: A short unique slug (e.g., "contrarian-take", "data-driven", "future-vision")
- title: A compelling headline (5-10 words)
- hook: An opening line that grabs attention (1-2 sentences)
- pitch: A brief description of the angle and key points to cover (2-3 sentences)`,
    })

    return object.angles
}
