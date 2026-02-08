import { generateText } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import type { Angle } from './ideation'
import type { ResearchResult } from './research'

export interface DraftResult {
    title: string
    content: string
    wordCount: number
}

// Configure Azure OpenAI
const azure = createAzure({
    resourceName: 'mikefoundry',
    apiKey: process.env.AZURE_OPENAI_API_KEY,
})

const MIKE_JONES_PERSONA = `You are Mike Jones, a thought leadership writer known for:

VOICE & TONE:
- Authoritative but accessible: Speak with confidence but avoid jargon.
- Slightly provocative and contrarian: Challenge the status quo.
- Insightful with a strategic perspective: Focus on the "why" and "so what".
- Australian English: Use Australian spelling (colour, organisation, analyse) and idioms.
- NO Em Dashes: Never use em dashes (—). Use commas, colons, or periods instead.

WRITING STYLE:
- Opening Hooks: Start with a statement that challenges conventional thinking.
- Data-Driven: Use statistics to ground your arguments.
- Real-World Examples: Use case studies or observations.
- Clear Structure: Use H2 (##) subheadings to break up text.
- Actionable: End with clear takeaways or a question.

FORMATTING RULES:
- Markdown: Use standard Markdown (## for headings, **bold** for emphasis).
- Paragraphs: Keep paragraphs short (2-3 sentences) for readability.
- Length: 600-1000 words.
- No Hashtags: Do not clean up with hashtags.
- STRICT RULES:
- NEVER use hashtags (#topic or similar)
- NEVER use emojis
- NEVER use em dashes (—) - use commas, colons, semicolons, or periods
- Use Australian/British English spelling (favour, colour, organisation, etc.)`

export async function generateDraft(angle: Angle, research: ResearchResult): Promise<DraftResult> {
    if (!angle.title || angle.title.trim() === '') {
        throw new Error('Angle title cannot be empty')
    }

    const prompt = `Write a LinkedIn thought leadership article based on the following:

ANGLE:
Title: ${angle.title}
Hook: ${angle.hook}
Focus: ${angle.pitch}

RESEARCH SUMMARY:
${research.summary}

KEY STATISTICS:
${research.keyStats.map((stat, i) => `${i + 1}. ${stat.stat} (Source: ${stat.sourceId})`).join('\n')}

EVIDENCE LEDGER:
${research.evidenceLedger.map(evidence => `- ${evidence.id}: ${evidence.title} (${evidence.publisher}, ${evidence.publishedDate}) ${evidence.url}`).join('\n')}

INSTRUCTIONS:
1. Start with the hook.
2. Weave in statistics naturally.
3. Reference sources.
4. Provide unique insights.
5. End with a call to action.
6. STRICTLY NO EM DASHES.
7. Use Australian English.`

    const { text } = await generateText({
        model: azure('gpt-5.2'),
        system: MIKE_JONES_PERSONA,
        prompt,
        // Note: temperature not supported for reasoning models
    })

    // Extract title from content (first # heading) or use angle title
    const titleMatch = text.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1] : angle.title

    // Calculate word count
    const wordCount = text.split(/\s+/).filter(Boolean).length

    return {
        title,
        content: text,
        wordCount,
    }
}

const MIKE_JONES_SOCIAL_PERSONA = `You are Mike Jones, but in "social mode".

GOAL:
To get the reader to click "Read more" or open the linked article. NOT to summarize the whole article, but to tease the value.

VOICE & TONE:
- Punchy & Direct: Short sentences.
- Provocative: Start with a strong opinion or surprising fact from the article.
- Curiosity-Inducing: Leave the "answer" for the article.
- No Em Dashes: Use commas, colons, or periods.

FORMATTING RULES:
- Length: < 150 words.
- Structure:
    1. Hook: 1-2 lines that stop the scroll.
    2. Body: 2-3 lines elaborating on the problem or conflict.
    3. CTA: "I dive deep into this below 👇" or similar.
- No Hashtags: Do not use hashtags.`

export async function generateSocialPost(draft: DraftResult, angle: Angle): Promise<string> {
    const prompt = `Write a short LinkedIn "lure" post to promote this article:

ARTICLE TITLE: ${draft.title}
ARTICLE HOOK/ANGLE: ${angle.hook}
ARTICLE SUMMARY: ${angle.pitch}

INSTRUCTIONS:
1. Write a scroll-stopping hook (1-2 lines).
2. Tease the core conflict or insight without giving away the full solution.
3. End with a pointer to the article (e.g., "Full breakdown below 👇").
4. Keep it under 150 words.
5. STRICTLY NO EM DASHES.
6. NO HASHTAGS.`

    const { text } = await generateText({
        model: azure('gpt-5.2'),
        system: MIKE_JONES_SOCIAL_PERSONA,
        prompt,
        // Note: temperature not supported for reasoning models
    })

    return text
}

export async function refineDraft(currentContent: string, instruction: string): Promise<string> {
    const prompt = `You are editing a draft article.
    
YOUR GOAL: 
Refine the following text based strictly on the user's instruction, while maintaining the "Mike Jones" voice (Authoritative, Contrarian, No Em Dashes, Australian English).

USER INSTRUCTION: "${instruction}"

CURRENT TEXT:
${currentContent}

OUTPUT:
Return the rewritten text ONLY. Do not wrap it in markdown block quotes or add conversational filler.`

    const { text } = await generateText({
        model: azure('gpt-5.2'),
        system: MIKE_JONES_PERSONA,
        prompt,
        // Note: temperature not supported for reasoning models
    })

    return text
}
