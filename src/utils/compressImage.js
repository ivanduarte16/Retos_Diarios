/**
 * Compresses an image file using canvas before upload.
 * Reduces large phone photos (3-5MB) to ~200KB without visible loss.
 *
 * @param {File} file - Image file to compress
 * @param {{ maxWidth?: number, maxHeight?: number, quality?: number }} opts
 * @returns {Promise<File>} Compressed file
 */
export default async function compressImage(file, opts = {}) {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = opts

  // Only compress raster images
  if (!file.type.startsWith('image/') || file.type === 'image/gif') {
    return file
  }

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img

      // Skip if already small enough
      if (width <= maxWidth && height <= maxHeight && file.size < 300_000) {
        resolve(file)
        return
      }

      // Scale down maintaining aspect ratio
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width))
        width = maxWidth
      }
      if (height > maxHeight) {
        width = Math.round(width * (maxHeight / height))
        height = maxHeight
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const compressed = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          })
          // Only use compressed if it's actually smaller
          resolve(compressed.size < file.size ? compressed : file)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file) // Fallback to original on error
    }

    img.src = url
  })
}
