import { z } from 'zod'

// Constants for validation limits
export const VALIDATION_LIMITS = {
  TOPIC_MIN_LENGTH: 5,
  TOPIC_MAX_LENGTH: 500,
  CONTENT_MAX_LENGTH: 50000,
  INSTRUCTION_MAX_LENGTH: 2000,
  PROMPT_MAX_LENGTH: 1000,
} as const

// Topic input validation
export const topicSchema = z
  .string()
  .min(VALIDATION_LIMITS.TOPIC_MIN_LENGTH, {
    message: `Topic must be at least ${VALIDATION_LIMITS.TOPIC_MIN_LENGTH} characters`,
  })
  .max(VALIDATION_LIMITS.TOPIC_MAX_LENGTH, {
    message: `Topic must be less than ${VALIDATION_LIMITS.TOPIC_MAX_LENGTH} characters`,
  })
  .trim()
  .refine(
    (val) => !/[<>]/.test(val),
    { message: 'Topic cannot contain < or > characters' }
  )

// Content validation (for articles and social posts)
export const contentSchema = z
  .string()
  .min(1, { message: 'Content cannot be empty' })
  .max(VALIDATION_LIMITS.CONTENT_MAX_LENGTH, {
    message: `Content must be less than ${VALIDATION_LIMITS.CONTENT_MAX_LENGTH} characters`,
  })

// Refinement instruction validation
export const instructionSchema = z
  .string()
  .min(3, { message: 'Instruction must be at least 3 characters' })
  .max(VALIDATION_LIMITS.INSTRUCTION_MAX_LENGTH, {
    message: `Instruction must be less than ${VALIDATION_LIMITS.INSTRUCTION_MAX_LENGTH} characters`,
  })
  .trim()
  .refine(
    (val) => {
      // Prevent common prompt injection patterns
      const dangerousPatterns = [
        /ignore\s+previous\s+instructions/i,
        /forget\s+everything/i,
        /you\s+are\s+now/i,
        /system\s*:\s*/i,
        /role\s*:\s*system/i,
      ]
      return !dangerousPatterns.some(pattern => pattern.test(val))
    },
    { message: 'Instruction contains potentially unsafe patterns' }
  )

// Image prompt validation
export const imagePromptSchema = z
  .string()
  .min(5, { message: 'Prompt must be at least 5 characters' })
  .max(VALIDATION_LIMITS.PROMPT_MAX_LENGTH, {
    message: `Prompt must be less than ${VALIDATION_LIMITS.PROMPT_MAX_LENGTH} characters`,
  })
  .trim()

// Asset type validation
export const assetTypeSchema = z.enum(['image', 'social_post', 'article'])

// Status validation
export const assetStatusSchema = z.enum(['draft', 'published'])

// Full asset validation
export const assetSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string(),
  type: assetTypeSchema,
  content: contentSchema,
  prompt: z.string(),
  status: assetStatusSchema,
  metadata: z.string().optional(),
})

export type ValidatedAsset = z.infer<typeof assetSchema>
