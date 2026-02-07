import { describe, it, expect } from 'vitest'
import { researchTopic, type ResearchResult } from '@/lib/ai/research'

describe('researchTopic', () => {
    it('should return a research result with summary and citations', async () => {
        const angle = {
            id: 'test-angle',
            title: 'The rise of AI agents in enterprise',
            hook: 'What if AI could manage your entire workflow?',
            pitch: 'Exploring how AI agents are transforming business operations.'
        }

        const result = await researchTopic(angle)

        expect(result).toHaveProperty('summary')
        expect(result).toHaveProperty('citations')
        expect(result).toHaveProperty('keyStats')
        expect(typeof result.summary).toBe('string')
        expect(result.summary.length).toBeGreaterThan(100)
        expect(result.citations).toBeInstanceOf(Array)
        expect(result.keyStats).toBeInstanceOf(Array)
    }, 60000)

    it('should include at least 3 citations with titles and URLs', async () => {
        const angle = {
            id: 'data-driven',
            title: 'The hidden costs of AI adoption',
            hook: 'Most companies underestimate what AI really costs.',
            pitch: 'A data-driven look at AI implementation challenges.'
        }

        const result = await researchTopic(angle)

        expect(result.citations.length).toBeGreaterThanOrEqual(3)
        result.citations.forEach((citation) => {
            expect(citation).toHaveProperty('title')
            expect(citation).toHaveProperty('url')
            expect(typeof citation.title).toBe('string')
            expect(typeof citation.url).toBe('string')
        })
    }, 60000)

    it('should throw an error if angle title is empty', async () => {
        const invalidAngle = {
            id: 'invalid',
            title: '',
            hook: 'Some hook',
            pitch: 'Some pitch'
        }

        await expect(researchTopic(invalidAngle)).rejects.toThrow()
    })
})
