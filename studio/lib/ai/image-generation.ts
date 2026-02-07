import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export interface GeneratedImage {
    base64: string
    mediaType: string
}

/**
 * Generate an image using Google Gemini Nano Banana (Gemini 2.5 Flash Image).
 */
export type AspectRatio = '1:1' | '16:9' | '4:5'
export type ImageModel = 'standard' | 'pro'

interface ImageGenerationOptions {
    model?: ImageModel
    aspectRatio?: AspectRatio
}

/**
 * Generate an image using Google Gemini (Nano Banana) or Imagen (Pro).
 */
export async function generateImageFromPrompt(
    prompt: string,
    options: ImageGenerationOptions = {}
): Promise<GeneratedImage> {
    if (!prompt || prompt.trim() === '') {
        throw new Error('Prompt cannot be empty')
    }

    const { model = 'standard', aspectRatio = '1:1' } = options

    console.log(`Generating image with model: ${model}, ratio: ${aspectRatio}...`)

    try {
        let modelName: string

        if (model === 'pro') {
            // Nano Banana Pro -> Gemini 3 Pro Image Preview
            modelName = 'gemini-3-pro-image-preview'
        } else {
            // Nano Banana -> Gemini 2.5 Flash Image
            modelName = 'gemini-2.5-flash-image'
        }

        console.log(`Using model ID: ${modelName} with aspect ratio ${aspectRatio}`)

        const result = await generateText({
            model: google(modelName),
            prompt: `Generate an image of: ${prompt}`,
            providerOptions: {
                google: {
                    imageConfig: {
                        aspectRatio: aspectRatio, // e.g., '16:9', '1:1', '4:5'
                    }
                }
            }
        })

        // Cast to any to access experimental properties (files/parts)
        const responseWithFiles = result as any

        // Check for files/images in the response
        if (responseWithFiles.files && responseWithFiles.files.length > 0) {
            const file = responseWithFiles.files[0]
            // Ensure it's an image
            if (file.mediaType.startsWith('image/')) {
                return {
                    base64: file.base64,
                    mediaType: file.mediaType,
                }
            }
        }

        // Fallback attempt to parse inlineData if referencing older SDK structure
        if (responseWithFiles.parts) {
            for (const part of responseWithFiles.parts) {
                if (part.inlineData) {
                    return {
                        base64: part.inlineData.data,
                        mediaType: part.inlineData.mimeType || 'image/png'
                    }
                }
            }
        }

        console.warn(`${modelName} output no images.`)
        throw new Error(`${modelName} output no images.`)

    } catch (error) {
        console.warn(`Image generation failed:`, error)
        throw new Error(`Image generation failed: ${error instanceof Error ? error.message : String(error)}`)
    }
}
