import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { z } from 'zod'
import type { DraftResult } from './writing'

export interface ImagePrompt {
    id: string
    description: string
    style: 'professional' | 'abstract' | 'editorial' | 'infographic'
}

const azure = createAzure({
    resourceName: 'mikefoundry',
    apiKey: process.env.AZURE_OPENAI_API_KEY,
})

const ImagePromptSchema = z.object({
    prompts: z.array(z.object({
        id: z.string().describe('A short kebab-case identifier, e.g., "hero-image", "data-viz", "closing-cta"'),
        description: z.string().describe('A detailed DALL-E prompt (50-100 words) for generating the image'),
        style: z.enum(['professional', 'abstract', 'editorial', 'infographic']).describe('The visual style for the image'),
    })).length(3),
})

export async function generateImagePrompts(draft: DraftResult): Promise<ImagePrompt[]> {
    if (!draft.content || draft.content.trim() === '') {
        throw new Error('Draft content cannot be empty')
    }

    const prompt = `Analyze this article and generate 3 distinct image prompts for LinkedIn:

ARTICLE TITLE: ${draft.title}

ARTICLE CONTENT:
${draft.content}

Generate 3 image prompts that would work well for:
1. A hero/header image that captures the article's main theme
2. A supporting image that illustrates a key concept or data point
3. A closing image that reinforces the call-to-action or conclusion

For each prompt:
- Write detailed DALL-E descriptions (50-100 words)
- Specify whether the image should be photorealistic, abstract, editorial illustration, or infographic
- Focus on professional, business-appropriate imagery suitable for LinkedIn
- Avoid text in images, faces of real people, or controversial content`

    const { object } = await generateObject({
        model: azure('gpt-5.2-chat'),
        schema: ImagePromptSchema,
        prompt,
        // Note: temperature not supported for reasoning models
    })

    return object.prompts
}
