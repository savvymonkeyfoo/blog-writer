import { describe, it, expect } from 'vitest'
import { generateImagePrompts, type ImagePrompt } from '@/lib/ai/assets'
import type { DraftResult } from '@/lib/ai/writing'

const mockDraft: DraftResult = {
    title: 'AI in Healthcare: Overhyped or Underestimated?',
    content: `# AI in Healthcare: Overhyped or Underestimated?

While everyone touts AI as the saviour of healthcare, could it actually be a double-edged sword?

## The Promise vs Reality

Healthcare data is projected to grow at 36% CAGR by 2025. That should be an AI goldmine. Instead, it is often a liability. Records remain siloed, inconsistent, and riddled with gaps.

## Ethics, Privacy, and the Myth of Neutral Machines

AI systems require vast datasets to learn. That raises immediate questions about privacy, consent, and ownership.

## Looking Forward

The ethical debate is not theoretical. It is playing out in hospitals right now. Clinicians do not trust the outputs, and the technology is quietly shelved.`,
    wordCount: 120
}

describe('generateImagePrompts', () => {
    it('should return an array of 3 image prompts', async () => {
        const result = await generateImagePrompts(mockDraft)

        expect(result).toBeInstanceOf(Array)
        expect(result.length).toBe(3)
    }, 60000)

    it('each prompt should have id, description, and style', async () => {
        const result = await generateImagePrompts(mockDraft)

        result.forEach((prompt) => {
            expect(prompt).toHaveProperty('id')
            expect(prompt).toHaveProperty('description')
            expect(prompt).toHaveProperty('style')
            expect(typeof prompt.description).toBe('string')
            expect(prompt.description.length).toBeGreaterThan(20)
        })
    }, 60000)

    it('should throw an error if draft content is empty', async () => {
        const emptyDraft = { ...mockDraft, content: '' }
        await expect(generateImagePrompts(emptyDraft)).rejects.toThrow()
    })
})
