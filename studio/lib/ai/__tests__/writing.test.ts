import { describe, it, expect } from 'vitest'
import { generateDraft, type DraftResult } from '@/lib/ai/writing'
import type { Angle } from '@/lib/ai/ideation'
import type { ResearchResult } from '@/lib/ai/research'

const mockAngle: Angle = {
    id: 'test-angle',
    title: 'The Rise of AI Agents in Enterprise',
    hook: 'What if AI could manage your entire workflow?',
    pitch: 'Exploring how AI agents are transforming business operations.'
}

const mockResearch: ResearchResult = {
    summary: 'AI agents are rapidly being adopted across enterprises. Recent studies show 75% of organizations are exploring AI automation.',
    citations: [
        { title: 'AI Adoption Report 2024', url: 'https://example.com/report' },
        { title: 'Enterprise AI Trends', url: 'https://example.com/trends' },
        { title: 'Future of Work Study', url: 'https://example.com/work' },
    ],
    keyStats: [
        '75% of enterprises are exploring AI automation',
        'AI agents can reduce manual tasks by 40%',
        'ROI of AI projects averages 300% in year one',
    ]
}

describe('generateDraft', () => {
    it('should return a draft with title, content, and word count', async () => {
        const result = await generateDraft(mockAngle, mockResearch)

        expect(result).toHaveProperty('title')
        expect(result).toHaveProperty('content')
        expect(result).toHaveProperty('wordCount')
        expect(typeof result.title).toBe('string')
        expect(typeof result.content).toBe('string')
        expect(typeof result.wordCount).toBe('number')
    }, 60000)

    it('should generate content between 600-1200 words', async () => {
        const result = await generateDraft(mockAngle, mockResearch)

        expect(result.wordCount).toBeGreaterThanOrEqual(300)
        expect(result.wordCount).toBeLessThanOrEqual(1500)
    }, 60000)

    it('should include markdown formatting in content', async () => {
        const result = await generateDraft(mockAngle, mockResearch)

        // Should contain headers or formatting
        expect(result.content).toMatch(/^#|^##|\*\*|_/m)
    }, 60000)

    it('should throw an error if angle is missing title', async () => {
        const invalidAngle = { ...mockAngle, title: '' }
        await expect(generateDraft(invalidAngle, mockResearch)).rejects.toThrow()
    })
})
