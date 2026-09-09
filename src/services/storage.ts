import imageCompression from 'browser-image-compression'
import { ASSET_BUCKET } from '../lib/defaults'
import { requireSupabase } from '../lib/supabase'

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_ORIGINAL_BYTES = 10 * 1024 * 1024

export async function prepareImage(file: File): Promise<File> {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error('Use uma imagem JPG, PNG ou WebP.')
  if (file.size > MAX_ORIGINAL_BYTES) throw new Error('A imagem deve ter no máximo 10 MB.')
  return imageCompression(file, { maxSizeMB: 1.2, maxWidthOrHeight: 1600, useWebWorker: true })
}

export async function uploadAsset(file: File, folder: 'prizes' | 'branding'): Promise<string> {
  const client = requireSupabase()
  const prepared = await prepareImage(file)
  const extension = prepared.type === 'image/png' ? 'png' : prepared.type === 'image/webp' ? 'webp' : 'jpg'
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const { error } = await client.storage.from(ASSET_BUCKET).upload(path, prepared, { contentType: prepared.type, cacheControl: '31536000' })
  if (error) throw error
  return client.storage.from(ASSET_BUCKET).getPublicUrl(path).data.publicUrl
}
