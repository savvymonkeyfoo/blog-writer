import { createClient } from '@supabase/supabase-js'

export const STORAGE_BUCKET = 'blog-images'

/**
 * Get Supabase client for storage operations
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseKey)
}

/**
 * Initialize storage bucket (run once)
 */
export async function initializeStorageBucket() {
  const supabase = getSupabaseClient()

  // Create bucket if it doesn't exist
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some(b => b.name === STORAGE_BUCKET)

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
      public: true, // Allow public access to images
      fileSizeLimit: 5242880, // 5MB limit
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    })

    if (error) {
      console.error('Failed to create storage bucket:', error)
      throw error
    }
  }

  return { bucket: STORAGE_BUCKET }
}

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
  file: { base64: string; mediaType: string },
  path: string
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseClient()

  // Convert base64 to buffer
  const base64Data = file.base64.replace(/^data:image\/\w+;base64,/, '')
  const buffer = Buffer.from(base64Data, 'base64')

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType: file.mediaType,
      upsert: true,
    })

  if (error) {
    console.error('Failed to upload image:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path)

  return {
    url: publicUrl,
    path: data.path,
  }
}

/**
 * Delete image from Supabase Storage
 */
export async function deleteImage(path: string): Promise<void> {
  const supabase = getSupabaseClient()

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([path])

  if (error) {
    console.error('Failed to delete image:', error)
    throw new Error(`Delete failed: ${error.message}`)
  }
}

/**
 * Generate unique image path
 */
export function generateImagePath(sessionId: string, promptId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${sessionId}/${promptId}-${timestamp}-${random}.png`
}
