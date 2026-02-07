import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { z } from 'zod'
import type { Angle } from './ideation'

export interface Citation {
    title: string
    url: string
    snippet?: string
}

export interface ResearchResult {
    summary: string
    citations: Citation[]
    keyStats: string[]
}

// Configure Azure OpenAI
const azure = createAzure({
    resourceName: 'mikefoundry',
    apiKey: process.env.AZURE_OPENAI_API_KEY,
})

const ResearchResultSchema = z.object({
    summary: z.string().describe('A comprehensive research summary (300-500 words) with key insights, trends, and expert perspectives'),
    citations: z.array(z.object({
        title: z.string().describe('Title of the source article or study'),
        url: z.string().describe('URL of the source'),
        snippet: z.string().describe('Brief excerpt or key finding from the source'),
    })).min(3).max(6).describe('Relevant citations from recent sources'),
    keyStats: z.array(z.string()).min(3).max(5).describe('Key statistics or data points that support the topic, each including its source'),
})

export async function researchTopic(angle: Angle): Promise<ResearchResult> {
    if (!angle.title || angle.title.trim() === '') {
        throw new Error('Angle title cannot be empty')
    }

    const prompt = `You are a research assistant for thought leadership articles. Research the following topic and provide comprehensive, well-sourced information.

Topic: ${angle.title}
Context: ${angle.pitch}

Provide:
1. A comprehensive research summary (300-500 words) with key insights, trends, and expert perspectives relevant to this topic.
2. 3-6 relevant citations from recent sources (2023-2024) with realistic titles, URLs, and brief excerpts. Make these plausible examples based on what actual research would find.
3. 3-5 key statistics or data points that support the topic, each including a source attribution.

Focus on providing actionable insights that would help write a compelling thought leadership article.`

    const { object } = await generateObject({
        model: azure('gpt-5.2-chat'),
        schema: ResearchResultSchema,
        prompt,
        // Note: temperature not supported for reasoning models
    })

    return {
        summary: object.summary,
        citations: object.citations.map(c => ({
            title: c.title,
            url: c.url,
            snippet: c.snippet,
        })),
        keyStats: object.keyStats,
    }
}
