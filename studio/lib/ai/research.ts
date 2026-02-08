import { generateObject } from 'ai'
import { createAzure } from '@ai-sdk/azure'
import { z } from 'zod'
import type { Angle } from './ideation'

export interface ResearchResult {
    summary: string
    evidenceLedger: {
        id: string
        title: string
        url: string
        publisher: string
        publishedDate: string
        sourceTier: 'primary' | 'authoritative-secondary' | 'secondary' | 'vendor'
        relevance: string
        quoteOrFinding: string
    }[]
    keyStats: {
        stat: string
        sourceId: string
    }[]
    gaps: string[]
    confidence: 'low' | 'medium' | 'high'
}

// Configure Azure OpenAI
const azure = createAzure({
    resourceName: 'mikefoundry',
    apiKey: process.env.AZURE_OPENAI_API_KEY,
})

const ResearchResultSchema = z.object({
    summary: z.string().describe('A comprehensive research summary (300-500 words) with evidence-backed insights and explicit limitations'),
    evidenceLedger: z.array(z.object({
        id: z.string().describe('Stable reference id, e.g., E1, E2'),
        title: z.string().describe('Exact title of the source'),
        url: z.string().describe('Direct URL to the source'),
        publisher: z.string().describe('Publisher or organisation'),
        publishedDate: z.string().describe('Publication date in ISO format (YYYY-MM-DD)'),
        sourceTier: z.enum(['primary', 'authoritative-secondary', 'secondary', 'vendor']).describe('Evidence tier'),
        relevance: z.string().describe('Why this source is relevant to the topic'),
        quoteOrFinding: z.string().describe('Verifiable quote or finding used in the summary'),
    })).min(0).max(8).describe('Evidence ledger. Leave empty if you cannot verify sources.'),
    keyStats: z.array(z.object({
        stat: z.string().describe('A specific, verifiable statistic'),
        sourceId: z.string().describe('Evidence ledger id that supports this statistic'),
    })).min(0).max(6).describe('Key statistics linked to evidence ledger entries. Minimum 3 preferred, but 0 allowed after source filtering.'),
    gaps: z.array(z.string()).min(1).max(6).describe('Evidence gaps or verification limitations'),
    confidence: z.enum(['low', 'medium', 'high']).describe('Overall confidence based on evidence quality'),
})

/**
 * Normalize URLs for comparison by removing protocol, www, trailing slashes, and query params
 * This allows matching URLs that are functionally identical but formatted differently
 */
function normalizeUrl(url: string): string {
    try {
        const urlObj = new URL(url)
        // Remove protocol (http/https), www prefix, trailing slash, query params, hash
        return urlObj.hostname.replace(/^www\./, '') + urlObj.pathname.replace(/\/$/, '')
    } catch {
        // If URL parsing fails, return original for basic comparison
        return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').split('?')[0].split('#')[0]
    }
}

export async function researchTopic(angle: Angle): Promise<ResearchResult> {
    if (!angle.title || angle.title.trim() === '') {
        throw new Error('Angle title cannot be empty')
    }

    if (!process.env.PERPLEXITY_API_KEY) {
        throw new Error('PERPLEXITY_API_KEY is required for verified research.')
    }

    // Search using Perplexity API directly
    const searchQuery = `${angle.title}: ${angle.pitch}`

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'sonar',
            messages: [
                {
                    role: 'system',
                    content: 'You are a research assistant. Find recent, authoritative sources and provide URLs. Prefer primary sources (standards bodies, regulators, peer-reviewed research) and authoritative secondary sources. Include a mix of perspectives. Focus on the last 24 months unless a source is foundational.',
                },
                {
                    role: 'user',
                    content: `Research this topic and provide 5-8 relevant URLs with sources: ${searchQuery}`,
                },
            ],
        }),
    })

    if (!perplexityResponse.ok) {
        const errorText = await perplexityResponse.text()
        console.error('[Perplexity Error]', {
            status: perplexityResponse.status,
            statusText: perplexityResponse.statusText,
            error: errorText
        })
        throw new Error(`Perplexity search failed: ${perplexityResponse.statusText} - ${errorText}`)
    }

    const perplexityData = await perplexityResponse.json()
    console.log('[Perplexity Response]', JSON.stringify(perplexityData, null, 2))

    // Extract search results from the response - Perplexity returns them with full metadata
    const searchResults = (perplexityData.search_results ?? []).slice(0, 8).map((result: any) => ({
        url: result.url,
        title: result.title,
        snippet: result.snippet ?? '',
        date: result.date ?? '', // Include date for backfilling
    }))

    if (searchResults.length === 0) {
        throw new Error('Search failed: no results returned from Perplexity search.')
    }

    // Extract valid URLs for explicit verification
    const validUrls = searchResults.map((r: any) => r.url)

    const prompt = `You are a research assistant. Your task is to synthesize research from ONLY the sources provided below.

Topic: ${angle.title}
Context: ${angle.pitch}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  CRITICAL CONSTRAINT - READ THIS FIRST ⚠️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are ONLY allowed to reference these ${validUrls.length} URLs:

${validUrls.map((url: string, idx: number) => `${idx + 1}. ${url}`).join('\n')}

⛔ DO NOT generate, infer, or recall ANY other URLs from your training data.
⛔ DO NOT use domains like techcrunch.com, bloomberg.com, cnbc.com, reuters.com UNLESS they appear in the list above.
⛔ If a URL is not in the numbered list above, you CANNOT use it - period.

WHY THIS MATTERS:
- Any URL not in this list will cause the research to FAIL.
- Better to return ${validUrls.length} sources than to fabricate even one URL.
- Your response will be automatically validated - fabricated URLs will be caught and removed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUCTIONS:

1. **Evidence Ledger**: Create exactly ${validUrls.length} entries, one for each URL in the numbered list above.
   - id: Use "E1", "E2", etc. matching the numbered list
   - title: Extract from SEARCH_RESULTS below
   - url: Copy EXACTLY from the numbered list (character-by-character)
   - publisher: Extract from URL domain (e.g., "axios.com" → "Axios")
   - publishedDate: Extract from SEARCH_RESULTS "date" field (YYYY-MM-DD format)
   - sourceTier: Evaluate based on domain (.gov/.edu = primary, major news = authoritative-secondary, blogs = secondary, company sites = vendor)
   - relevance: Why this source is relevant to the topic
   - quoteOrFinding: Extract a verifiable quote or key finding from the snippet

2. **Key Statistics**: Extract 3-6 quantifiable facts from the search results.
   - Include: numbers, percentages, dates, timeframes, valuations, counts, or measurable claims
   - Each stat MUST link to a sourceId (E1, E2, etc.) from your evidence ledger
   - Examples: "Company valued at $1.25 trillion", "Report published in 2024", "75% increase in adoption"
   - Extract statistics from titles, snippets, or dates in SEARCH_RESULTS

3. **Research Summary**: Write 300-500 words synthesizing the findings from ALL ${validUrls.length} sources.
   - Reference sources by their evidence ID (E1, E2, etc.)
   - Focus on evidence-backed insights from the provided sources only

4. **Evidence Gaps**: Identify what's missing or uncertain (e.g., "No primary sources from official organizations", "Limited data on X")

5. **Confidence**: Rate as:
   - high: ${validUrls.length >= 4 ? '4+ sources' : 'Multiple authoritative sources'}, good source diversity
   - medium: ${validUrls.length <= 2 ? 'Only ' + validUrls.length + ' sources' : 'Limited source types or gaps in coverage'}
   - low: Only vendor sources or significant gaps

SEARCH_RESULTS (the ONLY data you can use):
${JSON.stringify(searchResults, null, 2)}

REMINDER: Use ONLY the ${validUrls.length} URLs from the numbered list. Do not reference any other domains.`

    const { object } = await generateObject({
        model: azure('gpt-5.2'),
        schema: ResearchResultSchema,
        prompt,
        // Note: temperature not supported for reasoning models
    })

    // FIRST: Remove fabricated URLs before any other validation
    // Build set of normalized URLs from Perplexity for comparison
    const validNormalizedUrls = new Set(
        searchResults.map((result: any) => normalizeUrl(result.url))
    )

    // Filter out sources with URLs not from Perplexity
    const originalCount = object.evidenceLedger.length
    object.evidenceLedger = object.evidenceLedger.filter(evidence => {
        const normalizedEvidenceUrl = normalizeUrl(evidence.url)
        const isValid = validNormalizedUrls.has(normalizedEvidenceUrl)

        if (!isValid) {
            console.warn('[Research] Removing fabricated source:', {
                id: evidence.id,
                url: evidence.url,
                normalized: normalizedEvidenceUrl
            })
        }

        return isValid
    })

    if (originalCount > object.evidenceLedger.length) {
        console.log(`[Research] Removed ${originalCount - object.evidenceLedger.length} fabricated sources`)
    }

    const evidenceIds = new Set(object.evidenceLedger.map(evidence => evidence.id))
    if (object.evidenceLedger.length === 0) {
        throw new Error('Evidence verification failed: no verifiable sources returned.')
    }

    if (evidenceIds.size !== object.evidenceLedger.length) {
        throw new Error('Evidence verification failed: duplicate evidence ids detected.')
    }

    // Normalize and validate dates - accept ISO formats with timestamps and truncate to YYYY-MM-DD
    // Also backfill empty dates from search results
    const invalidDates = object.evidenceLedger.filter(evidence => {
        const dateStr = evidence.publishedDate

        // Accept YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return false // valid
        }

        // Accept ISO format with timestamp and truncate it
        if (/^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
            // Update the evidence to use truncated date
            evidence.publishedDate = dateStr.split('T')[0]
            return false // valid after normalization
        }

        // Handle empty dates - try to backfill from search results
        if (!dateStr || dateStr.trim() === '') {
            const normalizedEvidenceUrl = normalizeUrl(evidence.url)
            const matchingSearchResult = searchResults.find((result: any) =>
                normalizeUrl(result.url) === normalizedEvidenceUrl
            )

            if (matchingSearchResult && matchingSearchResult.date) {
                console.log('[Research] Backfilled missing date for:', evidence.id, 'from search results')
                evidence.publishedDate = matchingSearchResult.date
                return false // valid after backfill
            }

            // No date available - mark as invalid
            console.warn('[Research] No date available for source:', { source: evidence.id, url: evidence.url })
            return true // invalid
        }

        console.warn('[Research] Invalid date format:', { source: evidence.id, date: dateStr })
        return true // invalid
    })

    if (invalidDates.length > 0) {
        console.warn(`[Research] ${invalidDates.length} sources have invalid dates, excluding them`)
        // Remove invalid sources instead of throwing
        object.evidenceLedger = object.evidenceLedger.filter(e => !invalidDates.includes(e))
    }

    // Validate URL format
    const invalidUrls = object.evidenceLedger.filter(evidence => !/^https?:\/\//.test(evidence.url))
    if (invalidUrls.length > 0) {
        throw new Error('Evidence verification failed: one or more sources have invalid URLs.')
    }

    // Filter out statistics that reference removed/fabricated sources
    const validStatsBefore = object.keyStats.length
    object.keyStats = object.keyStats.filter(stat => evidenceIds.has(stat.sourceId))

    if (validStatsBefore > object.keyStats.length) {
        console.log(`[Research] Removed ${validStatsBefore - object.keyStats.length} stats with invalid source references`)
    }

    // If no valid stats remain, this is acceptable (schema allows min: 1 but we'll allow 0 after cleanup)
    if (object.keyStats.length === 0) {
        console.warn('[Research] No valid statistics after filtering')
    }

    return {
        summary: object.summary,
        evidenceLedger: object.evidenceLedger,
        keyStats: object.keyStats,
        gaps: object.gaps,
        confidence: object.confidence,
    }
}
