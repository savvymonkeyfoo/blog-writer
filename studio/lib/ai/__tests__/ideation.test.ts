import { describe, it, expect } from 'vitest'
import { generateAngles, type Angle } from '@/lib/ai/ideation'

describe('generateAngles', () => {
    it('should return an array of 3 angles for a given topic', async () => {
        const topic = 'The rise of AI agents in the enterprise'

        const result = await generateAngles(topic)

        expect(result).toBeInstanceOf(Array)
        expect(result.length).toBe(3)
    }, 30000)

    it('each angle should have id, title, hook, and pitch', async () => {
        const topic = 'Why most AI projects fail'

        const result = await generateAngles(topic)

        result.forEach((angle: Angle) => {
            expect(angle).toHaveProperty('id')
            expect(angle).toHaveProperty('title')
            expect(angle).toHaveProperty('hook')
            expect(angle).toHaveProperty('pitch')
            expect(typeof angle.id).toBe('string')
            expect(typeof angle.title).toBe('string')
            expect(typeof angle.hook).toBe('string')
            expect(typeof angle.pitch).toBe('string')
        })
    }, 30000)

    it('should throw an error if topic is empty', async () => {
        await expect(generateAngles('')).rejects.toThrow('Topic cannot be empty')
    })
})
